'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="w-12 h-12 text-text-muted" />
            <p className="text-text-muted text-center">Your cart is empty</p>
            <Button variant="secondary" onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-card rounded-xl p-3 border border-border">
                  <div className="w-20 h-20 rounded-lg bg-elevated relative shrink-0 overflow-hidden">
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" sizes="80px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">{item.brand}</p>
                    <p className="text-sm font-medium text-text truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Size {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold">{formatPrice(item.price)}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-elevated flex items-center justify-center text-text-muted hover:text-text cursor-pointer">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-elevated flex items-center justify-center text-text-muted hover:text-text cursor-pointer">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-1 text-text-muted hover:text-red-400 transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border space-y-3">
              {total < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-text-muted text-center">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - total)} more for free shipping
                </p>
              )}
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link href="/cart" onClick={onClose}>
                <Button className="w-full" size="lg">View Cart</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
