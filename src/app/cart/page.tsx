'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clear } = useCartStore()
  const [discountCode, setDiscountCode] = useState('')
  const [mounted, setMounted] = useState(false)

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <ShopHeader />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
        <Link href="/shop" className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-lg text-[var(--text-muted)] mb-4">Your cart is empty</p>
            <Link href="/shop" className="btn-gradient px-6 py-2.5 rounded-xl text-white font-semibold inline-block">Shop Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 card-hover">
                  <div className="relative w-24 h-24 bg-[var(--bg-elevated)] rounded-lg shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-2 rounded-lg" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`} className="text-sm font-semibold text-white hover:text-[var(--pink)] transition-colors truncate block">
                      {item.name}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.brand} / Size {item.size}</p>
                    <p className="text-base font-bold text-white mt-2">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm text-white w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--pink)] ml-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-white">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--border)] pt-3 flex justify-between text-base font-bold">
                  <span className="text-white">Total</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>

                {/* Discount code */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg"
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-light)] transition-colors">
                    Apply
                  </button>
                </div>

                <Link href="/checkout" className="block w-full text-center btn-gradient py-3 rounded-xl text-white font-semibold">
                  Checkout
                </Link>
              </div>

              <button onClick={clear} className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--pink)] transition-colors py-2">
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
