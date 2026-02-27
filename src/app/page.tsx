'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { HeroShowcase } from '@/components/home/hero-showcase'
import { ProductCard } from '@/components/shop/product-card'
import { FilterTabs } from '@/components/shop/filter-tabs'
import { SizeFilter } from '@/components/shop/size-filter'
import { CleaningShowcase } from '@/components/shop/cleaning-showcase'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, price, size, condition, image_url, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(24)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = products
    if (filter === 'new') result = result.filter(p => p.condition === 'new')
    else if (filter === 'preowned') result = result.filter(p => p.condition !== 'new')

    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.size) return false
        const productSizes = p.size.split(',').map(s => s.trim())
        return selectedSizes.some(s => productSizes.includes(s))
      })
    }
    return result
  }, [products, filter, selectedSizes])

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    products.forEach(p => {
      if (p.size) p.size.split(',').map(s => s.trim()).forEach(s => sizes.add(s))
    })
    return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b))
  }, [products])

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0">
          <div className="mesh-gradient w-[500px] h-[500px] bg-pink/10 top-[-10%] left-[-5%]" />
          <div className="mesh-gradient w-[600px] h-[600px] bg-cyan/8 bottom-[-15%] right-[-10%]" style={{ animationDelay: '-7s' }} />
          <div className="mesh-gradient w-[400px] h-[400px] bg-pink/5 top-[40%] right-[20%]" style={{ animationDelay: '-13s' }} />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-black leading-[0.9] tracking-[-0.05em]">
              <span className="gradient-text">MIXZO</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-lg sm:text-xl text-text-secondary max-w-lg mx-auto leading-relaxed"
          >
            Authenticated kicks. New and preowned.
            <br className="hidden sm:block" />
            Denver&apos;s source for heat you can trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <Link
              href="/shop?condition=new"
              className="h-13 px-8 rounded-2xl bg-gradient-to-r from-pink to-cyan text-white font-semibold text-base inline-flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-pink/20"
            >
              Shop New
            </Link>
            <Link
              href="/shop?condition=used"
              className="h-13 px-8 rounded-2xl bg-white/5 border border-white/10 text-text font-semibold text-base inline-flex items-center justify-center hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all"
            >
              Shop Preowned
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Latest Drops Section with Filters */}
      <section className="px-4 pb-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-pink uppercase tracking-widest mb-1">Latest Inventory</p>
                <h2 className="text-3xl font-black text-text">Fresh Heat</h2>
                <p className="text-sm text-text-muted mt-1">Authenticated sneakers, updated daily</p>
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

            {/* Size filter — always visible on homepage preview */}
            <SizeFilter
              selected={selectedSizes}
              onChange={setSelectedSizes}
              availableSizes={availableSizes}
            />
          </motion.div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                {selectedSizes.length > 0 || filter !== 'all' ? 'No matches' : 'Coming Soon'}
              </h3>
              <p className="text-text-muted max-w-sm">
                {selectedSizes.length > 0 || filter !== 'all'
                  ? 'Try different sizes or filters.'
                  : 'Fresh inventory dropping soon. We\'re curating the best kicks for you.'}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.slice(0, 8).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* View All button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center mt-10"
              >
                <Link
                  href="/shop"
                  className="group h-12 px-8 rounded-2xl bg-card border border-border text-text font-semibold text-sm inline-flex items-center gap-2 hover:border-pink/30 hover:bg-pink/5 transition-all"
                >
                  View All Sneakers
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Sneaker Cleaning Before/After */}
      <CleaningShowcase />

      {/* Trust bar */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '100%', label: 'Authenticated' },
            { value: 'Free', label: 'Shipping $200+' },
            { value: 'Pro', label: 'Cleaned' },
            { value: 'All Sales', label: 'Final' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-2xl font-black gradient-text">{item.value}</p>
              <p className="text-sm text-text-muted mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
