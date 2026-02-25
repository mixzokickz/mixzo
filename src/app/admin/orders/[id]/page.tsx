'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, Printer, MapPin } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { CONDITION_LABELS, ORDER_STATUSES } from '@/lib/constants'
import { toast } from 'sonner'

interface Order {
  id: string; created_at: string; status: string; total: number; subtotal: number;
  shipping_cost: number; discount: number; customer_name: string; customer_email: string;
  customer_id: string; items: Array<{ name: string; size: string; condition: string; price: number; quantity: number; image?: string }>;
  shipping_address: { name: string; line1: string; line2?: string; city: string; state: string; zip: string };
  tracking_number?: string; tracking_url?: string; notes?: string;
}

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    supabase.from('orders').select('*').eq('id', params.id).single()
      .then(({ data }) => { setOrder(data); setLoading(false) })
  }, [params.id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const res = await fetch(`/api/admin/orders/${params.id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrder(prev => prev ? { ...prev, status } : prev)
      toast.success(`Order updated to ${status}`)
    } else {
      toast.error('Failed to update order')
    }
    setUpdating(false)
  }

  async function updateTracking(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const trackingNumber = (form.elements.namedItem('tracking') as HTMLInputElement).value
    setUpdating(true)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    await fetch(`/api/admin/orders/${params.id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tracking_number: trackingNumber, status: 'shipped' }),
    })
    setOrder(prev => prev ? { ...prev, tracking_number: trackingNumber, status: 'shipped' } : prev)
    toast.success('Tracking added')
    setUpdating(false)
  }

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="skeleton h-64 rounded-xl" /></div>

  if (!order) return (
    <div className="text-center py-16">
      <Package size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-white mb-2">Order not found</h2>
      <Link href="/admin/orders" className="text-sm text-[var(--pink)] hover:underline">Back to orders</Link>
    </div>
  )

  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft size={16} /> Orders
        </Link>
        <Link href={`/admin/orders/${order.id}/packing-slip`} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white border border-[var(--border)] px-3 py-1.5 rounded-lg">
          <Printer size={14} /> Packing Slip
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-[var(--text-muted)]">{formatDate(order.created_at)} &middot; {order.customer_name || order.customer_email || 'Guest'}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
          order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
          'bg-[var(--pink)]/10 text-[var(--pink)]'
        }`}>{order.status}</span>
      </div>

      {/* Status update */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || order.status === s}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                order.status === s ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Tracking */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Shipping & Tracking</h2>
        {order.tracking_number ? (
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[var(--cyan)]" />
            <span className="text-sm text-white font-medium">{order.tracking_number}</span>
          </div>
        ) : (
          <form onSubmit={updateTracking} className="flex gap-3">
            <input name="tracking" placeholder="Enter tracking number..." className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <button type="submit" disabled={updating} className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-4 rounded-xl disabled:opacity-50">
              Add & Ship
            </button>
          </form>
        )}
      </div>

      {/* Items */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3">
              {item.image ? (
                <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-contain bg-white" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center"><Package size={18} className="text-[var(--text-muted)]" /></div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Size {item.size} / {CONDITION_LABELS[item.condition] || item.condition} / Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-white">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-1 text-sm">
          <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>{formatPrice(order.subtotal || order.total)}</span></div>
          {order.shipping_cost > 0 && <div className="flex justify-between text-[var(--text-secondary)]"><span>Shipping</span><span>{formatPrice(order.shipping_cost)}</span></div>}
          {order.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between font-bold text-white pt-2 border-t border-[var(--border)]"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Address */}
      {order.shipping_address && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><MapPin size={14} className="text-[var(--text-secondary)]" /><h2 className="text-sm font-semibold text-white">Shipping Address</h2></div>
          <div className="text-sm text-[var(--text-secondary)] space-y-0.5">
            <p className="text-white font-medium">{order.shipping_address.name}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
          </div>
        </div>
      )}
    </div>
  )
}
