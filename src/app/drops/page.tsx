'use client'

import { useState, useEffect } from 'react'
import { Flame, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ProductCard } from '@/components/shop/product-card'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

interface Product {
  id: string; name: string; brand: string; price: number; size: string; condition: string; image_url: string | null
}

export default function DropsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, price, size, condition, image_url')
        .eq('status', 'active')
        .eq('is_daily_deal', true)
        .order('created_at', { ascending: false })
        .limit(20)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-7xl mx-auto py-6">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-pink" />
            <h1 className="text-2xl font-bold">Daily Drops</h1>
          </div>
          <p className="text-text-muted mb-8">Limited deals, refreshed daily. Do not sleep on these.</p>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active drops</h3>
              <p className="text-text-muted">Check back tomorrow for fresh deals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
