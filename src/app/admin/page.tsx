'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface Stats {
  products: number
  orders: number
  revenue: number
  customers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, revenue: 0, customers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      const revenue = (orders.data || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        revenue,
        customers: customers.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'var(--pink)' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingCart, color: 'var(--blue)' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'var(--pink)' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'var(--blue)' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{c.label}</span>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <p className="text-2xl font-bold">{loading ? '--' : c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
