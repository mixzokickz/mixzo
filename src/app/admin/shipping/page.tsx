'use client'

import { useState, useEffect } from 'react'
import { Truck, Package, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function ShippingPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter === 'pending') query = query.in('status', ['pending', 'confirmed', 'processing'])
    else if (filter === 'shipped') query = query.eq('status', 'shipped')
    else if (filter === 'delivered') query = query.eq('status', 'delivered')
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Shipping</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage order fulfillment and tracking</p>
      </div>

      <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {[['pending','Needs Shipping'],['shipped','Shipped'],['delivered','Delivered'],['all','All']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === val ? 'bg-[#FF2E88] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--bg-card)] rounded-xl shimmer" />)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Truck size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">{filter === 'all' ? 'No orders yet' : 'Nothing to show'}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{filter === 'pending' ? 'No orders waiting to ship' : 'Orders will appear here once placed'}</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                  <Package size={18} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{o.order_number || o.id?.slice(0,8)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{o.customer_name || o.customer_email} · {Array.isArray(o.items) ? o.items.length : 0} items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white">{formatPrice(o.total || 0)}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  o.status === 'shipped' ? 'text-[var(--cyan)] bg-[var(--cyan)]/10' :
                  o.status === 'delivered' ? 'text-green-400 bg-green-500/10' :
                  'text-yellow-400 bg-yellow-500/10'
                }`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
