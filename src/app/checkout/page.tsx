'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, CreditCard, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { supabase } from '@/lib/supabase'
import { formatPrice, generateOrderId } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clear } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
  })

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <ShopHeader />
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">Loading...</div>
        <Footer />
      </div>
    )
  }

  const subtotal = getTotal()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15
  const total = subtotal + shipping

  const updateField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip'] as const
    for (const field of required) {
      if (!form[field].trim()) {
        toast.error('Please fill in all required fields')
        return
      }
    }

    setSubmitting(true)
    try {
      const orderId = generateOrderId()
      const { error } = await supabase.from('orders').insert({
        order_id: orderId,
        customer_name: `${form.firstName} ${form.lastName}`,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        items: items.map((i) => ({ id: i.id, name: i.name, size: i.size, price: i.price, quantity: i.quantity })),
        subtotal,
        shipping,
        total,
        status: 'pending',
      })

      if (error) throw error

      clear()
      toast.success(`Order ${orderId} placed successfully`)
      router.push('/shop')
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <ShopHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
          <p className="text-lg">Your cart is empty</p>
          <Link href="/shop" className="btn-gradient px-6 py-2 rounded-lg text-white text-sm font-semibold">Shop Now</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <ShopHeader />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
        <Link href="/cart" className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} className="w-full" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} className="w-full" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Street Address *</label>
                  <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="w-full" required />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">City *</label>
                    <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">State *</label>
                    <input type="text" value={form.state} onChange={(e) => updateField('state', e.target.value)} className="w-full" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-[var(--text-muted)] mb-1">ZIP Code *</label>
                    <input type="text" value={form.zip} onChange={(e) => updateField('zip', e.target.value)} className="w-full" required />
                  </div>
                </div>
              </div>

              {/* Payment placeholder */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-[var(--text-muted)]" />
                  <h2 className="text-lg font-bold text-white">Payment</h2>
                </div>
                <div className="py-8 text-center border border-dashed border-[var(--border-light)] rounded-lg">
                  <Lock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">Payment details coming soon</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Stripe integration in progress</p>
                </div>
              </div>

              {/* All sales final */}
              <div className="flex items-start gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-[var(--pink)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">All Sales Are Final</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Please review your order carefully before placing it. We do not accept returns or exchanges.</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4 sticky top-20">
                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 bg-[var(--bg-elevated)] rounded-lg shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-contain p-1 rounded-lg" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[10px]">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Size {item.size} x{item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-[var(--border)]">
                    <span className="text-white">Total</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-gradient py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
