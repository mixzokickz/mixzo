'use client'

import { useState } from 'react'
import { Search, Package, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

interface Order {
  order_id: string
  status: string
  total: number
  created_at: string
  customer_name: string
  shipping_address: string
}

export default function OrderLookupPage() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const { data } = await supabase
      .from('orders')
      .select('order_id, status, total, created_at, customer_name, shipping_address')
      .or(`order_id.eq.${query.trim()},customer_email.eq.${query.trim()}`)
      .limit(1)
      .single()
    setOrder(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-2">Order Lookup</h1>
          <p className="text-text-muted mb-8">Track your order using your order ID or email address.</p>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <Input placeholder="Order ID or email" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button type="submit" disabled={loading}>
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {searched && !loading && !order && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-text-muted mb-3" />
              <h3 className="text-lg font-semibold mb-1">No order found</h3>
              <p className="text-sm text-text-muted">Check your order ID or email and try again.</p>
            </div>
          )}

          {order && (
            <div className="rounded-xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Order ID</p>
                  <p className="font-bold gradient-text">{order.order_id}</p>
                </div>
                <Badge>{order.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Customer</p>
                  <p className="text-sm">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Date</p>
                  <p className="text-sm">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Total</p>
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Shipping To</p>
                  <p className="text-sm">{order.shipping_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border text-sm text-text-muted">
                <Truck className="w-4 h-4 text-cyan" />
                Tracking details will be emailed once your order ships.
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
