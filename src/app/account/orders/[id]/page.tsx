'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { CONDITION_LABELS } from '@/lib/constants'

interface OrderItem {
  name: string
  size: string
  condition: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  discount: number
  items: OrderItem[]
  shipping_address: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  tracking_number?: string
  tracking_url?: string
}

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STEP_ICONS = [Clock, CheckCircle, Package, Truck, CheckCircle]

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('customer_id', session.user.id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [router, params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-4 py-8 max-w-2xl mx-auto">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="skeleton h-48 w-full rounded-2xl mb-4" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-4 py-8 max-w-2xl mx-auto text-center">
        <Package size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Order not found</h2>
        <Link href="/account/orders" className="text-sm text-[var(--pink)] hover:underline">Back to orders</Link>
      </div>
    )
  }

  const currentStep = STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 max-w-2xl mx-auto pb-mobile-nav">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} />
        Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-[var(--text-muted)]">{formatDate(order.created_at)}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
          order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
          'bg-[var(--pink)]/10 text-[var(--pink)]'
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Tracking */}
      {order.status !== 'cancelled' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Order Status</h2>
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i]
              const active = i <= currentStep
              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    active ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'
                  }`}>
                    <Icon size={14} className={active ? 'text-white' : 'text-[var(--text-muted)]'} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded ${active && i < currentStep ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)]' : 'bg-[var(--border)]'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map(step => (
              <p key={step} className="text-[10px] text-[var(--text-muted)] capitalize">{step}</p>
            ))}
          </div>

          {order.tracking_number && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)]">Tracking Number</p>
              {order.tracking_url ? (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--pink)] font-medium hover:underline">
                  {order.tracking_number}
                </a>
              ) : (
                <p className="text-sm text-white font-medium">{order.tracking_number}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-3">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3">
              {item.image ? (
                <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-white border border-[var(--border)]" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                  <Package size={20} className="text-[var(--text-muted)]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Size {item.size} / {CONDITION_LABELS[item.condition] || item.condition}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-white">{formatPrice(item.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-3">Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal || order.total)}</span>
          </div>
          {order.shipping_cost > 0 && (
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-white pt-2 border-t border-[var(--border)]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
          </div>
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
