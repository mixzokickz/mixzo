'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Package, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    name: string
    brand: string
    price: number
    size: string
    condition: string
    image_url: string | null
    status: string
  }
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('wishlists')
        .select('id, product_id, products(id, name, brand, price, size, condition, image_url, status)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setItems((data as unknown as WishlistItem[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('wishlists').delete().eq('id', id)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-4xl mx-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Wishlist</h1>
            <p className="text-text-muted mb-8">Your saved favorites — grab them before they&apos;re gone.</p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl h-28 animate-pulse" />
              ))}
            </div>
          ) : !userId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign In to View Wishlist</h2>
              <p className="text-text-muted max-w-sm mb-6">Create an account or sign in to save your favorite kicks.</p>
              <Link href="/login"><Button>Sign In <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h2>
              <p className="text-text-muted max-w-sm mb-6">
                Browse our collection and tap the heart icon to save your favorite sneakers.
              </p>
              <Link href="/shop"><Button>Browse Shop <ArrowRight className="w-4 h-4" /></Button></Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => {
                const p = item.products
                if (!p) return null
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-border-light transition-colors"
                  >
                    <Link href={`/product/${p.id}`} className="shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-elevated overflow-hidden relative">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-text-muted" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${p.id}`}>
                        <p className="text-xs text-text-muted uppercase tracking-wide">{p.brand}</p>
                        <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted">Size {p.size}</span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-sm font-bold text-pink">${p.price}</span>
                        </div>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.status === 'active' && (
                        <Link href={`/product/${p.id}`}>
                          <Button size="sm" className="gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add to Cart</span>
                          </Button>
                        </Link>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg hover:bg-elevated text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
