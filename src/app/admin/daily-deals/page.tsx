'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Flame, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Deal {
  id: string; product_id: string; original_price: number; deal_price: number;
  starts_at: string; ends_at: string; active: boolean;
  product?: { name: string; images: string[] };
}

export default function DailyDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; images: string[] }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ product_id: '', deal_price: '', starts_at: '', ends_at: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: d }, { data: p }] = await Promise.all([
      supabase.from('daily_deals').select('*, product:products(name, images)').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, price, images').eq('status', 'active'),
    ])
    setDeals(d || [])
    setProducts(p || [])
    setLoading(false)
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const product = products.find(p => p.id === form.product_id)
    const { error } = await supabase.from('daily_deals').insert({
      product_id: form.product_id,
      original_price: product?.price || 0,
      deal_price: parseFloat(form.deal_price),
      starts_at: form.starts_at || new Date().toISOString(),
      ends_at: form.ends_at || new Date(Date.now() + 86400000).toISOString(),
      active: true,
    })
    if (error) toast.error('Failed to create deal')
    else { toast.success('Deal created'); setShowForm(false); setForm({ product_id: '', deal_price: '', starts_at: '', ends_at: '' }); loadData() }
    setSaving(false)
  }

  async function deleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return
    await supabase.from('daily_deals').delete().eq('id', id)
    toast.success('Deal deleted')
    loadData()
  }

  const ic = 'w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none'

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Deals</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage drops and special pricing</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> New Deal
        </button>
      </div>

      {showForm && (
        <form onSubmit={createDeal} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Deal</h2>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5">Product</label>
            <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className={ic} required>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Deal Price</label><input type="number" value={form.deal_price} onChange={e => setForm({...form, deal_price: e.target.value})} className={ic} required /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Start</label><input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} className={ic} /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">End</label><input type="datetime-local" value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})} className={ic} /></div>
          </div>
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Deal'}
          </button>
        </form>
      )}

      {deals.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Flame size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No deals yet</h2>
          <p className="text-sm text-[var(--text-secondary)]">Create a deal to offer special pricing on products</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deals.map(deal => (
            <div key={deal.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                  <Flame size={18} className="text-[var(--pink)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{deal.product?.name || 'Unknown'}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="line-through">{formatPrice(deal.original_price)}</span>{' '}
                    <span className="text-[var(--pink)] font-semibold">{formatPrice(deal.deal_price)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${deal.active ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                  {deal.active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => deleteDeal(deal.id)} className="text-[var(--text-muted)] hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
