'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, AlertTriangle, Lock, CreditCard, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cart'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { formatPrice, generateOrderId } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clear } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
  })

  const subtotal = getTotal()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 14.99
  const total = subtotal + shipping

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    const required = ['fullName', 'email', 'address', 'city', 'state', 'zip'] as const
    for (const field of required) {
      if (!form[field].trim()) {
        toast.error('Please fill in all required fields')
        return
      }
    }

    setLoading(true)
    try {
      const orderId = generateOrderId()
      await supabase.from('orders').insert({
        order_id: orderId,
        customer_email: form.email,
        customer_name: form.fullName,
        customer_phone: form.phone,
        shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        items: items,
        subtotal,
        shipping,
        total,
        status: 'pending',
      })
      clear()
      router.push(`/checkout/confirmation?order=${orderId}`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <ShopHeader />
        <main className="flex-1 pt-20 flex flex-col items-center justify-center text-center px-4">
          <CreditCard className="w-16 h-16 text-text-muted mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nothing to checkout</h1>
          <p className="text-text-muted mb-6">Add some items to your cart first.</p>
          <Link href="/shop"><Button>Shop Now</Button></Link>
        </main>
        <Footer />
      </div>
    )
  }

  const inputClass = "w-full h-11 px-4 rounded-xl bg-card border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-pink/50 focus:ring-1 focus:ring-pink/20 transition-colors"

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-8"
          >
            Checkout
          </motion.h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* Shipping form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-2xl bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-5">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input placeholder="Full name *" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
                  </div>
                  <input placeholder="Email *" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
                  <input placeholder="Phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
                  <div className="sm:col-span-2">
                    <input placeholder="Street address *" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
                  </div>
                  <input placeholder="City *" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={form.state} onChange={(e) => update('state', e.target.value)} className={`${inputClass} cursor-pointer`}>
                      <option value="">State *</option>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="ZIP *" value={form.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-3">Payment</h2>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-elevated text-sm text-text-muted">
                  <Lock className="w-5 h-5 text-cyan shrink-0" />
                  Stripe payment integration coming soon. Orders will be confirmed via email.
                </div>
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="rounded-2xl bg-card border border-border p-6 sticky top-20 space-y-4">
                <button
                  type="button"
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="lg:cursor-default w-full flex items-center justify-between font-semibold cursor-pointer"
                >
                  <span>Order Summary ({items.length})</span>
                  <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`space-y-3 max-h-60 overflow-y-auto ${summaryOpen ? '' : 'hidden lg:block'}`}>
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-elevated relative shrink-0 overflow-hidden">
                        {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" sizes="56px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-text-muted">Size {item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-border text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-elevated text-xs text-text-muted">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-pink mt-0.5" />
                  All sales are final. Please review your order carefully.
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </motion.div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
