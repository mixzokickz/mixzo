'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Keyboard, Camera, Search, Loader2, Check, X, Package, RotateCcw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { ScanResult, ScanState, StockXVariant } from '@/types/barcode'

type Tab = 'scan' | 'camera' | 'search'

const CONDITIONS = [
  { value: 'new', label: 'New / DS' },
  { value: 'used_like_new', label: 'Used - Like New' },
  { value: 'used_good', label: 'Used - Good' },
  { value: 'used_fair', label: 'Used - Fair' },
]

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>('scan')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)

  // Form fields
  const [selectedSize, setSelectedSize] = useState('')
  const [condition, setCondition] = useState('new')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [quantity, setQuantity] = useState('1')
  // Search modal
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tab === 'scan') setTimeout(() => inputRef.current?.focus(), 100)
    if (tab === 'search') setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [tab])

  // ── Barcode Lookup Flow (matches Dave's with local cache) ──
  const lookupBarcode = useCallback(async (code: string) => {
    if (!code.trim()) return
    setScanState('looking_up')
    setResult(null)

    try {
      // Step 0: Check local barcode cache first (instant!)
      try {
        const cacheRes = await fetch(`/api/admin/barcode-cache?barcode=${encodeURIComponent(code)}`)
        const cacheData = await cacheRes.json()
        if (cacheData.found && cacheData.product) {
          const cp = cacheData.product
          setResult({
            source: 'stockx',
            barcode: code,
            productName: cp.name,
            brand: cp.brand,
            colorway: cp.colorway,
            styleId: cp.styleId,
            size: cp.size,
            retailPrice: cp.retailPrice,
            imageUrl: cp.imageUrl,
            imageUrls: cp.imageUrls || [],
            stockxProductId: cp.stockxProductId,
            variants: [],
            marketData: null,
          })
          if (cp.size) setSelectedSize(cp.size)
          if (cp.retailPrice) setPrice(cp.retailPrice.toString())
          setScanState('found')
          toast.success(`Found (cached, scan #${cacheData.scanCount}): ${cp.name}`)
          return
        }
      } catch {}

      // Step 1: Search directly (works for style IDs, names)
      let res = await fetch(`/api/stockx/search?q=${encodeURIComponent(code)}`)
      let data = await res.json()
      let products = data.products || []

      // Step 2: If numeric barcode and no results, try multiple UPC sources
      if (products.length === 0 && /^\d{10,14}$/.test(code)) {
        // Try UPCitemdb
        const upcRes = await fetch(`/api/upc-lookup?upc=${encodeURIComponent(code)}`)
        const upcData = await upcRes.json()
        if (upcData.title || upcData.brand) {
          const searchTerm = upcData.title || upcData.brand
          res = await fetch(`/api/stockx/search?q=${encodeURIComponent(searchTerm)}`)
          data = await res.json()
          products = data.products || []
        }

        // Still nothing? Show the search tab with a prompt
        if (products.length === 0) {
          setScanState('not_found')
          toast.error('Barcode not in database — use Search tab to find the shoe by name')
          setTab('search')
          return
        }
      }

      if (products.length === 0) {
        setScanState('not_found')
        toast.error('Product not found')
        return
      }

      const p = products[0]

      // Step 3: Get full product details + variants
      let variants: StockXVariant[] = []
      let imageUrl = p.imageUrl || p.image || p.thumb || ''
      let imageUrls = [imageUrl].filter(Boolean)
      let detectedSize: string | null = null

      if (p.id) {
        try {
          const detailRes = await fetch(`/api/stockx/product/${p.id}`)
          if (detailRes.ok) {
            const detail = await detailRes.json()
            if (detail.imageUrl) {
              imageUrl = detail.imageUrl
              imageUrls = detail.imageUrls || [detail.imageUrl]
            }
            if (detail.variants) {
              variants = detail.variants

              // Match barcode to specific variant/size
              if (/^\d{10,14}$/.test(code)) {
                for (const v of variants) {
                  if (v.gtins?.includes(code)) {
                    detectedSize = v.size
                    break
                  }
                }
              }
            }
          }
        } catch {}
      }

      const scanResult: ScanResult = {
        source: 'stockx',
        barcode: code,
        productName: p.name || p.title || '',
        brand: p.brand || null,
        colorway: p.colorway || null,
        styleId: p.sku || p.styleId || null,
        size: detectedSize,
        retailPrice: p.retailPrice || null,
        imageUrl,
        imageUrls,
        stockxProductId: p.id || null,
        variants,
        marketData: null,
      }

      setResult(scanResult)
      if (detectedSize) setSelectedSize(detectedSize)
      if (p.retailPrice) setPrice(p.retailPrice.toString())
      setScanState('found')
      toast.success(`Found: ${scanResult.productName}`)

      // Save to local cache for faster future lookups
      fetch('/api/admin/barcode-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: code,
          productName: scanResult.productName,
          brand: scanResult.brand,
          colorway: scanResult.colorway,
          styleId: scanResult.styleId,
          size: detectedSize,
          retailPrice: scanResult.retailPrice,
          imageUrl: scanResult.imageUrl,
          imageUrls: scanResult.imageUrls,
          stockxProductId: scanResult.stockxProductId,
        }),
      }).catch(() => {}) // fire and forget
    } catch (err) {
      console.error('Lookup error:', err)
      setScanState('not_found')
      toast.error('Lookup failed')
    }
  }, [])

  // ── Search Flow ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.products || [])
      if ((data.products || []).length === 0) toast('No products found')
    } catch { toast.error('Search failed') }
    setSearching(false)
  }

  const handleSearchSelect = async (p: any) => {
    setTab('scan')
    setBarcode(p.sku || p.name)
    await lookupBarcode(p.sku || p.name)
  }

  // ── Add to Inventory ──
  const handleAdd = async () => {
    if (!result || !selectedSize || !price) {
      toast.error('Fill in size and price')
      return
    }
    setScanState('adding')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: result.productName,
          brand: result.brand,
          style_id: result.styleId,
          size: selectedSize,
          condition,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          quantity: parseInt(quantity) || 1,
          images: result.imageUrls.length > 0 ? result.imageUrls : [],
          status: 'active',
          colorway: result.colorway,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Added to inventory!')
      setScanState('added')
      // Auto-reset after 2s
      setTimeout(resetScan, 2000)
    } catch {
      toast.error('Failed to add product')
      setScanState('found')
    }
  }

  const resetScan = () => {
    setScanState('idle')
    setResult(null)
    setBarcode('')
    setSelectedSize('')
    setCondition('new')
    setPrice('')
    setCost('')
    setQuantity('1')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const tabs = [
    { id: 'scan' as Tab, label: 'Scan / Type', icon: Keyboard },
    { id: 'camera' as Tab, label: 'Camera', icon: Camera },
    { id: 'search' as Tab, label: 'Search', icon: Search },
  ]

  return (
    <div className="space-y-5 page-enter max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Product</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Scan a barcode, type a UPC/style ID, or search</p>
        </div>
        {result && (
          <button onClick={resetScan} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition">
            <RotateCcw size={14} /> New Scan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
              tab === id
                ? 'bg-[#FF2E88] text-white border-transparent'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Scan / Type ── */}
      {tab === 'scan' && scanState !== 'found' && scanState !== 'added' && (
        <form
          onSubmit={(e) => { e.preventDefault(); lookupBarcode(barcode) }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5"
        >
          <label className="block text-xs text-[var(--text-secondary)] mb-2 font-medium">UPC / Barcode / Style ID</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupBarcode(barcode) } }}
              placeholder="Scan with gun or type..."
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-lg text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none font-mono tracking-wider"
              autoFocus
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={scanState === 'looking_up'}
              className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {scanState === 'looking_up' ? <Loader2 size={18} className="animate-spin" /> : 'Look Up'}
            </button>
          </div>
          {scanState === 'not_found' && (
            <p className="text-sm text-red-400 mt-3">
              Not found. Try the <button type="button" onClick={() => setTab('search')} className="text-[var(--pink)] underline">Search</button> tab.
            </p>
          )}
        </form>
      )}

      {/* ── Tab: Search ── */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <label className="block text-xs text-[var(--text-secondary)] mb-2 font-medium">Search by Name or Style ID</label>
            <div className="flex gap-3">
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                placeholder="Jordan 4 Retro, DH6927-111..."
                className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => handleSearchSelect(p)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--pink)]/30 transition text-left"
                >
                  {(p.imageUrl || p.image || p.thumb) ? (
                    <img src={p.imageUrl || p.image || p.thumb} alt="" className="w-16 h-16 rounded-lg object-contain bg-[var(--bg-elevated)]" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                      <Package size={20} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {p.brand}{p.colorway ? ` · ${p.colorway}` : ''}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {p.sku && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] font-mono">{p.sku}</span>}
                      {p.retailPrice > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--pink)]">${p.retailPrice}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--pink)] font-medium shrink-0">Select →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Loading ── */}
      {scanState === 'looking_up' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={36} className="animate-spin text-[var(--pink)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Looking up product...</p>
        </div>
      )}

      {/* ── Product Found ── */}
      {scanState === 'found' && result && (
        <div className="space-y-4">
          {/* Product Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-80 bg-[var(--bg-elevated)] flex items-center justify-center p-6 shrink-0">
                {result.imageUrl ? (
                  <img src={result.imageUrl} alt={result.productName} className="w-full max-h-64 object-contain" />
                ) : (
                  <Package className="w-20 h-20 text-[var(--text-muted)]" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-5 space-y-4">
                <div>
                  {result.brand && (
                    <p className="text-xs font-semibold text-[var(--pink)] uppercase tracking-widest">{result.brand}</p>
                  )}
                  <h2 className="text-xl font-bold text-white mt-1 leading-tight">{result.productName}</h2>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {result.styleId && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-secondary)]">
                      {result.styleId}
                    </span>
                  )}
                  {result.colorway && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)]">
                      {result.colorway}
                    </span>
                  )}
                  {result.retailPrice != null && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)]">
                      Retail: ${result.retailPrice}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-[10px] text-[var(--text-muted)] uppercase">
                    via {result.source}
                  </span>
                </div>

                {/* Size Selection */}
                {result.variants.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                      Select Size {result.size && <span className="text-[var(--pink)]">(auto-detected: {result.size})</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.variants
                        .filter(v => v.size)
                        .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
                        .map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedSize(v.size)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                              selectedSize === v.size
                                ? 'bg-[#FF2E88] text-white border-transparent'
                                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                            )}
                          >
                            {v.size}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Add Form */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Add to Inventory</h3>

            {/* Size (manual if no variants) */}
            {result.variants.length === 0 && (
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Size *</label>
                <input
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  placeholder="e.g. 10.5"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--pink)] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white appearance-none"
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Sell Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none"
                  placeholder="250"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none"
                  placeholder="150"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Qty</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* Margin indicator */}
            {price && cost && parseFloat(cost) > 0 && (
              <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-lg px-3 py-2">
                Margin: <span className="text-white font-medium">${(parseFloat(price) - parseFloat(cost)).toFixed(2)}</span>
                {' '}({((parseFloat(price) - parseFloat(cost)) / parseFloat(cost) * 100).toFixed(1)}%)
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={(scanState as string) === 'adding' || !selectedSize || !price}
              className="w-full bg-[#FF2E88] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40"
            >
              {(scanState as string) === 'adding' ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
              {(scanState as string) === 'adding' ? 'Adding...' : 'Add to Inventory'}
            </button>
          </div>
        </div>
      )}

      {/* ── Added Success ── */}
      {scanState === 'added' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Product Added!</h3>
          <p className="text-sm text-[var(--text-muted)]">Scanning next product...</p>
        </div>
      )}
    </div>
  )
}
