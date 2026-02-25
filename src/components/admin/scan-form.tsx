'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { SIZES, CONDITIONS, CONDITION_LABELS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
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
    condition: 'new',
    price: prefill?.retailPrice?.toString() || '',
    cost: '',
    quantity: '1',
  })
  const [images, setImages] = useState<string[]>(prefill?.image ? [prefill.image] : [])
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.size || !form.price) {
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
          name: form.name,
          brand: form.brand,
          style_id: form.style_id,
          size: form.size,
          condition: form.condition,
          price: parseFloat(form.price),
          cost: form.cost ? parseFloat(form.cost) : null,
          quantity: parseInt(form.quantity) || 1,
          images: [...images, ...uploadedPhotos],
          status: 'active',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Product added')
      setForm({ name: '', brand: '', style_id: '', size: '', condition: 'new', price: '', cost: '', quantity: '1' })
      setImages([])
      setUploadedPhotos([])
      onSuccess?.()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {images.length > 0 && (
        <div className="flex justify-center">
          <img src={images[0]} alt="" className="w-32 h-32 object-contain rounded-lg border border-[var(--border)]" />
        </div>
      )}

      <div>
        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Name</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full" placeholder="Sneaker name" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Brand</label>
          <input value={form.brand} onChange={e => set('brand', e.target.value)} className="w-full" placeholder="Nike, Jordan..." />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Style ID</label>
          <input value={form.style_id} onChange={e => set('style_id', e.target.value)} className="w-full" placeholder="ABC-123" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Size</label>
          <select value={form.size} onChange={e => set('size', e.target.value)} className="w-full" required>
            <option value="">Select size</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Condition</label>
          <select value={form.condition} onChange={e => set('condition', e.target.value)} className="w-full">
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Price ($)</label>
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full" placeholder="250" required />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Cost ($)</label>
          <input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} className="w-full" placeholder="150" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Qty</label>
          <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} className="w-full" min="1" />
        </div>
      </div>

      {form.condition !== 'new' && (
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Preowned Photos</label>
          <ImageUpload images={uploadedPhotos} onChange={setUploadedPhotos} max={5} />
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-gradient text-white font-semibold py-4 rounded-xl text-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
        {saving ? 'Saving...' : 'Add Product'}
      </button>
    </form>
  )
}
