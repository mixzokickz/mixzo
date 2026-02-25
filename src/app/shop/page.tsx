'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/shop/product-card'
import { FilterTabs } from '@/components/shop/filter-tabs'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  condition: string
  image_url: string | null
  status: string
}

const CONDITION_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Preowned' },
]

const PRICE_OPTIONS = [
  { value: 'all', label: 'All Prices' },
  { value: '0-100', label: 'Under $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200-300', label: '$200 - $300' },
  { value: '300+', label: '$300+' },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [condition, setCondition] = useState('all')
  const [brand, setBrand] = useState('all')
  const [size, setSize] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, size, price, condition, image_url, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand?.toLowerCase()).filter(Boolean))
    return [{ value: 'all', label: 'All Brands' }, ...Array.from(set).sort().map((b) => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) }))]
  }, [products])

  const sizes = useMemo(() => {
    const set = new Set(products.map((p) => p.size).filter(Boolean))
    return [{ value: 'all', label: 'All Sizes' }, ...Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b)).map((s) => ({ value: s, label: s }))]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand?.toLowerCase().includes(search.toLowerCase())) return false
      if (condition !== 'all') {
        if (condition === 'used' && p.condition !== 'used' && p.condition !== 'used_like_new') return false
        if (condition === 'new' && p.condition !== 'new') return false
      }
      if (brand !== 'all' && p.brand?.toLowerCase() !== brand) return false
      if (size !== 'all' && p.size !== size) return false
      if (priceRange !== 'all') {
        if (priceRange === '300+' && p.price < 300) return false
        else if (priceRange !== '300+') {
          const [min, max] = priceRange.split('-').map(Number)
          if (p.price < min || p.price >= max) return false
        }
      }
      return true
    })
  }, [products, search, condition, brand, size, priceRange])

  const activeFilterCount = [condition, brand, size, priceRange].filter((v) => v !== 'all').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Shipping banner */}
      <div className="mb-6 text-center py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)]">
        Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search sneakers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-[var(--pink)] text-[var(--pink)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            <button
              onClick={() => { setCondition('all'); setBrand('all'); setSize('all'); setPriceRange('all') }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--pink)]"
            >
              Clear All
            </button>
          </div>
          <FilterTabs label="Condition" options={CONDITION_OPTIONS} selected={condition} onChange={setCondition} />
          <FilterTabs label="Brand" options={brands} selected={brand} onChange={setBrand} />
          <FilterTabs label="Size" options={sizes} selected={size} onChange={setSize} />
          <FilterTabs label="Price" options={PRICE_OPTIONS} selected={priceRange} onChange={setPriceRange} />
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {loading ? 'Loading...' : `${filtered.length} sneaker${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-[var(--bg-elevated)]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/3" />
                <div className="h-4 bg-[var(--bg-elevated)] rounded w-2/3" />
                <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-lg mb-2">No sneakers found</p>
          <p className="text-sm">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  )
}
