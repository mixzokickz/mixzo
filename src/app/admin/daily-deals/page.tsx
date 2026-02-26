'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Flame, Plus, Trash2, Calendar, Clock, X, DollarSign, TrendingDown, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
    else { toast.success('Deal created!'); setShowForm(false); setForm({ product_id: '', deal_price: '', starts_at: '', ends_at: '' }); loadData() }
    setSaving(false)
  }

  async function deleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return
    await supabase.from('daily_deals').delete().eq('id', id)
    toast.success('Deal deleted')
    loadData()
  }

  const ic = 'w-full bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[#FF2E88] focus:outline-none transition-all'

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      </div>
    )
  }

  const activeDeals = deals.filter(d => d.active).length

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2E88] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#FF2E88]/20">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Daily Deals</h1>
            <p className="text-sm text-[var(--text-muted)]">{activeDeals} active deal{activeDeals !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]',
            showForm
              ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]'
              : 'bg-[#FF2E88] text-white shadow-lg shadow-[#FF2E88]/20'
          )}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Deal</>}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            onSubmit={createDeal}
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF2E88]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap size={14} className="text-[#F59E0B]" /> Create Deal
                </h3>
                <div className="mt-4">
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Product</label>
                  <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className={ic} required>
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Deal Price</label>
                    <input type="number" step="0.01" value={form.deal_price} onChange={e => setForm({...form, deal_price: e.target.value})} placeholder="$99" className={ic} required />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Start</label>
                    <input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} className={ic} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">End</label>
                    <input type="datetime-local" value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})} className={ic} />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:bg-[#FF2E88]/90 transition-all disabled:opacity-50 shadow-lg shadow-[#FF2E88]/20">
                  {saving ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Deals List */}
      {deals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E88]/5 to-[#F59E0B]/5 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF2E88]/15 to-[#F59E0B]/15 border border-[#FF2E88]/20 flex items-center justify-center mx-auto mb-5">
              <Flame size={32} className="text-[#FF2E88]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No Deals Yet</h2>
            <p className="text-sm text-[var(--text-secondary)]">Create a deal to offer special pricing on products</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {deals.map((deal, i) => {
            const discount = deal.original_price > 0
              ? Math.round((1 - deal.deal_price / deal.original_price) * 100)
              : 0
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between hover:border-[var(--border)]/80 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF2E88]/10 to-[#F59E0B]/10 border border-[#FF2E88]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Flame size={20} className="text-[#FF2E88]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{deal.product?.name || 'Unknown Product'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[var(--text-muted)] line-through">{formatPrice(deal.original_price)}</span>
                      <span className="text-sm text-[#FF2E88] font-black">{formatPrice(deal.deal_price)}</span>
                      {discount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FF2E88]/10 text-[#FF2E88] border border-[#FF2E88]/20">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-xs px-3 py-1.5 rounded-xl font-bold border',
                    deal.active
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]'
                  )}>
                    {deal.active ? 'Live' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
