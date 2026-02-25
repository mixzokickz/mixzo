'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Truck, RefreshCw, Package, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

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
      <section className="relative pt-40 pb-28 md:pt-56 md:pb-48 px-6 md:px-12 lg:px-16 overflow-hidden">
        {/* Concrete texture background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: 'url(/hero-bg.webp)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/60 via-transparent to-[#0C0C0C]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs text-text-muted mb-8"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink" />
                LIVE HEAT. TRUSTED PAIRS. — Denver, CO
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                custom={1}
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
              >
                Premium Kicks,
                <br />
                <span className="text-pink">Fair Prices</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                custom={2}
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed"
              >
                Shop authenticated new and preowned sneakers from Denver. Every pair verified, every purchase backed by our guarantee.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                custom={3}
                variants={fadeUp}
                className="flex flex-wrap gap-4 mt-10"
              >
                <Link href="/shop">
                  <Button size="lg">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/cleaning">
                  <Button variant="outline" size="lg">
                    Cleaning Service
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: Animated Sneaker Showcase */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FF2E88]/10 blur-[100px]" />
                <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full bg-[#00C2D6]/8 blur-[80px]" />

                {/* Main floating sneaker */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="relative z-10"
                >
                  <motion.img
                    src="/images/library/hero-sneaker.webp"
                    alt="Premium Sneaker"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>

                {/* Orbiting smaller sneakers */}
                <motion.div
                  className="absolute top-4 right-4 w-28 h-28 rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.img
                    src="/images/library/pedestal.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>

                <motion.div
                  className="absolute bottom-8 -left-4 w-24 h-24 rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <motion.img
                    src="/images/library/deals-banner.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  />
                </motion.div>

                <motion.div
                  className="absolute bottom-24 right-0 w-20 h-20 rounded-xl overflow-hidden border border-[#FF2E88]/20 bg-card/80 backdrop-blur-sm shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <motion.img
                    src="/images/library/collection.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  />
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  className="absolute top-16 -left-2 px-3 py-2 rounded-xl bg-card/90 border border-border/50 backdrop-blur-sm shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <p className="text-[10px] text-text-muted">Verified ✓</p>
                    <p className="text-xs font-bold text-white">100% Authentic</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="flex flex-wrap gap-10 mt-20 pt-10 border-t border-[#1E1E26]"
          >
            {TRUST_SIGNALS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center transition-all duration-300 group-hover:border-pink/40 group-hover:shadow-lg group-hover:shadow-pink/10">
                  <Icon className="w-5 h-5 text-pink" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{label}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-6 md:px-12 lg:px-16 pt-20 pb-32 pb-mobile-nav">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Shop</h2>
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
          </motion.div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <Package className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Inventory Coming Soon</h3>
              <p className="text-sm text-text-muted max-w-xs">
                New inventory coming soon. Follow us on Instagram to get notified first.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              {products.length >= 12 && (
                <div className="flex justify-center mt-12">
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
