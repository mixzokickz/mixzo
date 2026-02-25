'use client'

import { useState } from 'react'
import { Loader2, Plus, Minus } from 'lucide-react'
import { SIZES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import ImageUpload from './image-upload'
import { toast } from 'sonner'

interface ScanFormProps {
  prefill?: {
    name?: string
    brand?: string
    styleId?: string
    image?: string
    retailPrice?: number
  }
  onSuccess?: () => void
}

export default function ScanForm({ prefill, onSuccess }: ScanFormProps) {
  const [form, setForm] = useState({
    name: prefill?.name || '',
    brand: prefill?.brand || '',
    style_id: prefill?.styleId || '',
    size: '',
    condition: 'new' as 'new' | 'used',
    price: prefill?.retailPrice?.toString() || '',
    cost: '',
    quantity: 1,
  })
  const [images, setImages] = useState<string[]>(prefill?.image ? [prefill.image] : [])
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { toast.error('Product name is required'); return }
    if (!form.size) { toast.error('Please select a size'); return }
    if (!form.price) { toast.error('Please enter a price'); return }

    setSaving(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          style_id: form.style_id,
          size: form.size,
          condition: form.condition,
          price: parseFloat(form.price),
          cost: form.cost ? parseFloat(form.cost) : null,
          quantity: form.quantity,
          images: [...images, ...uploadedPhotos],
          status: 'active',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSuccess?.()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Product image preview */}
      {images.length > 0 && (
        <div className="flex justify-center">
          <img src={images[0]} alt="" className="w-36 h-36 object-contain rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]" />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Product Name</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
          placeholder="e.g. Air Jordan 1 Retro High OG"
          required
        />
      </div>

      {/* Brand + Style ID */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Brand</label>
          <input
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
            placeholder="Nike, Jordan..."
          />
        </div>
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Style ID</label>
          <input
            value={form.style_id}
            onChange={e => set('style_id', e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors font-mono"
            placeholder="DZ5485-612"
          />
        </div>
      </div>

      {/* Size selector — grid of buttons */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Size</label>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto pr-1">
          {SIZES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set('size', s)}
              className={cn(
                'py-3 rounded-lg text-sm font-medium border transition-all duration-150',
                form.size === s
                  ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white border-transparent'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {!form.size && <p className="text-xs text-[var(--text-muted)] mt-2">Select a size</p>}
      </div>

      {/* Condition toggle */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Condition</label>
        <div className="grid grid-cols-2 gap-3">
          {(['new', 'used'] as const).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('condition', c)}
              className={cn(
                'py-4 rounded-xl text-base font-semibold border-2 transition-all duration-200',
                form.condition === c
                  ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white border-transparent'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
              )}
            >
              {c === 'new' ? 'New' : 'Preowned'}
            </button>
          ))}
        </div>
      </div>

      {/* Preowned photos */}
      {form.condition === 'used' && (
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Preowned Photos (max 5)</label>
          <ImageUpload images={uploadedPhotos} onChange={setUploadedPhotos} max={5} />
        </div>
      )}

      {/* Price + Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Price ($)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => set('price', e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-xl font-semibold text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
            placeholder="250"
            required
          />
        </div>
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Cost ($)</label>
          <input
            type="number"
            value={form.cost}
            onChange={e => set('cost', e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-xl font-semibold text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
            placeholder="150"
          />
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block font-medium">Quantity</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
            className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-white hover:border-[var(--pink)]/30 transition-colors"
          >
            <Minus size={20} />
          </button>
          <span className="text-2xl font-bold text-white min-w-[3ch] text-center">{form.quantity}</span>
          <button
            type="button"
            onClick={() => set('quantity', form.quantity + 1)}
            className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-white hover:border-[var(--pink)]/30 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white font-bold py-5 rounded-2xl text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
      >
        {saving ? <Loader2 size={22} className="animate-spin" /> : null}
        {saving ? 'Adding...' : 'Add to Inventory'}
      </button>
    </form>
  )
}
