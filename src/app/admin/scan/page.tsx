'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Keyboard, Search, X, Package, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIZES, CONDITIONS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import StockXSearchModal from '@/components/admin/stockx-search-modal'
import { toast } from 'sonner'

type Tab = 'type' | 'camera' | 'lookup'

interface ProductData {
  name: string
  brand: string
  styleId: string
  colorway: string
  retailPrice: number | null
  image: string
  images: string[]
  stockxProductId: string | null
  variants: Array<{ id: string; size: string; gtins: string[] }>
  detectedSize: string | null
}

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>('type')
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('new')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [hasBox, setHasBox] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tab === 'type') setTimeout(() => inputRef.current?.focus(), 100)
  }, [tab])

  async function lookupBarcode(code: string) {
    if (!code.trim()) return
    setLoading(true)
    setProduct(null)
    try {
      const res = await fetch(`/api/upc-lookup?upc=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.found && data.product) {
        const p = data.product
        setProduct({
          name: p.name || '',
          brand: p.brand || '',
          styleId: p.styleId || '',
          colorway: p.colorway || '',
          retailPrice: p.retailPrice || null,
          image: p.image || '',
          images: p.images || [],
          stockxProductId: p.stockxProductId || null,
          variants: p.variants || [],
          detectedSize: p.detectedSize || null,
        })
        if (p.retailPrice) setPrice(p.retailPrice.toString())
        if (p.detectedSize) setSize(p.detectedSize)
        toast.success(`Found: ${p.name}`)
      } else {
        toast.error('Product not found. Try StockX search.')
      }
    } catch {
      toast.error('Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  function handleStockXSelect(p: any) {
    setProduct({
      name: p.name || '',
      brand: p.brand || '',
      styleId: p.styleId || '',
      colorway: p.colorway || '',
      retailPrice: p.retailPrice || null,
      image: p.image || p.thumb || '',
      images: [p.image, p.thumb].filter(Boolean),
      stockxProductId: p.id || null,
      variants: [],
      detectedSize: null,
    })
    if (p.retailPrice) setPrice(p.retailPrice.toString())
    setShowModal(false)
    toast.success(`Selected: ${p.name}`)
  }

  async function handleSave() {
    if (!product?.name || !size || !price) {
      toast.error('Fill in name, size, and price')
      return
    }
    setSaving(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand,
          style_id: product.styleId,
          size,
          condition,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          quantity: parseInt(quantity) || 1,
          images: product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
          status: 'active',
          has_box: hasBox,
          colorway: product.colorway,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Product added to inventory!')
      // Reset
      setProduct(null)
      setBarcode('')
      setSize('')
      setCondition('new')
      setPrice('')
      setCost('')
      setQuantity('1')
      setHasBox(true)
      inputRef.current?.focus()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'type' as Tab, label: 'Type / Scan Gun', icon: Keyboard },
    { id: 'camera' as Tab, label: 'Camera', icon: Camera },
    { id: 'lookup' as Tab, label: 'StockX Search', icon: Search },
  ]

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan Product</h1>
        <p className="text-sm text-[var(--text-muted)]">Scan a barcode, type a UPC, or search StockX</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); if (id === 'lookup') setShowModal(true) }}
            className={cn(
              'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-medium transition-all',
              tab === id
                ? 'bg-[#FF2E88] text-white border-transparent'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
            )}
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Barcode Input */}
      {!product && tab !== 'lookup' && (
        <form onSubmit={(e) => { e.preventDefault(); lookupBarcode(barcode) }} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">UPC / Barcode / Style ID</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Scan or type barcode..."
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-lg text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Look Up'}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[var(--pink)]" />
        </div>
      )}

      {/* Product Found */}
      {product && !loading && (
        <div className="space-y-4">
          {/* Product Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-72 aspect-square bg-[var(--bg-elevated)] flex items-center justify-center p-4 shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-16 h-16 text-[var(--text-muted)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-5 space-y-3">
                <div>
                  {product.brand && <p className="text-xs text-[var(--pink)] font-medium uppercase tracking-wider">{product.brand}</p>}
                  <h2 className="text-lg font-bold text-white mt-1">{product.name}</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.styleId && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-secondary)]">
                      {product.styleId}
                    </span>
                  )}
                  {product.colorway && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)]">
                      {product.colorway}
                    </span>
                  )}
                  {product.retailPrice && (
                    <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)]">
                      Retail: ${product.retailPrice}
                    </span>
                  )}
                </div>

                {/* Available Sizes (from StockX variants) */}
                {product.variants.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Available Sizes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.variants
                        .filter(v => v.size)
                        .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
                        .map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSize(v.size)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                              size === v.size
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

                <button onClick={() => { setProduct(null); setBarcode('') }} className="text-xs text-[var(--text-muted)] hover:text-white transition mt-2">
                  ← Scan another
                </button>
              </div>
            </div>
          </div>

          {/* Add to Inventory Form */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Add to Inventory</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Size *</label>
                {product.variants.length === 0 ? (
                  <select value={size} onChange={e => setSize(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white" required>
                    <option value="">Select</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input value={size} readOnly className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono" placeholder="Pick above" />
                )}
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white">
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Price ($) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white" placeholder="250" required />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Cost ($)</label>
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white" placeholder="150" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Qty</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white" min="1" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setHasBox(!hasBox)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all',
                  hasBox
                    ? 'bg-[#FF2E88]/10 border-[#FF2E88]/30 text-white'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]'
                )}
              >
                {hasBox ? <Check size={16} className="text-[#FF2E88]" /> : <Package size={16} />}
                Has Box
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !size || !price}
              className="w-full bg-[#FF2E88] text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
              {saving ? 'Adding...' : 'Add to Inventory'}
            </button>
          </div>
        </div>
      )}

      <StockXSearchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleStockXSelect}
      />
    </div>
  )
}
