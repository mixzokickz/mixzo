'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, X, ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const [discountCode, setDiscountCode] = useState('')
  const subtotal = getTotal()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 14.99
  const total = subtotal + shipping

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-8"
          >
            Your Cart
          </motion.h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-text-muted" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-text-muted mb-6">Browse our collection and find your next pair.</p>
              <Link href="/shop"><Button>Continue Shopping</Button></Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 rounded-2xl bg-card border border-border"
                    >
                      <div className="w-24 h-24 rounded-xl bg-elevated relative shrink-0 overflow-hidden">
                        {item.image_url && (
                          <Image src={item.image_url} alt={item.name} fill className="object-contain p-2" sizes="96px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">{item.brand}</p>
                            <p className="font-semibold text-sm mt-0.5">{item.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">Size {item.size}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-text-muted hover:text-red-400 transition-colors cursor-pointer shrink-0 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-text cursor-pointer transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-text cursor-pointer transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <div className="rounded-2xl bg-card border border-border p-6 sticky top-20 space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>

                  <div className="flex gap-2">
                    <input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl bg-elevated border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-pink/50"
                    />
                    <Button variant="secondary" size="sm" className="shrink-0">Apply</Button>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                    {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                      <p className="text-xs text-cyan">
                        Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-elevated text-xs text-text-muted">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-pink mt-0.5" />
                    All sales are final. Please review your order carefully before checkout.
                  </div>

                  <Link href="/checkout" className="block">
                    <Button className="w-full" size="lg">Checkout</Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
