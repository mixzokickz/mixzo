'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag, Package, Flame, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { motion } from 'framer-motion'

interface DealProduct {
  id: string
  deal_id: string
  name: string
  brand: string
  price: number
  original_price: number
  sale_price: number
  discount_percent: number
  images: string[]
  image_url: string | null
  condition: string
  size: string
}

export default function DealsPage() {
  const [products, setProducts] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Get active deals joined with product data
      const { data, error } = await supabase
        .from('daily_deals')
        .select('id, product_id, original_price, sale_price, active, created_at, product:products(id, name, brand, price, images, image_url, condition, size)')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setProducts(data.map((deal: any) => {
          const p = deal.product
          const origPrice = deal.original_price || p?.price || 0
          const salePrice = deal.sale_price
          const discount = origPrice > 0 ? Math.round((1 - salePrice / origPrice) * 100) : 0
          return {
            id: p?.id || deal.product_id,
            deal_id: deal.id,
            name: p?.name || 'Unknown',
            brand: p?.brand || '',
            price: salePrice,
            original_price: origPrice,
            sale_price: salePrice,
            discount_percent: discount,
            images: p?.images || [],
            image_url: p?.image_url || null,
            condition: p?.condition || '',
            size: p?.size || '',
          }
        }))
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 pb-24 pb-mobile-nav px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FF2E88] flex items-center justify-center">
                <Flame size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">Daily Deals</h1>
            </div>
            <p className="text-text-secondary text-sm mt-2">Special pricing on select pairs — while they last.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <div className="skeleton aspect-square rounded-xl" />
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center mb-6">
                <Tag className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Active Deals</h3>
              <p className="text-sm text-text-muted max-w-xs mb-6">
                Check back soon — we drop deals regularly on select pairs.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#FF2E88]/25 transition-all"
              >
                Browse All <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => (
                <motion.div
                  key={p.deal_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/product/${p.id}`} className="group block">
                    <div className="aspect-square bg-card border border-border rounded-xl overflow-hidden relative">
                      {(p.image_url || p.images[0]) ? (
                        <img
                          src={p.image_url || p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#141418]">
                          <Package className="w-10 h-10 text-text-muted" />
                        </div>
                      )}
                      {/* Discount Badge */}
                      <span className="absolute top-2 right-2 bg-[#FF2E88] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-[#FF2E88]/30">
                        {p.discount_percent}% OFF
                      </span>
                    </div>
                    <div className="mt-3 px-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">{p.brand}</p>
                      <p className="text-sm font-medium text-text truncate mt-0.5">{p.name}</p>
                      {p.size && (
                        <p className="text-xs text-text-muted mt-0.5">Size {p.size}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-bold text-[#FF2E88]">{formatPrice(p.sale_price)}</span>
                        <span className="text-sm text-text-muted line-through">{formatPrice(p.original_price)}</span>
                      </div>
                      <p className="text-xs text-[#00C2D6] font-medium mt-1">
                        Save {formatPrice(p.original_price - p.sale_price)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
