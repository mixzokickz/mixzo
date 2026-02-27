'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Sparkles, ShoppingBag, Box, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const SNEAKER_SIZES = [
  '3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5',
  '9','9.5','10','10.5','11','11.5','12','12.5','13','13.5',
  '14','14.5','15','16','17','18',
]

const BRANDS = ['Nike','Jordan','Adidas','New Balance','Yeezy','Puma','Reebok','Asics','Converse','Vans']

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [styleId, setStyleId] = useState('')
  const [colorway, setColorway] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [condition, setCondition] = useState<'new' | 'preowned'>('new')
  const [hasBox, setHasBox] = useState(true)
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [photos, setPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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

  const handleSubmit = async () => {
    if (!name || !selectedSize || !price) {
      toast.error('Fill in name, size, and price')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          style_id: styleId,
          colorway,
          size: selectedSize,
          condition,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          quantity: parseInt(quantity) || 1,
          images: photos.length > 0 ? photos : [],
          tags: hasBox ? ['has_box'] : [],
          status: 'active',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add')
      toast.success('Product added!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 page-enter max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Products
      </Link>

      <h1 className="text-2xl font-bold text-white">Add Product</h1>

      <div className="space-y-5">
        {/* Product Info */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Product Details</h3>

          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Air Jordan 4 Retro 'Bred'"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Brand</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BRANDS.slice(0, 5).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all',
                      brand === b
                        ? 'bg-[#FF2E88] text-white border-[#FF2E88]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Or type brand..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Style ID</label>
              <input
                value={styleId}
                onChange={e => setStyleId(e.target.value)}
                placeholder="DH6927-111"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none mt-[calc(1.5rem+6px+6px)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Colorway</label>
            <input
              value={colorway}
              onChange={e => setColorway(e.target.value)}
              placeholder="Black/Red"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none"
            />
          </div>
        </div>

        {/* Size Grid */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <label className="text-xs text-[var(--text-secondary)] block font-medium">
            Size * {selectedSize && <span className="text-[var(--pink)]">— {selectedSize}</span>}
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

        {/* Condition + Box */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
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

          <button
            type="button"
            onClick={() => setHasBox(!hasBox)}
            className={cn(
              'flex items-center justify-between w-full rounded-xl px-4 py-3.5 border transition-all',
              hasBox ? 'bg-[#FF2E88]/10 border-[#FF2E88]/30' : 'bg-[var(--bg-elevated)] border-[var(--border)]'
            )}
          >
            <div className="flex items-center gap-3">
              <Box size={18} className={hasBox ? 'text-[#FF2E88]' : 'text-[var(--text-muted)]'} />
              <span className={cn('text-sm font-medium', hasBox ? 'text-white' : 'text-[var(--text-secondary)]')}>Has Original Box</span>
            </div>
            <div className={cn('relative w-11 h-6 rounded-full transition-colors', hasBox ? 'bg-[#FF2E88]' : 'bg-[var(--border)]')}>
              <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200', hasBox ? 'translate-x-6' : 'translate-x-1')} />
            </div>
          </button>
        </div>

        {/* Photos */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <label className="text-xs text-[var(--text-secondary)] block font-medium">Photos</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)]">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
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
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Pricing</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Sell Price ($) *</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="250" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Cost ($)</label>
              <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="150" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block font-medium">Qty</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-3 text-sm text-white font-mono focus:border-[var(--pink)] focus:outline-none" />
            </div>
          </div>
          {price && cost && parseFloat(cost) > 0 && (
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-lg px-3 py-2">
              Margin: <span className="text-white font-medium">${(parseFloat(price) - parseFloat(cost)).toFixed(2)}</span>
              {' '}({((parseFloat(price) - parseFloat(cost)) / parseFloat(cost) * 100).toFixed(1)}%)
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !name || !selectedSize || !price}
          className="w-full bg-[#FF2E88] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
          {saving ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </div>
  )
}
