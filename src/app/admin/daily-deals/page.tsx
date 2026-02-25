'use client'

import { useEffect, useState } from 'react'
import { Flame, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Deal {
  id: string
  product_id: string
  sale_price: number
  active: boolean
  product?: { name: string; price: number; images: string[] }
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

export default function DailyDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [salePrice, setSalePrice] = useState('')

  const load = async () => {
    const [dealsRes, productsRes] = await Promise.all([
      supabase.from('daily_deals').select('*, product:products(name, price, images)'),
      supabase.from('products').select('id, name, price, images').eq('status', 'active'),
    ])
    setDeals(dealsRes.data || [])
    setProducts(productsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addDeal = async () => {
    if (!selectedProduct || !salePrice) return
    const { error } = await supabase.from('daily_deals').insert({
      product_id: selectedProduct,
      sale_price: parseFloat(salePrice),
      active: true,
    })
    if (error) { toast.error('Failed to create deal'); return }
    toast.success('Deal created')
    setShowAdd(false)
    setSelectedProduct('')
    setSalePrice('')
    load()
  }

  const toggleDeal = async (id: string, active: boolean) => {
    await supabase.from('daily_deals').update({ active: !active }).eq('id', id)
    setDeals(d => d.map(x => x.id === id ? { ...x, active: !active } : x))
  }

  const deleteDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await supabase.from('daily_deals').delete().eq('id', id)
    setDeals(d => d.filter(x => x.id !== id))
    toast.success('Deal deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Daily Deals</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-gradient text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6 space-y-3">
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full">
            <option value="">Select product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>)}
          </select>
          <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Sale price" className="w-full" />
          <button onClick={addDeal} className="btn-gradient text-white w-full py-3 rounded-xl font-semibold">Create Deal</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--pink)]" /></div>
      ) : deals.length === 0 ? (
        <div className="text-center py-12">
          <Flame size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No active deals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map(d => (
            <div key={d.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 card-hover flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden shrink-0">
                {d.product?.images?.[0] ? (
                  <img src={d.product.images[0]} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Package size={24} className="text-[var(--text-muted)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{d.product?.name || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[var(--text-muted)] line-through text-xs">{formatPrice(d.product?.price || 0)}</span>
                  <span className="text-[var(--pink)] font-bold">{formatPrice(d.sale_price)}</span>
                </div>
              </div>
              <button onClick={() => toggleDeal(d.id, d.active)} className="p-2">
                {d.active ? <ToggleRight size={28} className="text-[var(--pink)]" /> : <ToggleLeft size={28} className="text-[var(--text-muted)]" />}
              </button>
              <button onClick={() => deleteDeal(d.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
