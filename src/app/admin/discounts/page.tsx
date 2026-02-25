'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tag, Plus, Trash2, Copy } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Discount {
  id: string; code: string; type: 'percentage' | 'fixed'; value: number;
  min_order: number; max_uses: number; used: number; active: boolean;
  expires_at: string | null; created_at: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false })
    setDiscounts(data || [])
    setLoading(false)
  }

  async function createDiscount(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('discounts').insert({
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order: form.min_order ? parseFloat(form.min_order) : 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: true, used: 0,
    })
    if (error) toast.error('Failed to create discount')
    else { toast.success('Discount created'); setShowForm(false); loadData() }
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('discounts').update({ active: !active }).eq('id', id)
    loadData()
  }

  async function deleteDiscount(id: string) {
    if (!confirm('Delete this discount code?')) return
    await supabase.from('discounts').delete().eq('id', id)
    toast.success('Deleted')
    loadData()
  }

  const ic = 'w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none'

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Discount Codes</h1>
          <p className="text-sm text-[var(--text-muted)]">{discounts.length} codes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> New Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={createDiscount} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Code</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="SAVE20" className={`${ic} uppercase font-mono`} required /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={ic}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Value</label><input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder={form.type === 'percentage' ? '20' : '25'} className={ic} required /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Min Order</label><input type="number" value={form.min_order} onChange={e => setForm({...form, min_order: e.target.value})} placeholder="0" className={ic} /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Max Uses</label><input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} placeholder="Unlimited" className={ic} /></div>
          </div>
          <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Expires</label><input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} className={ic} /></div>
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
        </form>
      )}

      {discounts.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Tag size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No discount codes</h2>
          <p className="text-sm text-[var(--text-secondary)]">Create codes to offer discounts to customers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discounts.map(d => (
            <div key={d.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success('Copied') }} className="font-mono text-sm font-bold text-[var(--pink)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[var(--pink)]/10">
                  {d.code} <Copy size={12} />
                </button>
                <div>
                  <p className="text-sm text-white">{d.type === 'percentage' ? `${d.value}% off` : `${formatPrice(d.value)} off`}</p>
                  <p className="text-xs text-[var(--text-muted)]">Used {d.used}{d.max_uses ? `/${d.max_uses}` : ''} times</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(d.id, d.active)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${d.active ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                  {d.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => deleteDiscount(d.id)} className="text-[var(--text-muted)] hover:text-red-400 p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
