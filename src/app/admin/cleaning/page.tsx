'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Search, Filter, Camera, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface CleaningRequest {
  id: string
  customer_name: string
  customer_email: string
  service_tier: 'basic' | 'deep' | 'premium' | 'restoration'
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'shipped_back'
  price: number | null
  created_at: string
  shoe_brand: string
  shoe_model: string
  notes: string
  before_photos: string[]
  after_photos: string[]
  tracking_number: string | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  quoted: 'bg-blue-500/10 text-blue-400',
  approved: 'bg-[#00C2D6]/10 text-[#00C2D6]',
  in_progress: 'bg-[#FF2E88]/10 text-[#FF2E88]',
  completed: 'bg-green-500/10 text-green-400',
  shipped_back: 'bg-emerald-500/10 text-emerald-400',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  quoted: 'Quoted',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  shipped_back: 'Shipped Back',
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic Clean',
  deep: 'Deep Clean',
  premium: 'Premium',
  restoration: 'Restoration',
}

const ALL_STATUSES = ['pending', 'quoted', 'approved', 'in_progress', 'completed', 'shipped_back']

export default function CleaningPage() {
  const [requests, setRequests] = useState<CleaningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [statusInputs, setStatusInputs] = useState<Record<string, string>>({})

  async function updateStatus(id: string) {
    const newStatus = statusInputs[id]
    if (!newStatus) return
    setUpdatingId(id)
    const { error } = await supabase.from('cleaning_requests').update({ status: newStatus }).eq('id', id)
    if (error) toast.error('Failed to update status')
    else {
      toast.success('Status updated')
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as CleaningRequest['status'] } : r))
    }
    setUpdatingId(null)
  }

  async function updateTracking(id: string) {
    const tracking = trackingInputs[id]
    if (!tracking?.trim()) return
    setUpdatingId(id)
    const { error } = await supabase.from('cleaning_requests').update({ tracking_number: tracking.trim() }).eq('id', id)
    if (error) toast.error('Failed to save tracking')
    else {
      toast.success('Tracking number saved')
      setRequests(prev => prev.map(r => r.id === id ? { ...r, tracking_number: tracking.trim() } : r))
    }
    setUpdatingId(null)
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('cleaning_requests')
        .select('*')
        .order('created_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return r.customer_name.toLowerCase().includes(q) || r.shoe_model.toLowerCase().includes(q) || r.shoe_brand.toLowerCase().includes(q)
    }
    return true
  })

  const statusCounts = requests.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Cleaning Requests</h1>
        <p className="text-sm text-[var(--text-muted)]">{requests.length} total requests</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
          All ({requests.length})
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
            {STATUS_LABELS[s]} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or shoe..." className="w-full bg-[#141418] border border-[#1E1E26] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[#FF2E88] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#141418] border border-[#1E1E26] rounded-xl p-12 text-center">
          <Sparkles size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No cleaning requests</h2>
          <p className="text-sm text-[var(--text-secondary)]">Requests will appear here when customers submit them</p>
        </div>
      ) : (
        <div className="bg-[#141418] border border-[#1E1E26] rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E26]">
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Shoe</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Service</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <>
                    <tr
                      key={r.id}
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="border-b border-[#1E1E26] last:border-0 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{r.customer_name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{r.customer_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white">{r.shoe_model}</p>
                        <p className="text-xs text-[var(--text-muted)]">{r.shoe_brand}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A1A22] text-[var(--text-secondary)]">{TIER_LABELS[r.service_tier]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{r.price ? formatPrice(r.price) : '—'}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {expandedId === r.id ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
                      </td>
                    </tr>
                    {expandedId === r.id && (
                      <tr key={`${r.id}-detail`}>
                        <td colSpan={7} className="px-4 py-4 bg-[#0C0C0C]/50 border-b border-[#1E1E26]">
                          <div className="space-y-4">
                            {r.notes && (
                              <div>
                                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Notes</p>
                                <p className="text-sm text-[var(--text-secondary)]">{r.notes}</p>
                              </div>
                            )}
                            {r.tracking_number && (
                              <div className="flex items-center gap-2">
                                <Truck size={14} className="text-[#00C2D6]" />
                                <span className="text-sm text-white font-medium">{r.tracking_number}</span>
                              </div>
                            )}
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Before Photos</p>
                                <div className="flex gap-2">
                                  {r.before_photos.length > 0 ? r.before_photos.map((p, i) => (
                                    <img key={i} src={p} alt="" className="w-20 h-20 rounded-lg object-cover" />
                                  )) : (
                                    <div className="w-20 h-20 rounded-lg bg-[#1A1A22] border border-dashed border-[#1E1E26] flex items-center justify-center">
                                      <Camera size={16} className="text-[var(--text-muted)]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">After Photos</p>
                                <div className="flex gap-2">
                                  {r.after_photos.length > 0 ? r.after_photos.map((p, i) => (
                                    <img key={i} src={p} alt="" className="w-20 h-20 rounded-lg object-cover" />
                                  )) : (
                                    <div className="w-20 h-20 rounded-lg bg-[#1A1A22] border border-dashed border-[#1E1E26] flex items-center justify-center">
                                      <Camera size={16} className="text-[var(--text-muted)]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <select
                                className="bg-[#1A1A22] border border-[#1E1E26] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                                value={statusInputs[r.id] ?? r.status}
                                onChange={e => setStatusInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                              >
                                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                              </select>
                              <button
                                onClick={() => updateStatus(r.id)}
                                disabled={updatingId === r.id || (statusInputs[r.id] ?? r.status) === r.status}
                                className="px-3 py-2 rounded-lg bg-[#FF2E88] text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
                              >
                                Update Status
                              </button>
                              <input
                                placeholder="Add tracking number..."
                                value={trackingInputs[r.id] ?? r.tracking_number ?? ''}
                                onChange={e => setTrackingInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && updateTracking(r.id)}
                                className="flex-1 bg-[#1A1A22] border border-[#1E1E26] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[var(--text-muted)] focus:border-[#FF2E88] focus:outline-none"
                              />
                              <button
                                onClick={() => updateTracking(r.id)}
                                disabled={updatingId === r.id || !(trackingInputs[r.id]?.trim())}
                                className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-white text-xs font-medium hover:border-[#FF2E88]/30 transition disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-[#1E1E26]">
            {filtered.map(r => (
              <div key={r.id}>
                <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{r.customer_name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{r.shoe_brand} {r.shoe_model} · {TIER_LABELS[r.service_tier]}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold text-white">{r.price ? formatPrice(r.price) : '—'}</p>
                    {expandedId === r.id ? <ChevronUp size={12} className="text-[var(--text-muted)] ml-auto" /> : <ChevronDown size={12} className="text-[var(--text-muted)] ml-auto" />}
                  </div>
                </button>
                {expandedId === r.id && (
                  <div className="px-4 pb-4 space-y-3">
                    {r.notes && <p className="text-xs text-[var(--text-secondary)]">{r.notes}</p>}
                    {r.tracking_number && (
                      <div className="flex items-center gap-2">
                        <Truck size={12} className="text-[#00C2D6]" />
                        <span className="text-xs text-white">{r.tracking_number}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <select
                        className="bg-[#1A1A22] border border-[#1E1E26] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        value={statusInputs[r.id] ?? r.status}
                        onChange={e => setStatusInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button
                        onClick={() => updateStatus(r.id)}
                        disabled={updatingId === r.id || (statusInputs[r.id] ?? r.status) === r.status}
                        className="px-3 py-1.5 rounded-lg bg-[#FF2E88] text-white text-xs font-medium disabled:opacity-50"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
