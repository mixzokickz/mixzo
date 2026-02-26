'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Flame, Plus, Trash2, X, DollarSign, TrendingDown, Zap,
  Search, Package, Tag, ToggleLeft, ToggleRight, Percent,
  BadgeDollarSign, ChevronDown, Check
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  images: string[]
  image_url: string | null
}

interface Deal {
  id: string
  product_id: string
  original_price: number
  sale_price: number
  active: boolean
  created_at: string
  product?: Product
}

// ─── Custom Product Selector ─────────────────────────────────
function ProductSelector({
  products,
  selectedId,
  onSelect,
  excludeIds = [],
}: {
  products: Product[]
  selectedId: string
  onSelect: (id: string) => void
  excludeIds?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = products.find(p => p.id === selectedId)
  const available = products.filter(p => !excludeIds.includes(p.id))
  const filtered = available.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.size?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  function getImage(p: Product) {
    return p.image_url || p.images?.[0] || null
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left',
          'bg-[#141418] border-[#1E1E26] hover:border-[#2A2A35]',
          open && 'border-[#FF2E88] ring-1 ring-[#FF2E88]/20',
          !selected && 'text-[#555]'
        )}
      >
        {selected ? (
          <>
            <div className="w-10 h-10 rounded-lg bg-[#1A1A22] border border-[#1E1E26] overflow-hidden shrink-0">
              {getImage(selected) ? (
                <img src={getImage(selected)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={16} className="text-[#555]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{selected.name}</p>
              <p className="text-xs text-[#888]">{selected.brand} · Size {selected.size} · {formatPrice(selected.price)}</p>
            </div>
            <X
              size={16}
              className="text-[#555] hover:text-white cursor-pointer shrink-0"
              onClick={(e) => { e.stopPropagation(); onSelect(''); setSearch('') }}
            />
          </>
        ) : (
          <>
            <Package size={18} className="text-[#555] shrink-0" />
            <span className="text-sm">Select a product...</span>
            <ChevronDown size={16} className="text-[#555] ml-auto shrink-0" />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#141418] border-2 border-[#1E1E26] rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-[#1E1E26]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, brand, or size..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0C0C0C] border border-[#1E1E26] rounded-lg text-sm text-white placeholder:text-[#555] focus:border-[#FF2E88] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="max-h-[320px] overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Package size={24} className="text-[#333] mx-auto mb-2" />
                  <p className="text-sm text-[#555]">No products found</p>
                </div>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { onSelect(p.id); setOpen(false); setSearch('') }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      'hover:bg-[#1A1A22]',
                      selectedId === p.id && 'bg-[#FF2E88]/5'
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#1A1A22] border border-[#1E1E26] overflow-hidden shrink-0">
                      {getImage(p) ? (
                        <img src={getImage(p)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-[#555]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#888]">{p.brand}</span>
                        <span className="text-xs text-[#444]">·</span>
                        <span className="text-xs text-[#888]">Size {p.size}</span>
                        <span className="text-xs text-[#444]">·</span>
                        <span className="text-xs font-semibold text-[#00C2D6]">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                    {selectedId === p.id && (
                      <Check size={16} className="text-[#FF2E88] shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Count */}
            <div className="px-4 py-2 border-t border-[#1E1E26] bg-[#0C0C0C]">
              <p className="text-[11px] text-[#555]">{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string | number; accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141418] border border-[#1E1E26] rounded-2xl p-5 relative overflow-hidden"
    >
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none', accent)} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={14} className="text-[#888]" />
          <span className="text-xs text-[#888] font-medium uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function DailyDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formProductId, setFormProductId] = useState('')
  const [formSalePrice, setFormSalePrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    const token = session?.session?.access_token
    if (!token) return

    const [dealsRes, productsRes] = await Promise.all([
      fetch('/api/admin/deals', { headers: { Authorization: `Bearer ${token}` } }),
      supabase.from('products').select('id, name, brand, size, price, images, image_url').eq('status', 'active').order('name'),
    ])

    if (dealsRes.ok) {
      const dealsData = await dealsRes.json()
      setDeals(dealsData)
    }
    setProducts(productsRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const activeDeals = deals.filter(d => d.active)
  const inactiveDeals = deals.filter(d => !d.active)
  const totalSavings = activeDeals.reduce((sum, d) => sum + (d.original_price - d.sale_price), 0)
  const avgDiscount = activeDeals.length > 0
    ? Math.round(activeDeals.reduce((sum, d) =>
        sum + (d.original_price > 0 ? ((d.original_price - d.sale_price) / d.original_price) * 100 : 0), 0) / activeDeals.length)
    : 0

  const dealProductIds = deals.filter(d => d.active).map(d => d.product_id)
  const selectedProduct = products.find(p => p.id === formProductId)
  const discountPercent = selectedProduct && formSalePrice
    ? Math.round((1 - parseFloat(formSalePrice) / selectedProduct.price) * 100)
    : 0

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token || ''
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault()
    if (!formProductId || !formSalePrice) return
    setSaving(true)

    try {
      const token = await getToken()
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: formProductId, sale_price: parseFloat(formSalePrice) }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to create deal')
      } else {
        toast.success('Deal created')
        setShowForm(false)
        setFormProductId('')
        setFormSalePrice('')
        loadData()
      }
    } catch {
      toast.error('Failed to create deal')
    }
    setSaving(false)
  }

  async function deleteDeal(id: string) {
    setDeletingId(id)
    try {
      const token = await getToken()
      const res = await fetch(`/api/admin/deals?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast.success('Deal removed')
        loadData()
      } else {
        toast.error('Failed to delete deal')
      }
    } catch {
      toast.error('Failed to delete deal')
    }
    setDeletingId(null)
  }

  async function toggleDeal(id: string, active: boolean) {
    setTogglingId(id)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, active }),
      })

      if (res.ok) {
        toast.success(active ? 'Deal activated' : 'Deal paused')
        loadData()
      } else {
        toast.error('Failed to update deal')
      }
    } catch {
      toast.error('Failed to update deal')
    }
    setTogglingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <div className="h-10 w-56 shimmer rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FF2E88] flex items-center justify-center shadow-lg shadow-[#FF2E88]/25">
            <Flame size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Daily Deals</h1>
            <p className="text-sm text-[#888]">Manage special pricing on products</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]',
            showForm
              ? 'bg-[#141418] border border-[#1E1E26] text-[#888] hover:text-white'
              : 'bg-[#FF2E88] text-white shadow-lg shadow-[#FF2E88]/25 hover:shadow-[#FF2E88]/40'
          )}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Deal</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Flame} label="Active Deals" value={activeDeals.length} accent="bg-[#FF2E88]" />
        <StatCard icon={BadgeDollarSign} label="Total Savings" value={formatPrice(totalSavings)} accent="bg-[#00C2D6]" />
        <StatCard icon={Percent} label="Avg Discount" value={`${avgDiscount}%`} accent="bg-[#F59E0B]" />
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onSubmit={createDeal}
          >
            <div className="bg-[#141418] border border-[#1E1E26] rounded-2xl p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF2E88]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap size={14} className="text-[#FF2E88]" /> Create New Deal
                </h3>

                {/* Product Selector */}
                <div>
                  <label className="block text-xs text-[#888] mb-2 font-medium uppercase tracking-wider">Product</label>
                  <ProductSelector
                    products={products}
                    selectedId={formProductId}
                    onSelect={setFormProductId}
                    excludeIds={dealProductIds}
                  />
                </div>

                {/* Price + Discount Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#888] mb-2 font-medium uppercase tracking-wider">Original Price</label>
                    <div className="px-4 py-3 rounded-xl bg-[#0C0C0C] border-2 border-[#1E1E26] text-sm text-[#555]">
                      {selectedProduct ? formatPrice(selectedProduct.price) : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#888] mb-2 font-medium uppercase tracking-wider">Deal Price</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedProduct?.price || 9999}
                        value={formSalePrice}
                        onChange={e => setFormSalePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0C0C0C] border-2 border-[#1E1E26] text-sm text-white placeholder:text-[#555] focus:border-[#FF2E88] focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#888] mb-2 font-medium uppercase tracking-wider">Discount</label>
                    <div className={cn(
                      'px-4 py-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2',
                      discountPercent > 0
                        ? 'bg-[#FF2E88]/5 border-[#FF2E88]/20 text-[#FF2E88]'
                        : 'bg-[#0C0C0C] border-[#1E1E26] text-[#555]'
                    )}>
                      <TrendingDown size={14} />
                      {discountPercent > 0 ? `${discountPercent}% OFF` : '—'}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving || !formProductId || !formSalePrice || discountPercent <= 0}
                    className="px-6 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#FF2E88]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : 'Create Deal'}
                  </button>
                  {discountPercent > 0 && selectedProduct && (
                    <p className="text-xs text-[#888]">
                      Customer saves {formatPrice(selectedProduct.price - parseFloat(formSalePrice))} per pair
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Deals */}
      {deals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141418] border border-[#1E1E26] rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E88]/3 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-[#FF2E88]/10 border border-[#FF2E88]/20 flex items-center justify-center mx-auto mb-5">
              <Flame size={32} className="text-[#FF2E88]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No Deals Yet</h2>
            <p className="text-sm text-[#888]">Create your first deal to offer special pricing</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#FF2E88]/25 transition-all active:scale-[0.97]"
            >
              <Plus size={14} className="inline mr-1.5 -mt-0.5" /> Create First Deal
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Active Deals Section */}
          {activeDeals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Deals ({activeDeals.length})</h2>
              </div>
              <div className="space-y-2">
                {activeDeals.map((deal, i) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    index={i}
                    onToggle={toggleDeal}
                    onDelete={deleteDeal}
                    togglingId={togglingId}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Deals Section */}
          {inactiveDeals.length > 0 && (
            <InactiveDealsSection
              deals={inactiveDeals}
              onToggle={toggleDeal}
              onDelete={deleteDeal}
              togglingId={togglingId}
              deletingId={deletingId}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── Deal Row ────────────────────────────────────────────────
function DealRow({
  deal, index, onToggle, onDelete, togglingId, deletingId
}: {
  deal: Deal; index: number;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  togglingId: string | null; deletingId: string | null;
}) {
  const discount = deal.original_price > 0
    ? Math.round((1 - deal.sale_price / deal.original_price) * 100)
    : 0
  const img = deal.product?.image_url || deal.product?.images?.[0] || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'bg-[#141418] border rounded-2xl p-4 flex items-center gap-4 group transition-all',
        deal.active ? 'border-[#1E1E26] hover:border-[#2A2A35]' : 'border-[#1A1A1E] opacity-60'
      )}
    >
      {/* Product Image */}
      <div className="w-14 h-14 rounded-xl bg-[#1A1A22] border border-[#1E1E26] overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={20} className="text-[#555]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{deal.product?.name || 'Unknown Product'}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {deal.product?.brand && (
            <span className="text-xs text-[#888]">{deal.product.brand}</span>
          )}
          {deal.product?.size && (
            <>
              <span className="text-xs text-[#333]">·</span>
              <span className="text-xs text-[#888]">Size {deal.product.size}</span>
            </>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-[#666] line-through">{formatPrice(deal.original_price)}</span>
          <span className="text-sm text-[#FF2E88] font-black">{formatPrice(deal.sale_price)}</span>
        </div>
        {discount > 0 && (
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FF2E88]/10 text-[#FF2E88] border border-[#FF2E88]/20">
            -{discount}%
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(deal.id, !deal.active)}
          disabled={togglingId === deal.id}
          className={cn(
            'p-2 rounded-lg transition-all',
            deal.active
              ? 'text-green-400 hover:bg-green-500/10'
              : 'text-[#555] hover:bg-[#1A1A22]'
          )}
          title={deal.active ? 'Pause deal' : 'Activate deal'}
        >
          {togglingId === deal.id ? (
            <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
          ) : deal.active ? (
            <ToggleRight size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this deal? Product pricing will be restored.')) {
              onDelete(deal.id)
            }
          }}
          disabled={deletingId === deal.id}
          className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete deal"
        >
          {deletingId === deal.id ? (
            <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Inactive Deals Section ──────────────────────────────────
function InactiveDealsSection({
  deals, onToggle, onDelete, togglingId, deletingId
}: {
  deals: Deal[];
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  togglingId: string | null; deletingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-bold text-[#888] hover:text-white transition-colors uppercase tracking-wider"
      >
        <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} />
        Inactive Deals ({deals.length})
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {deals.map((deal, i) => (
              <DealRow
                key={deal.id}
                deal={deal}
                index={i}
                onToggle={onToggle}
                onDelete={onDelete}
                togglingId={togglingId}
                deletingId={deletingId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
