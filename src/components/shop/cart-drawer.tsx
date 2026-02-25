'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()
  const shippingMsg = total >= FREE_SHIPPING_THRESHOLD
    ? 'Free Shipping'
    : `${formatPrice(FREE_SHIPPING_THRESHOLD - total)} away from free shipping`

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-white">Cart</h2>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
            <ShoppingBag className="w-12 h-12" />
            <p>Your cart is empty</p>
            <Link href="/shop" onClick={onClose} className="btn-gradient px-6 py-2 rounded-lg text-white text-sm font-semibold">
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 text-center text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-card)]">
              {shippingMsg}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
                  <div className="relative w-20 h-20 bg-[var(--bg-elevated)] rounded-lg shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-1 rounded-lg" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Size {item.size}</p>
                    <p className="text-sm font-bold text-white mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--pink)]">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border)] p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-bold text-white">{formatPrice(total)}</span>
              </div>
              <Link href="/cart" onClick={onClose} className="block w-full text-center py-3 rounded-xl border border-[var(--border)] text-white font-semibold hover:border-[var(--border-light)] transition-colors">
                View Cart
              </Link>
              <Link href="/checkout" onClick={onClose} className="block w-full text-center btn-gradient py-3 rounded-xl text-white font-semibold">
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
