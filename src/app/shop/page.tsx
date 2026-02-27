'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ProductCard } from '@/components/shop/product-card'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FilterPanel } from '@/components/shop/filter-panel'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  image_url: string | null
  images: string[] | null
  colorway: string | null
  created_at: string
}

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all')
  const [sort, setSort] = useState('newest')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('id, name, brand, price, size, condition, image_url, images, colorway, created_at')
        .eq('status', 'active')

      if (condition !== 'all') {
        if (condition === 'used') {
          query = query.in('condition', ['used', 'used_like_new'])
        } else {
          query = query.eq('condition', condition)
        }
      }
      if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`)

      if (sort === 'price-asc') query = query.order('price', { ascending: true })
      else if (sort === 'price-desc') query = query.order('price', { ascending: false })
      else if (sort === 'name-asc') query = query.order('name', { ascending: true })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query.limit(200)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [condition, sort, search])

  // Client-side filtering for size and brand (multi-select)
  const filtered = useMemo(() => {
    let result = products
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.size) return false
        // Handle comma-separated sizes and check if any match
        const productSizes = p.size.split(',').map(s => s.trim())
        return selectedSizes.some(s => productSizes.includes(s))
      })
    }
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }
    return result
  }, [products, selectedSizes, selectedBrands])

  // Extract available brands and sizes from loaded products
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]
    return brands.sort()
  }, [products])

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    products.forEach(p => {
      if (p.size) {
        p.size.split(',').map(s => s.trim()).forEach(s => sizes.add(s))
      }
    })
    return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b))
  }, [products])

  const clearFilters = () => {
    setCondition('all')
    setSearch('')
    setSort('newest')
    setSelectedSizes([])
    setSelectedBrands([])
  }

  const hasFilters = condition !== 'all' || search || selectedSizes.length > 0 || selectedBrands.length > 0

  return (
    <div className="px-4 py-6 pb-mobile-nav">
      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sneakers..."
            className="w-full h-13 pl-12 pr-4 rounded-2xl bg-card border border-border text-text text-base placeholder:text-text-muted focus:outline-none focus:border-pink/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <FilterPanel
            condition={condition}
            onConditionChange={setCondition}
            selectedSizes={selectedSizes}
            onSizesChange={setSelectedSizes}
            selectedBrands={selectedBrands}
            onBrandsChange={setSelectedBrands}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            sort={sort}
            onSortChange={setSort}
            totalCount={filtered.length}
          />
        </motion.div>

        {/* Active filter pills */}
        {(selectedSizes.length > 0 || selectedBrands.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            {selectedSizes.map(size => (
              <button
                key={`size-${size}`}
                onClick={() => setSelectedSizes(selectedSizes.filter(s => s !== size))}
                className="h-7 px-3 rounded-full bg-pink/10 text-pink text-xs font-medium flex items-center gap-1.5 hover:bg-pink/20 transition-colors cursor-pointer"
              >
                Size {size} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedBrands.map(brand => (
              <button
                key={`brand-${brand}`}
                onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                className="h-7 px-3 rounded-full bg-cyan/10 text-cyan text-xs font-medium flex items-center gap-1.5 hover:bg-cyan/20 transition-colors cursor-pointer"
              >
                {brand} <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="h-7 px-3 rounded-full bg-elevated text-text-muted text-xs font-medium hover:text-text transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Product count */}
        {!loading && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-text-muted">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </p>
            {hasFilters && !selectedSizes.length && !selectedBrands.length && (
              <button onClick={clearFilters} className="text-xs text-pink hover:underline cursor-pointer flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto h-9 px-3 pr-8 rounded-lg bg-[#141418] border border-[#1E1E26] text-xs text-[#A0A0B8] focus:outline-none focus:border-[#FF2E88]/50 appearance-none cursor-pointer transition-colors"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          </motion.div>

        {/* Grid */}
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
              {hasFilters ? 'No products found' : 'Coming Soon'}
            </h3>
            <p className="text-text-muted max-w-sm mb-6">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Fresh inventory dropping soon. Check back for the latest kicks.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* Expanded Filters */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-6 rounded-2xl bg-[#141418] border border-[#1E1E26] space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Brand */}
                <div>
                  <label className="text-[10px] font-bold text-[#4A4A5A] mb-3 block uppercase tracking-[0.15em]">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                        className={cn(
                          'px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-300',
                          selectedBrand === b
                            ? 'bg-[#FF2E88] text-white border-[#FF2E88] shadow-md shadow-[#FF2E88]/20'
                            : 'bg-[#1A1A22] border-[#1E1E26] text-[#6A6A80] hover:border-[#FF2E88]/30 hover:text-[#A0A0B8]'
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="text-[10px] font-bold text-[#4A4A5A] mb-3 block uppercase tracking-[0.15em]">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                        className={cn(
                          'w-11 py-2 rounded-lg text-xs font-semibold border transition-all duration-300 text-center',
                          selectedSize === s
                            ? 'bg-[#FF2E88] text-white border-[#FF2E88] shadow-md shadow-[#FF2E88]/20'
                            : 'bg-[#1A1A22] border-[#1E1E26] text-[#6A6A80] hover:border-[#FF2E88]/30 hover:text-[#A0A0B8]'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#FF2E88] hover:text-[#FF2E88]/80 font-semibold flex items-center gap-1 transition-colors">
                  <X size={12} /> Clear all filters
                </button>
              )}
            </motion.div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-[10px] text-[#4A4A5A] mb-5 uppercase tracking-[0.15em] font-bold">
              {products.length} {products.length === 1 ? 'product' : 'products'}
              {hasFilters && ' found'}
            </p>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden">
                  <div className="aspect-square bg-[#1A1A22] shimmer" />
                  <div className="p-3.5 space-y-2.5">
                    <div className="h-3 w-16 bg-[#1A1A22] rounded shimmer" />
                    <div className="h-4 w-full bg-[#1A1A22] rounded shimmer" />
                    <div className="h-4 w-20 bg-[#1A1A22] rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-[#141418] border border-[#1E1E26] flex items-center justify-center mb-6">
                <Package size={32} className="text-[#4A4A5A]" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                {hasFilters ? 'No matches' : 'Coming soon'}
              </h3>
              <p className="text-sm text-[#6A6A80] max-w-sm mb-8">
                {hasFilters
                  ? 'Try adjusting your filters or search terms.'
                  : 'Fresh inventory dropping soon. Check back or follow us for updates.'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#FF2E88]/20 transition-all active:scale-[0.97]"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.5, ease: easeOutExpo }}
                >
                  <ProductCard product={product} />
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6"><div className="max-w-7xl mx-auto"><ProductGridSkeleton count={8} /></div></div>}>
      <ShopContent />
    </Suspense>
  )
}
