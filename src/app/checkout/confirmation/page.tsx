'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, MapPin, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'

interface OrderData {
  order_number: string
  customer_name: string
  customer_email: string
  items: Array<{
    name: string
    size: string
    quantity: number
    price: number
    image_url?: string | null
  }>
  subtotal: number
  discount: number
  gift_card_amount: number
  shipping: number
  total: number
  shipping_address: {
    line1: string
    city: string
    state: string
    postal_code: string
  }
  status: string
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderParam = searchParams.get('order')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const clear = useCartStore(s => s.clear)

  useEffect(() => {
    // Clear cart on successful payment
    clear()
  }, [clear])

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (sessionId) {
          // Fetch order by Stripe session ID
          const res = await fetch(`/api/checkout/session?session_id=${sessionId}`)
          if (res.ok) {
            const data = await res.json()
            setOrder(data.order)
          }
        } else if (orderParam) {
          // Fallback: fetch by order number
          const res = await fetch(`/api/checkout/session?order_number=${orderParam}`)
          if (res.ok) {
            const data = await res.json()
            setOrder(data.order)
          }
        }
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError('Could not load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [sessionId, orderParam])

  const orderId = order?.order_number || orderParam || 'N/A'

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-pink flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed</h1>
      <p className="text-text-secondary mb-4">Thank you for your purchase{order?.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}!</p>

      <div className="w-full p-4 rounded-xl bg-card border border-border mb-6">
        <p className="text-sm text-text-muted mb-1">Order Number</p>
        <p className="text-lg font-bold gradient-text">{orderId}</p>
      </div>

      {/* Order Details */}
      {loading ? (
        <div className="w-full p-6 rounded-xl bg-card border border-border mb-6 flex items-center justify-center gap-2 text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading order details...
        </div>
      ) : order ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-4 mb-6"
        >
          {/* Items */}
          <div className="rounded-xl bg-card border border-border p-4 text-left">
            <h3 className="text-sm font-semibold mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-elevated relative shrink-0 overflow-hidden">
                    {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" sizes="48px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Size {item.size} x {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl bg-card border border-border p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#FF2E88]">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.gift_card_amount > 0 && (
                <div className="flex justify-between text-[#00C2D6]">
                  <span>Gift Card</span>
                  <span>-{formatPrice(order.gift_card_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address?.line1 && (
            <div className="rounded-xl bg-card border border-border p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-semibold">Shipping To</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {order.customer_name}<br />
                {order.shipping_address.line1}<br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
            </div>
          )}
        </motion.div>
      ) : error ? (
        <div className="w-full p-4 rounded-xl bg-card border border-border mb-6 text-sm text-text-muted">
          {error}
        </div>
      ) : null}

      <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-card border border-border mb-8 w-full">
        <Package className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary">
          <p>You will receive an email confirmation shortly with tracking details once your order ships.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/shop"><Button size="lg">Continue Shopping <ArrowRight className="w-4 h-4" /></Button></Link>
        <Link href="/orders/lookup"><Button variant="secondary" size="lg">Track Order</Button></Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-text-muted">Loading...</div>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
