'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Flame, Package, Clock, Tag, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'

interface DailyDeal {
  id: string
  product_id: string
  sale_price: number
  expires_at: string
  products: {
    id: string
    name: string
    brand: string
    price: number
    size: string
    condition: string
    image_url: string | null
  }
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const end = new Date(expiresAt).getTime()
      const diff = end - now
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <Clock className="w-3.5 h-3.5 text-pink" />
      <span className={timeLeft === 'Expired' ? 'text-text-muted' : 'text-pink font-semibold'}>{timeLeft}</span>
    </div>
  )
}

export default function DropsPage() {
  const [deals, setDeals] = useState<DailyDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('daily_deals')
        .select('id, product_id, sale_price, expires_at, products(id, name, brand, price, size, condition, image_url)')
        .gte('expires_at', new Date().toISOString())
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(20)
      setDeals((data as unknown as DailyDeal[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-7xl mx-auto py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-pink/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-pink" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Daily Drops</h1>
                <p className="text-sm text-text-muted">Limited deals, refreshed daily. Don&apos;t sleep on these.</p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Drops</h3>
              <p className="text-text-muted max-w-sm mb-8">
                Today&apos;s deals have ended. Check back tomorrow for fresh drops and exclusive prices.
              </p>
              <Link href="/shop">
                <Button>Browse Full Collection <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal, i) => {
                const product = deal.products
                const discount = product ? Math.round((1 - deal.sale_price / product.price) * 100) : 0
                if (!product) return null
                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-pink/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink/5">
                        {/* Image */}
                        <div className="relative aspect-square bg-elevated overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-text-muted" />
                            </div>
                          )}
                          {/* Discount badge */}
                          {discount > 0 && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-pink text-white text-xs font-bold flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {discount}% OFF
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-text-muted uppercase tracking-wide">{product.brand}</p>
                            <h3 className="font-semibold text-sm mt-0.5 line-clamp-2">{product.name}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted bg-elevated px-2 py-0.5 rounded-md">
                              Size {product.size}
                            </span>
                            <span className="text-xs text-text-muted bg-elevated px-2 py-0.5 rounded-md capitalize">
                              {product.condition === 'used_like_new' ? 'Like New' : product.condition === 'used' ? 'Preowned' : 'New'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-pink">${deal.sale_price}</span>
                              <span className="text-sm text-text-muted line-through">${product.price}</span>
                            </div>
                            <CountdownTimer expiresAt={deal.expires_at} />
                          </div>
                        </div>
                      </div>
                    </Link>
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
