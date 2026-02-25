'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { SIZES, CONDITIONS } from '@/lib/constants'
import ImageUpload from '@/components/admin/image-upload'
import { toast } from 'sonner'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({
    name: '', brand: '', style_id: '', size: '', condition: 'new',
    price: '', cost: '', quantity: '1', description: '', status: 'active',
  })
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
      if (data) {
        setForm({
          name: data.name || '', brand: data.brand || '', style_id: data.style_id || '',
          size: data.size || '', condition: data.condition || 'new',
          price: data.price?.toString() || '', cost: data.cost?.toString() || '',
          quantity: data.quantity?.toString() || '1', description: data.description || '',
          status: data.status || 'active',
        })
        setImages(data.images || [])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: params.id,
          name: form.name, brand: form.brand, style_id: form.style_id,
          size: form.size, condition: form.condition,
          price: parseFloat(form.price), cost: form.cost ? parseFloat(form.cost) : null,
          quantity: parseInt(form.quantity) || 1, description: form.description,
          images, status: form.status,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Product updated')
      router.push('/admin/products')
    } catch {
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this product permanently?')) return
    const token = (await supabase.auth.getSession()).data.session?.access_token
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: params.id }),
    })
    toast.success('Product deleted')
    router.push('/admin/products')
  }

  const inputClass = 'w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors'

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="skeleton h-96 rounded-xl" /></div>

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Products
      </Link>

      <h1 className="text-2xl font-bold text-white">Edit Product</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Brand</label><input value={form.brand} onChange={e => set('brand', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Style ID</label><input value={form.style_id} onChange={e => set('style_id', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Size</label>
              <select value={form.size} onChange={e => set('size', e.target.value)} className={inputClass} required>
                <option value="">Select</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Condition</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)} className={inputClass}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Price ($)</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inputClass} required /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Cost ($)</label><input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Qty</label><input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} className={inputClass} min="0" /></div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} h-24 resize-none`} />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <label className="block text-xs text-[var(--text-secondary)] mb-2 font-medium">Images</label>
          <ImageUpload images={images} onChange={setImages} max={10} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDelete} className="px-4 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
