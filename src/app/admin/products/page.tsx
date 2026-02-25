'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Plus, Package, Edit, Eye, Trash2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { CONDITION_LABELS } from '@/lib/constants'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  condition: string
  price: number
  quantity: number
  images: string[]
  status: string
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    const token = (await supabase.auth.getSession()).data.session?.access_token
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    })
    toast.success('Product deleted')
    loadProducts()
  }

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-40" />
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-[var(--text-muted)]">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Package size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No products found</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Add your first product to get started</p>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Condition</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Size</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-contain bg-white" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center"><Package size={16} className="text-[var(--text-muted)]" /></div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{CONDITION_LABELS[p.condition] || p.condition}</span></td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.size}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${p.id}/edit`} className="p-2 text-[var(--text-muted)] hover:text-white rounded-lg hover:bg-white/5"><Edit size={14} /></Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-[var(--text-muted)] hover:text-red-400 rounded-lg hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-[var(--border)]">
            {filtered.map(p => (
              <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 p-4 hover:bg-white/[0.02]">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-contain bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center"><Package size={18} className="text-[var(--text-muted)]" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">Size {p.size} / {CONDITION_LABELS[p.condition]}</p>
                </div>
                <p className="text-sm font-bold text-white">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
