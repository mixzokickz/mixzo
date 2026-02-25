'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Truck, RefreshCw, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ProductCard } from '@/components/shop/product-card'
import { FilterTabs } from '@/components/shop/filter-tabs'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  image_url: string | null
  status: string
}

const TRUST_SIGNALS = [
  { icon: Shield, label: 'Authenticated', desc: 'Every pair verified' },
  { icon: Truck, label: 'Fast Shipping', desc: 'Free over $200' },
  { icon: RefreshCw, label: 'Easy Returns', desc: 'Hassle-free process' },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, price, size, condition, image_url, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? products
    : filter === 'new' ? products.filter(p => p.condition === 'new')
    : products.filter(p => p.condition !== 'new')

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-text-muted mb-6">
                <Package className="w-3.5 h-3.5" />
                Based in Denver, CO
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Premium Kicks,{' '}
                <span className="gradient-text">Fair Prices</span>
              </h1>
              <p className="mt-5 text-lg text-text-secondary max-w-md leading-relaxed">
                Shop authenticated new and preowned sneakers. Every pair verified, every purchase backed by our guarantee.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/shop">
                  <Button size="lg">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/shop?condition=used">
                  <Button variant="secondary" size="lg">Shop Preowned</Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10">
                {TRUST_SIGNALS.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                      <Icon className="w-5 h-5 text-pink" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{label}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side gradient art */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-md">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink/20 via-transparent to-cyan/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-pink to-cyan opacity-20 blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl font-black gradient-text opacity-30">MX</span>
                </div>
                <div className="absolute inset-0 rounded-3xl border border-border" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 pb-24 pb-mobile-nav">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">Latest Drops</h2>
              <p className="text-sm text-text-muted mt-1">Fresh inventory, updated daily</p>
            </div>
            <FilterTabs
              tabs={[
                { value: 'all', label: 'All' },
                { value: 'new', label: 'New' },
                { value: 'preowned', label: 'Preowned' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No products yet</h3>
              <p className="text-text-muted max-w-sm">
                We are stocking up with fresh inventory. Check back soon for the latest drops.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {products.length >= 12 && (
                <div className="flex justify-center mt-10">
                  <Link href="/shop">
                    <Button variant="secondary" size="lg">
                      View All Products
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
