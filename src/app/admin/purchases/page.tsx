'use client'

import { useState, useEffect } from 'react'
import { Receipt, Plus, X, Search, Loader2, DollarSign, Package, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  const totalUnits = purchases.reduce((s, p) => s + (p.quantity || 1), 0)

  const ic = 'w-full bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[#FF2E88] focus:outline-none transition-all'

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Purchases</h1>
          <p className="text-sm text-[var(--text-muted)]">Track your buying costs and suppliers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]',
            showAdd
              ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]'
              : 'bg-[#FF2E88] text-white shadow-lg shadow-[#FF2E88]/20'
          )}
        >
          {showAdd ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Record Purchase</>}
        </button>
      </div>

      {/* Stats */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-[#FF2E88]" />
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Total Spent</span>
            </div>
            <p className="text-2xl font-black text-white font-mono">{formatPrice(totalSpent)}</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-[#00C2D6]" />
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Units Bought</span>
            </div>
            <p className="text-2xl font-black text-white">{totalUnits}</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#10B981]" />
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Avg Cost</span>
            </div>
            <p className="text-2xl font-black text-white font-mono">{totalUnits > 0 ? formatPrice(totalSpent / totalUnits) : '$0'}</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            onSubmit={addPurchase}
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt size={14} className="text-[#FF2E88]" /> New Purchase
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Product *</label>
                  <input value={form.product_name} onChange={e => setForm(f => ({...f, product_name: e.target.value}))} placeholder="Product name" className={ic} required />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Cost per unit *</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} placeholder="$150" className={ic} required />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Qty</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} placeholder="1" className={ic} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))} placeholder="Optional" className={ic} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:bg-[#FF2E88]/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FF2E88]/20">
                {saving && <Loader2 size={14} className="animate-spin" />} Record Purchase
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search */}
      {!loading && purchases.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchases..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[#FF2E88] focus:outline-none transition-all" />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/5 to-[#FF2E88]/5 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center mx-auto mb-5">
              <Receipt size={32} className="text-[#A855F7]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{search ? 'No Matches' : 'No Purchases Yet'}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{search ? 'Try a different search' : 'Record purchases to track your buying costs and margins'}</p>
          </div>
        </motion.div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_100px_60px_120px_100px] gap-2 px-5 py-3 border-b border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Product</span><span>Cost</span><span>Qty</span><span>Supplier</span><span>Date</span>
          </div>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_100px_60px_120px_100px] gap-2 px-5 py-3.5 items-center border-b border-[var(--border)] last:border-0 hover:bg-white/[0.01] transition-colors"
            >
              <p className="text-sm font-semibold text-white truncate">{p.product_name}</p>
              <span className="text-sm font-mono font-bold text-white">{formatPrice(p.cost)}</span>
              <span className="text-sm text-[var(--text-secondary)] font-mono">{p.quantity}</span>
              <span className="text-xs text-[var(--text-muted)] truncate">{p.supplier || '—'}</span>
              <span className="text-xs text-[var(--text-muted)]">{new Date(p.created_at).toLocaleDateString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
