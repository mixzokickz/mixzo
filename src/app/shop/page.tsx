'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Package, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/product-card'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FilterTabs } from '@/components/shop/filter-tabs'
import { SIZES, SNEAKER_BRANDS } from '@/lib/constants'

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
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all')
  const [sort, setSort] = useState('newest')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

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
      if (selectedBrand) query = query.ilike('brand', `%${selectedBrand}%`)
      if (selectedSize) query = query.eq('size', selectedSize)
      if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`)

      if (sort === 'price-asc') query = query.order('price', { ascending: true })
      else if (sort === 'price-desc') query = query.order('price', { ascending: false })
      else if (sort === 'name') query = query.order('name', { ascending: true })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query.limit(48)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [condition, sort, selectedBrand, selectedSize, search])

  const clearFilters = () => {
    setCondition('all')
    setSelectedBrand('')
    setSelectedSize('')
    setSearch('')
    setSort('newest')
  }

  const hasFilters = condition !== 'all' || selectedBrand || selectedSize || search

  return (
    <div className="px-4 py-6 pb-mobile-nav">
      <div className="max-w-7xl mx-auto">
        {/* Search + Filter bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sneakers..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-pink transition-colors"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="h-11 px-4 rounded-xl bg-card border border-border flex items-center gap-2 text-sm text-text-secondary hover:border-pink transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Condition tabs */}
        <FilterTabs
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'new', label: 'New' },
            { value: 'used', label: 'Preowned' },
          ]}
          value={condition}
          onChange={setCondition}
          className="mb-6"
        />

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-text-muted mb-1.5 block">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-elevated border border-border text-sm text-text focus:outline-none focus:border-pink"
                >
                  <option value="">All Brands</option>
                  {SNEAKER_BRANDS.slice(0, 20).map((b) => (
                    <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1.5 block">Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-elevated border border-border text-sm text-text focus:outline-none focus:border-pink"
                >
                  <option value="">All Sizes</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1.5 block">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-elevated border border-border text-sm text-text focus:outline-none focus:border-pink"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-pink hover:underline cursor-pointer flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Product count */}
        {!loading && (
          <p className="text-sm text-text-muted mb-4">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-text-muted mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No products found</h3>
            <p className="text-text-muted max-w-sm mb-6">
              {hasFilters
                ? 'Try adjusting your filters or search to find what you are looking for.'
                : 'We are restocking. Check back soon for fresh inventory.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
