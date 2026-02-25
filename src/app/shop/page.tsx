'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/product-card'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FilterTabs } from '@/components/shop/filter-tabs'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  image_url: string | null
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all')
  const [sort, setSort] = useState('newest')

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
      else query = query.order('created_at', { ascending: false })

      const { data } = await query.limit(48)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [condition, sort, search])

  const clearFilters = () => {
    setCondition('all')
    setSearch('')
    setSort('newest')
  }

  const hasFilters = condition !== 'all' || search

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

        {/* Filters row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <FilterTabs
            tabs={[
              { value: 'all', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'used', label: 'Preowned' },
            ]}
            value={condition}
            onChange={setCondition}
          />
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 rounded-xl bg-card border border-border text-sm text-text-secondary focus:outline-none focus:border-pink/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Product count + clear */}
        {!loading && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-text-muted">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-pink hover:underline cursor-pointer flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
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
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
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
