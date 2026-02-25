'use client'

import { useEffect, useState } from 'react'
import { Gift, Plus, Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'

interface GiftCard {
  id: string; code: string; value: number; balance: number; active: boolean; expires_at: string | null; created_at: string;
}

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ code: '', value: '', expires_at: '' })

  const load = async () => {
    const { data } = await supabase.from('gift_cards').select('*').order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.code || !form.value) return
    const val = parseFloat(form.value)
    await supabase.from('gift_cards').insert({ code: form.code.toUpperCase(), value: val, balance: val, active: true, expires_at: form.expires_at || null })
    setForm({ code: '', value: '', expires_at: '' })
    setShowCreate(false)
    load()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('gift_cards').update({ active: !active }).eq('id', id)
    load()
  }

  const filtered = cards.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gift Cards</h1>
          <p className="text-sm text-[var(--text-muted)]">{cards.length} gift cards</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">
          <Plus size={16} /> Create Gift Card
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">New Gift Card</h3>
            <button onClick={() => setShowCreate(false)}><X size={16} className="text-[var(--text-muted)]" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="Code (e.g. GIFT50)" className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none uppercase" />
            <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Value ($)" className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <input type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--pink)] focus:outline-none [color-scheme:dark]" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">Create</button>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Gift size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No gift cards yet</h2>
          <p className="text-sm text-[var(--text-secondary)]">Create your first gift card above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-[var(--pink)]/10"><Gift size={18} className="text-[var(--pink)]" /></div>
                <div>
                  <p className="text-sm font-mono font-semibold text-white">{c.code}</p>
                  <p className="text-xs text-[var(--text-muted)]">Value: {formatPrice(c.value)} · Balance: {formatPrice(c.balance)}{c.expires_at ? ` · Expires: ${formatDate(c.expires_at)}` : ''}</p>
                </div>
              </div>
              <button onClick={() => toggleActive(c.id, c.active)} className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${c.active ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
