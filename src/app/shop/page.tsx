'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Package, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/shop/product-card'
import { cn } from '@/lib/utils'

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

const SIZES = [
  '4','4.5','5','5.5','6','6.5','7','7.5','8','8.5',
  '9','9.5','10','10.5','11','11.5','12','12.5','13','14','15'
]

const BRANDS = ['Nike','Jordan','Adidas','New Balance','Yeezy','Puma','Reebok','Asics','Converse','Vans']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name', label: 'A → Z' },
]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [condition, setCondition] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('id, name, brand, price, size, condition, image_url, images, colorway, created_at')
        .eq('status', 'active')

      if (condition === 'new') query = query.eq('condition', 'new')
      if (condition === 'preowned') query = query.neq('condition', 'new')
      if (selectedBrand) query = query.ilike('brand', `%${selectedBrand}%`)
      if (selectedSize) query = query.eq('size', selectedSize)
      if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,style_id.ilike.%${search}%`)

      if (sort === 'price-asc') query = query.order('price', { ascending: true })
      else if (sort === 'price-desc') query = query.order('price', { ascending: false })
      else if (sort === 'name') query = query.order('name', { ascending: true })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query.limit(60)
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
  const activeFilterCount = [condition !== 'all', selectedBrand, selectedSize, search].filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20">
        {/* Hero Banner */}
        <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Shop</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Authenticated new & preowned sneakers</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search + Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand, or style ID..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-[var(--text-muted)] hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  'h-11 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors',
                  filtersOpen || hasFilters
                    ? 'bg-[var(--pink)]/10 border-[var(--pink)]/30 text-[var(--pink)]'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
                )}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--pink)] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 px-3 pr-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--pink)] appearance-none"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Condition Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'preowned', label: 'Preowned' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setCondition(tab.value)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all',
                  condition === tab.value
                    ? 'bg-white text-black'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-muted)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          {filtersOpen && (
            <div className="mb-6 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Brand</label>
                  <div className="flex flex-wrap gap-1.5">
                    {BRANDS.map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          selectedBrand === b
                            ? 'bg-[var(--pink)] text-white border-[var(--pink)]'
                            : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Size</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                        className={cn(
                          'w-10 py-1.5 rounded-lg text-xs font-medium border transition-all text-center',
                          selectedSize === s
                            ? 'bg-[var(--pink)] text-white border-[var(--pink)]'
                            : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/40'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[var(--pink)] hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-xs text-[var(--text-muted)] mb-4 uppercase tracking-wider">
              {products.length} {products.length === 1 ? 'product' : 'products'}
              {hasFilters && ' found'}
            </p>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
                  <div className="aspect-square bg-[var(--bg-elevated)] shimmer" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded shimmer" />
                    <div className="h-4 w-full bg-[var(--bg-elevated)] rounded shimmer" />
                    <div className="h-4 w-20 bg-[var(--bg-elevated)] rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-5">
                <Package size={32} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {hasFilters ? 'No matches' : 'Coming soon'}
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
                {hasFilters
                  ? 'Try adjusting your filters or search terms.'
                  : 'Fresh inventory dropping soon. Check back or follow us for updates.'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
