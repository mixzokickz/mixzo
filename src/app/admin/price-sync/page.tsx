'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface Product { id: string; name: string; price: number; stockx_id?: string; market_price?: number; image_url?: string }

export default function PriceSyncPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('products').select('id, name, price, stockx_id, market_price, image_url').eq('status', 'active').not('stockx_id', 'is', null)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    // Placeholder — would call StockX API
    await new Promise(r => setTimeout(r, 2000))
    setLastSync(new Date().toLocaleString())
    setSyncing(false)
  }

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Price Sync</h1>
          <p className="text-sm text-[var(--text-muted)]">{products.length} products with StockX IDs{lastSync && ` · Last sync: ${lastSync}`}</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--cyan)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <RefreshCw size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No synced products</h2>
          <p className="text-sm text-[var(--text-secondary)]">Add StockX IDs to products to enable price syncing</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => {
            const diff = p.market_price ? p.price - p.market_price : 0
            const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus
            const color = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-[var(--text-muted)]'
            return (
              <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition">
                <div className="flex items-center gap-4">
                  {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />}
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">StockX: {p.stockx_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-white font-medium">{formatPrice(p.price)}</p>
                    <p className="text-xs text-[var(--text-muted)]">Your price</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--text-secondary)]">{p.market_price ? formatPrice(p.market_price) : '—'}</p>
                    <p className="text-xs text-[var(--text-muted)]">Market</p>
                  </div>
                  <Icon size={16} className={color} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
