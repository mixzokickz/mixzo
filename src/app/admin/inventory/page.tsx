'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Filter, Package, Edit, Trash2, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { CONDITION_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  condition: string
  price: number
  cost: number | null
  quantity: number
  images: string[]
  status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, brand, size, condition, price, cost, quantity, images, status')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products
    .filter(p => {
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(p => p.id)))
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} products?`)) return
    const token = (await supabase.auth.getSession()).data.session?.access_token
    for (const id of selected) {
      await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      })
    }
    toast.success(`Deleted ${selected.size} products`)
    setSelected(new Set())
    loadProducts()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-[var(--text-muted)]">{products.length} products</p>
        </div>
        <Link href="/admin/scan" className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
          Add Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none"
          />
        </div>
        <select
          value={conditionFilter}
          onChange={e => setConditionFilter(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Preowned</option>
          <option value="used_like_new">Like New</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="created_at">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3">
          <span className="text-sm text-white font-medium">{selected.size} selected</span>
          <button onClick={bulkDelete} className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
            <Trash2 size={14} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-[var(--text-muted)] hover:text-white ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Package size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No products found</h2>
          <p className="text-sm text-[var(--text-secondary)]">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={selectAll} className="text-xs text-[var(--text-muted)] hover:text-white">
              {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(product => (
              <div
                key={product.id}
                className={cn(
                  'bg-[var(--bg-card)] border rounded-xl overflow-hidden transition-all',
                  selected.has(product.id) ? 'border-[var(--pink)]' : 'border-[var(--border)] hover:border-[var(--border)]/80'
                )}
              >
                <div className="flex items-start gap-3 p-4">
                  <button onClick={() => toggleSelect(product.id)} className="mt-1">
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      selected.has(product.id) ? 'bg-[var(--pink)] border-[var(--pink)]' : 'border-[var(--border)]'
                    )}>
                      {selected.has(product.id) && <span className="text-white text-xs">&#10003;</span>}
                    </div>
                  </button>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-16 h-16 rounded-lg object-contain bg-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                      <Package size={20} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{product.brand} / Size {product.size}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                        {CONDITION_LABELS[product.condition] || product.condition}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">Qty: {product.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
                </div>
                <div className="flex border-t border-[var(--border)]">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit size={13} /> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
