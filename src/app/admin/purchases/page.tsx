'use client'

import { useState, useEffect } from 'react'
import { Receipt, Plus, X, Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Purchase {
  id: string
  product_name: string
  cost: number
  quantity: number
  supplier: string
  notes: string
  created_at: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ product_name: '', cost: '', quantity: '1', supplier: '', notes: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('purchases').select('*').order('created_at', { ascending: false })
    setPurchases(data || [])
    setLoading(false)
  }

  async function addPurchase(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.cost) { toast.error('Fill in product and cost'); return }
    setSaving(true)
    const { error } = await supabase.from('purchases').insert({
      product_name: form.product_name,
      cost: parseFloat(form.cost),
      quantity: parseInt(form.quantity) || 1,
      supplier: form.supplier,
      notes: form.notes,
    })
    if (error) { toast.error('Table not set up yet — run migrations'); setSaving(false); return }
    toast.success('Purchase recorded')
    setForm({ product_name: '', cost: '', quantity: '1', supplier: '', notes: '' })
    setShowAdd(false)
    setSaving(false)
    load()
  }

  const filtered = purchases.filter(p => !search || p.product_name?.toLowerCase().includes(search.toLowerCase()) || p.supplier?.toLowerCase().includes(search.toLowerCase()))
  const totalSpent = purchases.reduce((s, p) => s + (p.cost || 0) * (p.quantity || 1), 0)

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchases</h1>
          <p className="text-sm text-[var(--text-muted)]">{purchases.length > 0 ? `${purchases.length} purchases · ${formatPrice(totalSpent)} total` : 'Track your buying costs'}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-medium hover:opacity-90 transition">
          {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'Record Purchase'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addPurchase} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Purchase</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input value={form.product_name} onChange={e => setForm(f => ({...f, product_name: e.target.value}))} placeholder="Product name *" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} placeholder="Cost per unit ($) *" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} placeholder="Qty" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <input value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))} placeholder="Supplier" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} Record Purchase
          </button>
        </form>
      )}

      {!loading && purchases.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchases..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--bg-card)] rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Receipt size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">{search ? 'No matches' : 'No purchases yet'}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{search ? 'Try a different search' : 'Record purchases to track your buying costs and margins'}</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_100px_60px_120px_100px] gap-2 px-4 py-3 border-b border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">
            <span>Product</span><span>Cost</span><span>Qty</span><span>Supplier</span><span>Date</span>
          </div>
          {filtered.map(p => (
            <div key={p.id} className="grid grid-cols-[1fr_100px_60px_120px_100px] gap-2 px-4 py-3 items-center border-b border-[var(--border)] last:border-0">
              <p className="text-sm font-medium text-white truncate">{p.product_name}</p>
              <span className="text-sm font-mono text-white">{formatPrice(p.cost)}</span>
              <span className="text-sm text-[var(--text-secondary)] font-mono">{p.quantity}</span>
              <span className="text-xs text-[var(--text-muted)] truncate">{p.supplier || '—'}</span>
              <span className="text-xs text-[var(--text-muted)]">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
