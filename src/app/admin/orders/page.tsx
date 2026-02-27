'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Plus, ShoppingCart, Filter } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Order {
  id: string; created_at: string; status: string; total: number;
  customer_name: string; customer_email: string; items: Array<{ name: string; quantity: number }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return o.id.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q)
    }
    return true
  })

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {} as Record<string, number>)

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-32" /><div className="skeleton h-12 w-full rounded-xl" /><div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-[var(--text-muted)]">{orders.length} total orders</p>
        </div>
        <Link href="/admin/orders/new" className="bg-[#FF2E88] hover:opacity-90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Create Order
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setStatusFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors', statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white')}>
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-colors', statusFilter === s ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white')}>
            {s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <ShoppingCart size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No orders found</h2>
          <p className="text-sm text-[var(--text-secondary)]">Orders will appear here when customers purchase</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const itemCount = order.items?.reduce((s: number, i: { quantity: number }) => s + (i.quantity || 1), 0) || 0
            return (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--pink)]/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-[var(--text-muted)]">{order.customer_name || 'Guest'} &middot; {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'shipped' ? 'bg-cyan-500/10 text-cyan-400' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                      order.status === 'processing' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>{order.status}</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
