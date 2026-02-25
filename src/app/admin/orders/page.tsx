'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_id: string
  status: string
  total: number
  created_at: string
  customer_name: string
  customer_email: string
  items: any[]
  shipping_address: any
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const statusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'text-green-400 bg-green-400/10'
      case 'shipped': return 'text-[var(--blue)] bg-[var(--blue)]/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      case 'processing': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-[var(--text-muted)] bg-[var(--bg-elevated)]'
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={cn('px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap', filter === 'all' ? 'btn-gradient text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]')}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn('px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize', filter === s ? 'btn-gradient text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]')}
            >
              {s} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--pink)]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden card-hover">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-sm">{o.order_id || o.id.slice(0, 8)}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium capitalize', statusColor(o.status))}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>{o.customer_name || o.customer_email || 'Guest'}</span>
                    <span>{formatDate(o.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatPrice(o.total || 0)}</span>
                  {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              {expanded === o.id && (
                <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-elevated)]">
                  <div className="space-y-2">
                    {(o.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{item.name} - Size {item.size}</span>
                        <span className="text-[var(--text-muted)]">x{item.quantity} {formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  {o.shipping_address && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                      <p className="font-medium text-[var(--text-secondary)] mb-1">Shipping</p>
                      <p>{o.shipping_address.line1}</p>
                      <p>{o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.zip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
