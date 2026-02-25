'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, Edit3, Package, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { CONDITION_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  quantity: number
  condition: string
  images: string[]
  status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  const load = async () => {
    setLoading(true)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const res = await fetch('/api/admin/products?status=active', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      toast.success('Product deleted')
      setProducts(p => p.filter(x => x.id !== id))
    } else {
      toast.error('Failed to delete')
    }
  }

  let filtered = products.filter(p => {
    if (filter === 'new' && p.condition !== 'new') return false
    if (filter === 'preowned' && p.condition === 'new') return false
    if (search) {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.size?.includes(q)
    }
    return true
  })

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'preowned', label: 'Preowned' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <span className="text-sm text-[var(--text-muted)]">{filtered.length} items</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f.value
                  ? 'btn-gradient text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low-High</option>
          <option value="price-desc">Price: High-Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--pink)]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden card-hover group">
              <div className="h-40 bg-[var(--bg-elevated)] flex items-center justify-center">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="h-full w-full object-contain p-2" />
                ) : (
                  <Package size={40} className="text-[var(--text-muted)]" />
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-sm line-clamp-2 mb-1">{p.name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                  <span>Size {p.size}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium',
                    p.condition === 'new' ? 'bg-[var(--blue)]/20 text-[var(--blue)]' : 'bg-[var(--pink)]/20 text-[var(--pink)]'
                  )}>
                    {CONDITION_LABELS[p.condition] || p.condition}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{formatPrice(p.price)}</span>
                  <span className="text-xs text-[var(--text-muted)]">Qty: {p.quantity}</span>
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg py-2 text-xs flex items-center justify-center gap-1 hover:border-[var(--blue)]">
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
