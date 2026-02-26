'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

interface DealProduct {
  id: string
  name: string
  brand: string
  price: number
  original_price: number
  discount_percent: number
  images: string[]
  condition: string
  size: string
}

export default function DealsPage() {
  const [products, setProducts] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Get products with active deals (discount_percent > 0)
      const { data } = await supabase
        .from('products')
        .select('*')
        .gt('discount_percent', 0)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      if (data) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          price: p.price * (1 - (p.discount_percent || 0) / 100),
          original_price: p.price,
          discount_percent: p.discount_percent,
          images: p.images || [],
          condition: p.condition,
          size: p.size,
        })))
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
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Deals</h1>
            <p className="text-text-secondary text-sm mt-2">Discounted pairs — limited time.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <Tag className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Deals</h3>
              <p className="text-sm text-text-muted max-w-xs">
                Check back soon — we drop deals regularly.
              </p>
              <Link href="/shop" className="mt-6 text-sm text-pink hover:underline">Browse all sneakers →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <Link key={p.id} href={`/product/${p.id}`} className="group">
                  <div className="aspect-square bg-card border border-border rounded-xl overflow-hidden relative">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-text-muted" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-[#FF2E88] text-white text-xs font-bold px-2 py-1 rounded-lg">
                      -{p.discount_percent}%
                    </span>
                  </div>
                  <div className="mt-3 px-1">
                    <p className="text-xs text-text-muted uppercase">{p.brand}</p>
                    <p className="text-sm font-medium text-text truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-pink">{formatPrice(p.price)}</span>
                      <span className="text-xs text-text-muted line-through">{formatPrice(p.original_price)}</span>
                    </div>
                  </div>
                </Link>
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
