'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Keyboard, Camera, Search, Loader2, Check, X, Package, RotateCcw, ChevronDown, Link2, Sparkles, ShoppingBag, Box, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type Tab = 'scan' | 'camera' | 'search'
type ScanState = 'idle' | 'looking_up' | 'found' | 'not_found' | 'adding' | 'added'

interface ProductResult {
  id: string
  name: string
  brand: string | null
  colorway: string | null
  styleId: string | null
  size: string | null
  retailPrice: number | null
  imageUrl: string
  imageUrls: string[]
  source: 'cache' | 'goat' | 'upc'
  goatProductId?: string
}

// Standard men's sneaker sizes
const SNEAKER_SIZES = [
  '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5',
  '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5',
  '14', '14.5', '15', '16', '17', '18',
]

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>('scan')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [barcode, setBarcode] = useState('')
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null)
  const [result, setResult] = useState<ProductResult | null>(null)

  // Form fields
  const [selectedSize, setSelectedSize] = useState('')
  const [condition, setCondition] = useState<'new' | 'preowned'>('new')
  const [hasBox, setHasBox] = useState(true)
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Rapid-scan detection (barcode gun sends chars fast + Enter)
  const lastKeyTime = useRef(0)
  const rapidBuffer = useRef('')

  useEffect(() => {
    if (tab === 'scan' && scanState === 'idle') setTimeout(() => inputRef.current?.focus(), 100)
    if (tab === 'search') setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [tab, scanState])

  // ── Barcode Lookup ──
  const lookupBarcode = useCallback(async (code: string) => {
    if (!code.trim()) return
    setScanState('looking_up')
    setResult(null)

    try {
      // Step 1: Check local cache (instant)
      try {
        const cacheRes = await fetch(`/api/admin/barcode-cache?barcode=${encodeURIComponent(code)}`)
        const cacheData = await cacheRes.json()
        if (cacheData.found && cacheData.product) {
          const cp = cacheData.product
          setResult({
            id: cp.goatProductId || cp.stockxProductId || code,
            name: cp.name,
            brand: cp.brand,
            colorway: cp.colorway,
            styleId: cp.styleId,
            size: cp.size,
            retailPrice: cp.retailPrice,
            imageUrl: cp.imageUrl || '',
            imageUrls: cp.imageUrls || [],
            source: 'cache',
            goatProductId: cp.goatProductId,
          })
          if (cp.size) setSelectedSize(cp.size)
          if (cp.retailPrice) setPrice(cp.retailPrice.toString())
          setScanState('found')
          toast.success(`Found (scan #${cacheData.scanCount}): ${cp.name}`)
          return
        }
      } catch {}

      // Step 2: Search GOAT (works for style IDs and names, NOT barcodes)
      const isBarcode = /^\d{10,14}$/.test(code)

      if (!isBarcode) {
        // Style ID or name — search directly
        const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(code)}`)
        const data = await res.json()
        const products = data.products || []

        if (products.length > 0) {
          const p = products[0]
          setResult({
            id: p.id || '',
            name: p.name || '',
            brand: p.brand || null,
            colorway: p.colorway || null,
            styleId: p.styleId || p.sku || null,
            size: null,
            retailPrice: p.retailPrice || null,
            imageUrl: p.image || p.thumb || '',
            imageUrls: [p.image || p.thumb || ''].filter(Boolean),
            source: 'goat',
            goatProductId: p.id,
          })
          if (p.retailPrice) setPrice(p.retailPrice.toString())
          setScanState('found')
          toast.success(`Found: ${p.name}`)
          return
        }
      }

      // Step 3: For barcodes — try UPC lookup to get product name
      if (isBarcode) {
        try {
          const upcRes = await fetch(`/api/upc-lookup?upc=${encodeURIComponent(code)}`)
          const upcData = await upcRes.json()
          if (upcData.title || upcData.brand) {
            const searchTerm = upcData.title || upcData.brand
            const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(searchTerm)}`)
            const data = await res.json()
            if ((data.products || []).length > 0) {
              const p = data.products[0]
              const result: ProductResult = {
                id: p.id || '',
                name: p.name || '',
                brand: p.brand || null,
                colorway: p.colorway || null,
                styleId: p.styleId || p.sku || null,
                size: null,
                retailPrice: p.retailPrice || null,
                imageUrl: p.image || p.thumb || '',
                imageUrls: [p.image || p.thumb || ''].filter(Boolean),
                source: 'upc',
                goatProductId: p.id,
              }
              setResult(result)
              if (p.retailPrice) setPrice(p.retailPrice.toString())
              setScanState('found')
              toast.success(`Found via UPC: ${p.name}`)

              // Cache it for next time
              saveToCache(code, result)
              return
            }
          }
        } catch {}
      }

      // Step 4: Not found — switch to search tab with prompt to link barcode
      setScanState('not_found')
      setPendingBarcode(code)
      setSearchQuery('')
      setTab('search')
      toast('Barcode not recognized yet — search by shoe name to link it')
    } catch (err) {
      console.error('Lookup error:', err)
      setScanState('not_found')
      toast.error('Lookup failed')
    }
  }, [])

  // ── Save barcode→product to cache ──
  const saveToCache = (barcodeVal: string, product: ProductResult) => {
    fetch('/api/admin/barcode-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode: barcodeVal,
        productName: product.name,
        brand: product.brand,
        colorway: product.colorway,
        styleId: product.styleId,
        size: product.size,
        retailPrice: product.retailPrice,
        imageUrl: product.imageUrl,
        imageUrls: product.imageUrls,
        goatProductId: product.goatProductId || product.id,
      }),
    }).catch(() => {})
  }

  // ── Search ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.products || [])
      if ((data.products || []).length === 0) toast('No products found — try different keywords')
    } catch { toast.error('Search failed') }
    setSearching(false)
  }

  // ── Select from search results ──
  const handleSearchSelect = async (p: any) => {
    const product: ProductResult = {
      id: p.id || '',
      name: p.name || '',
      brand: p.brand || null,
      colorway: p.colorway || null,
      styleId: p.styleId || p.sku || null,
      size: null,
      retailPrice: p.retailPrice || null,
      imageUrl: p.image || p.thumb || '',
      imageUrls: [p.image || p.thumb || ''].filter(Boolean),
      source: 'goat',
      goatProductId: p.id,
    }

    setResult(product)
    if (p.retailPrice) setPrice(p.retailPrice.toString())
    setSelectedSize('')
    setSearchResults([])
    setTab('scan')
    setScanState('found')
    toast.success(`Selected: ${p.name}`)

    // If we came from a barcode scan, link this barcode to the product
    if (pendingBarcode) {
      saveToCache(pendingBarcode, product)
      toast.success(`Barcode ${pendingBarcode} linked! Future scans will be instant.`)
      setPendingBarcode(null)
    }
  }

  // ── Add to Inventory ──
  const handleAdd = async () => {
    if (!result || !selectedSize || !price) {
      toast.error('Fill in size and price')
      return
    }
    setScanState('adding')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        toast.error('Not authenticated — please log in again')
        setScanState('found')
        return
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: result.name,
          brand: result.brand,
          style_id: result.styleId,
          size: selectedSize,
          condition,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          quantity: parseInt(quantity) || 1,
          image_url: result.imageUrl || null,
          images: condition === 'preowned' && photos.length > 0
            ? photos
            : result.imageUrls.length > 0 ? result.imageUrls : [],
          status: 'active',
          colorway: result.colorway,
          tags: hasBox ? ['has_box'] : [],
        }),
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'Failed to add')
      toast.success('Added to inventory!')
      setScanState('added')
      setTimeout(resetScan, 2000)
    } catch {
      toast.error('Failed to add product')
      setScanState('found')
    }
  }

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) setPhotos(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const resetScan = () => {
    setScanState('idle')
    setResult(null)
    setBarcode('')
    setPendingBarcode(null)
    setSelectedSize('')
    setCondition('new')
    setHasBox(true)
    setPrice('')
    setCost('')
    setQuantity('1')
    setPhotos([])
    setSearchQuery('')
    setSearchResults([])
    setTab('scan')
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
        {(result || scanState === 'not_found') && (
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

      {/* Pending barcode banner */}
      {pendingBarcode && tab === 'search' && (
        <div className="bg-[#FF2E88]/10 border border-[#FF2E88]/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <Link2 size={18} className="text-[#FF2E88] shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Linking barcode: <span className="font-mono text-[#FF2E88]">{pendingBarcode}</span></p>
            <p className="text-xs text-[var(--text-muted)]">Search for the shoe below. When you select it, this barcode will be linked for instant future scans.</p>
          </div>
        </div>
      )}

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
              disabled={scanState === 'looking_up' || !barcode.trim()}
              className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {scanState === 'looking_up' ? <Loader2 size={18} className="animate-spin" /> : 'Look Up'}
            </button>
          </div>
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
                disabled={searching || !searchQuery.trim()}
                className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((p: any, i: number) => (
                <button
                  key={p.id || i}
                  onClick={() => handleSearchSelect(p)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--pink)]/30 transition text-left"
                >
                  {(p.image || p.thumb) ? (
                    <img src={p.image || p.thumb} alt="" className="w-16 h-16 rounded-lg object-contain bg-[var(--bg-elevated)]" />
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
                      {(p.styleId || p.sku) && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] font-mono">{p.styleId || p.sku}</span>}
                      {p.retailPrice > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--pink)]">${p.retailPrice}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-[var(--pink)] font-medium">Select →</span>
                    {pendingBarcode && <span className="text-[10px] text-[var(--text-muted)]">+ link barcode</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Camera ── */}
      {tab === 'camera' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <Camera size={48} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Camera scanning coming soon</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Use a USB barcode scanner or type the UPC manually</p>
        </div>
      )}

      {/* ── Loading ── */}
      {scanState === 'looking_up' && tab === 'scan' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={36} className="animate-spin text-[var(--pink)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Looking up product...</p>
        </div>
      )}

      {/* ── Product Found ── */}
      {scanState === 'found' && result && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-80 bg-[var(--bg-elevated)] flex items-center justify-center p-6 shrink-0">
                {result.imageUrl ? (
                  <img src={result.imageUrl} alt={result.name} className="w-full max-h-64 object-contain" />
                ) : (
                  <Package className="w-20 h-20 text-[var(--text-muted)]" />
                )}
              </div>

              <div className="flex-1 p-5 space-y-4">
                <div>
                  {result.brand && (
                    <p className="text-xs font-semibold text-[var(--pink)] uppercase tracking-widest">{result.brand}</p>
                  )}
                  <h2 className="text-xl font-bold text-white mt-1 leading-tight">{result.name}</h2>
                </div>

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
              </div>
            </div>
          </div>

          {/* Add Form */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white">Add to Inventory</h3>

            {/* Size Grid */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2.5 block font-medium">
                Size {selectedSize && <span className="text-[var(--pink)]">— {selectedSize}</span>}
              </label>
              <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
                {SNEAKER_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-semibold transition-all border',
                      selectedSize === s
                        ? 'bg-[#FF2E88] text-white border-[#FF2E88] shadow-lg shadow-[#FF2E88]/20'
                        : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40 hover:text-white'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Toggle */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2.5 block font-medium">Condition</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('new')}
                  className={cn(
                    'py-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2',
                    condition === 'new'
                      ? 'bg-[#FF2E88] text-white border-[#FF2E88]'
                      : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                  )}
                >
                  <Sparkles size={16} className={condition === 'new' ? 'animate-pulse' : ''} />
                  New / DS
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('preowned')}
                  className={cn(
                    'py-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2',
                    condition === 'preowned'
                      ? 'bg-[#FF2E88] text-white border-[#FF2E88]'
                      : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                  )}
                >
                  <ShoppingBag size={16} />
                  Preowned
                </button>
              </div>
            </div>

            {/* Has Box Toggle */}
            <button
              type="button"
              onClick={() => setHasBox(!hasBox)}
              className={cn(
                'flex items-center justify-between w-full rounded-xl px-4 py-3.5 border transition-all',
                hasBox
                  ? 'bg-[#FF2E88]/10 border-[#FF2E88]/30'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)]'
              )}
            >
              <div className="flex items-center gap-3">
                <Box size={18} className={hasBox ? 'text-[#FF2E88]' : 'text-[var(--text-muted)]'} />
                <span className={cn('text-sm font-medium', hasBox ? 'text-white' : 'text-[var(--text-secondary)]')}>
                  Has Original Box
                </span>
              </div>
              <div className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                hasBox ? 'bg-[#FF2E88]' : 'bg-[var(--border)]'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  hasBox ? 'translate-x-6' : 'translate-x-1'
                )} />
              </div>
            </button>

            {/* Photo Upload (for preowned) */}
            {condition === 'preowned' && (
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2.5 block font-medium">
                  Photos <span className="text-[var(--text-muted)]">(show actual condition)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--pink)]/40 hover:text-[var(--pink)] transition"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[10px] mt-1">Add</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            )}

            {/* Price / Cost / Qty */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Sell Price ($) *</label>
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
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Cost ($)</label>
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
                <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Qty</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* Margin */}
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
