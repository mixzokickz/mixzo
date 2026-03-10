'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Ticket, Users, DollarSign, Clock, Eye, Trash2, Trophy, Search, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface Raffle {
  id: string
  title: string
  product_name?: string | null
  product_image?: string | null
  entry_price: number
  status: string
  end_date: string
  start_date: string
  entry_count: number
  max_entries?: number | null
  featured: boolean
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#6A6A80]/10 text-[#6A6A80] border-[#6A6A80]/20',
  active: 'bg-[#00C2D6]/10 text-[#00C2D6] border-[#00C2D6]/20',
  drawing: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  completed: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function AdminRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all')

  useEffect(() => { loadRaffles() }, [])

  async function loadRaffles() {
    try {
      const res = await fetch('/api/raffles?all=1')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRaffles(data)
    } catch {
      toast.error('Failed to load raffles')
    }
    setLoading(false)
  }

  async function deleteRaffle(id: string) {
    if (!confirm('Are you sure you want to delete this raffle?')) return
    try {
      const res = await fetch(`/api/raffles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setRaffles((prev) => prev.filter((r) => r.id !== id))
      toast.success('Raffle deleted')
    } catch {
      toast.error('Failed to delete raffle')
    }
  }

  async function cancelRaffle(id: string) {
    try {
      const res = await fetch(`/api/raffles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) throw new Error('Failed')
      setRaffles((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r))
      toast.success('Raffle cancelled')
    } catch {
      toast.error('Failed to cancel raffle')
    }
  }

  const filtered = raffles
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      if (!search) return true
      const q = search.toLowerCase()
      return r.title.toLowerCase().includes(q) || r.product_name?.toLowerCase().includes(q)
    })

  const totalRevenue = raffles.reduce((sum, r) => sum + (r.entry_count || 0) * r.entry_price, 0)
  const totalEntries = raffles.reduce((sum, r) => sum + (r.entry_count || 0), 0)
  const activeCount = raffles.filter((r) => r.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Raffles</h1>
          <p className="text-sm text-[#6A6A80] mt-1">Manage raffle campaigns and draw winners</p>
        </div>
        <Link href="/admin/raffles/new">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white text-sm font-semibold transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Create Raffle
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Raffles', value: activeCount, icon: Ticket, color: '#00C2D6' },
          { label: 'Total Entries', value: totalEntries, icon: Users, color: '#FF2E88' },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: '#22C55E' },
          { label: 'All Raffles', value: raffles.length, icon: Clock, color: '#A855F7' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-[11px] text-[#6A6A80] uppercase tracking-wider font-medium">{label}</p>
                <p className="text-lg font-bold text-[#F4F4F4]">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A80]" />
          <input
            type="text"
            placeholder="Search raffles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141418] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[#141418] border border-[#1E1E26]">
          {(['all', 'active', 'completed', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize',
                filter === f ? 'bg-[#FF2E88] text-white' : 'text-[#6A6A80] hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#141418] border border-[#1E1E26] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-16 text-center">
          <Ticket className="w-12 h-12 text-[#1E1E26] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No raffles found</h3>
          <p className="text-sm text-[#6A6A80]">Create your first raffle to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E26]">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Raffle</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Price</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Entries</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">End Date</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((raffle) => (
                    <motion.tr
                      key={raffle.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[#1E1E26] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {raffle.product_image ? (
                            <img src={raffle.product_image} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#0F0F13]" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#0F0F13] flex items-center justify-center">
                              <Ticket className="w-4 h-4 text-[#6A6A80]" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#F4F4F4] line-clamp-1">{raffle.title}</p>
                            {raffle.product_name && (
                              <p className="text-xs text-[#6A6A80]">{raffle.product_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#F4F4F4]">${raffle.entry_price}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#A0A0B8]">
                          {raffle.entry_count || 0}
                          {raffle.max_entries ? ` / ${raffle.max_entries}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                          STATUS_STYLES[raffle.status] || STATUS_STYLES.draft
                        )}>
                          {raffle.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#A0A0B8]">
                        {new Date(raffle.end_date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/admin/raffles/${raffle.id}`}>
                            <button className="p-2 rounded-lg text-[#6A6A80] hover:text-[#00C2D6] hover:bg-[#00C2D6]/5 transition-colors cursor-pointer" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          {raffle.status === 'active' && (
                            <>
                              <Link href={`/admin/raffles/${raffle.id}`}>
                                <button className="p-2 rounded-lg text-[#6A6A80] hover:text-[#FF2E88] hover:bg-[#FF2E88]/5 transition-colors cursor-pointer" title="Draw winner">
                                  <Trophy className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => cancelRaffle(raffle.id)}
                                className="p-2 rounded-lg text-[#6A6A80] hover:text-yellow-500 hover:bg-yellow-500/5 transition-colors cursor-pointer"
                                title="Cancel raffle"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(raffle.status === 'draft' || raffle.status === 'cancelled') && (
                            <button
                              onClick={() => deleteRaffle(raffle.id)}
                              className="p-2 rounded-lg text-[#6A6A80] hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
