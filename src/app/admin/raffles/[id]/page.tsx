'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, DollarSign, Calendar, Trophy, Ticket, Search, Mail, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import { SpinWheel, type SpinWheelEntry } from '@/components/raffle/spin-wheel'

interface Raffle {
  id: string
  title: string
  description?: string | null
  entry_price: number
  max_entries?: number | null
  entries_per_person: number
  start_date: string
  end_date: string
  status: string
  product_name?: string | null
  product_image?: string | null
  product_size?: string | null
  product_retail_price?: number | null
  featured: boolean
  entry_count: number
  winner_id?: string | null
  winner_announced_at?: string | null
}

interface Entry {
  id: string
  customer_name: string
  customer_email: string
  entry_number: number
  status: string
  created_at: string
  stripe_payment_id?: string | null
}

export default function AdminRaffleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedWinner, setSelectedWinner] = useState<SpinWheelEntry | null>(null)
  const [announcing, setAnnouncing] = useState(false)
  const [tab, setTab] = useState<'entries' | 'wheel'>('entries')

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    try {
      const [raffleRes, entriesRes] = await Promise.all([
        fetch(`/api/raffles/${id}`),
        fetch(`/api/raffles/${id}/entries`),
      ])
      if (!raffleRes.ok) throw new Error('Failed to fetch raffle')
      const raffleData = await raffleRes.json()
      const entriesData = await entriesRes.json()
      setRaffle(raffleData)
      setEntries(Array.isArray(entriesData) ? entriesData : [])
    } catch {
      toast.error('Failed to load raffle data')
    }
    setLoading(false)
  }

  function handleWheelWinner(entry: SpinWheelEntry) {
    setSelectedWinner(entry)
  }

  async function announceWinner() {
    if (!selectedWinner) return
    setAnnouncing(true)
    try {
      const res = await fetch(`/api/raffles/${id}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: selectedWinner.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to announce winner')
      }
      toast.success(`Winner announced: ${selectedWinner.customer_name}`)
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to announce winner')
    }
    setAnnouncing(false)
  }

  async function drawRandomWinner() {
    try {
      const res = await fetch(`/api/raffles/${id}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to draw winner')
      }
      const data = await res.json()
      toast.success(`Winner drawn: ${data.winner.customer_name}`)
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to draw winner')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-[#141418] animate-pulse" />
        <div className="h-64 rounded-2xl bg-[#141418] animate-pulse" />
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6A6A80]">Raffle not found</p>
        <Link href="/admin/raffles" className="text-sm text-[#FF2E88] mt-2 inline-block">Back to Raffles</Link>
      </div>
    )
  }

  const confirmedEntries = entries.filter((e) => e.status === 'confirmed' || e.status === 'winner')
  const revenue = confirmedEntries.length * raffle.entry_price
  const winnerEntry = entries.find((e) => e.status === 'winner')

  const filteredEntries = entries.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.customer_name.toLowerCase().includes(q) || e.customer_email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/raffles">
          <button className="p-2 rounded-xl bg-[#141418] border border-[#1E1E26] text-[#6A6A80] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight">{raffle.title}</h1>
          <p className="text-sm text-[#6A6A80] mt-0.5">{raffle.product_name || 'No product linked'}</p>
        </div>
        <span className={cn(
          'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
          raffle.status === 'active' ? 'bg-[#00C2D6]/10 text-[#00C2D6] border-[#00C2D6]/20' :
          raffle.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
          'bg-[#6A6A80]/10 text-[#6A6A80] border-[#6A6A80]/20'
        )}>
          {raffle.status}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entries', value: confirmedEntries.length, sub: raffle.max_entries ? `/ ${raffle.max_entries}` : 'unlimited', icon: Users, color: '#FF2E88' },
          { label: 'Revenue', value: formatPrice(revenue), icon: DollarSign, color: '#22C55E' },
          { label: 'Entry Price', value: `$${raffle.entry_price}`, icon: Ticket, color: '#00C2D6' },
          { label: 'End Date', value: new Date(raffle.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: Calendar, color: '#A855F7' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-[11px] text-[#6A6A80] uppercase tracking-wider font-medium">{label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-[#F4F4F4]">{value}</p>
                  {sub && <span className="text-xs text-[#6A6A80]">{sub}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Winner Banner */}
      {winnerEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-[#FF2E88]/10 to-[#00C2D6]/10 border border-[#FF2E88]/20 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FF2E88]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#FF2E88]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#FF2E88] uppercase tracking-wider">Winner</p>
              <p className="text-lg font-bold text-[#F4F4F4]">{winnerEntry.customer_name}</p>
              <p className="text-sm text-[#A0A0B8]">{winnerEntry.customer_email} -- Entry #{winnerEntry.entry_number}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Draw Winner Section */}
      {raffle.status === 'active' && !winnerEntry && confirmedEntries.length > 0 && (
        <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#1E1E26]">
            <button
              onClick={() => setTab('entries')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                tab === 'entries' ? 'text-[#FF2E88] border-b-2 border-[#FF2E88]' : 'text-[#6A6A80] hover:text-white'
              )}
            >
              Entries
            </button>
            <button
              onClick={() => setTab('wheel')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                tab === 'wheel' ? 'text-[#FF2E88] border-b-2 border-[#FF2E88]' : 'text-[#6A6A80] hover:text-white'
              )}
            >
              Spin Wheel
            </button>
          </div>

          {tab === 'wheel' ? (
            <div className="p-6">
              <SpinWheel
                entries={confirmedEntries as SpinWheelEntry[]}
                onWinnerSelected={handleWheelWinner}
                disabled={raffle.status !== 'active'}
              />
              {selectedWinner && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={announceWinner}
                    disabled={announcing}
                    className="px-6 py-3 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {announcing ? 'Announcing...' : `Announce ${selectedWinner.customer_name} as Winner`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={drawRandomWinner}
                className="w-full py-3 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white font-semibold transition-colors cursor-pointer mb-4"
              >
                Draw Random Winner
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entries List */}
      {tab === 'entries' && (
        <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden">
          <div className="p-4 border-b border-[#1E1E26]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A80]" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
              />
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6A6A80]">
              {entries.length === 0 ? 'No entries yet' : 'No matching entries'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E1E26]">
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">#</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Name</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6A6A80]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-[#1E1E26] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-[#6A6A80]" />
                          <span className="text-sm font-medium text-[#F4F4F4]">{entry.entry_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#F4F4F4]">{entry.customer_name}</span>
                          {entry.status === 'winner' && (
                            <Trophy className="w-3.5 h-3.5 text-[#FF2E88]" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-[#6A6A80]" />
                          <span className="text-sm text-[#A0A0B8]">{entry.customer_email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          entry.status === 'winner' ? 'bg-[#FF2E88]/10 text-[#FF2E88]' :
                          entry.status === 'confirmed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                          'bg-[#6A6A80]/10 text-[#6A6A80]'
                        )}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6A6A80]">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
