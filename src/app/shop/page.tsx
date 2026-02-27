'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
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
        .select('id, name, brand, price, size, condition, image_url')
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
          </div>
        )}

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
          </div>
        )}
      </div>
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
