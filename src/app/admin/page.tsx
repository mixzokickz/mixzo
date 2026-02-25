'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight, ScanBarcode, Plus, Boxes } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stats {
  revenue: number
  orders: number
  products: number
  customers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; total: number; status: string; created_at: string; customer_name?: string }>>([])
  const [loading, setLoading] = useState(true)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    async function load() {
      const [products, orders, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status, created_at, customer_name').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      ])

      const allOrders = await supabase.from('orders').select('total, status')
      const totalRevenue = allOrders.data?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0) || 0
      const activeOrders = allOrders.data?.filter(o => !['delivered', 'cancelled'].includes(o.status)).length || 0

      setStats({
        revenue: totalRevenue,
        orders: activeOrders,
        products: products.count || 0,
        customers: customers.count || 0,
      })
      setRecentOrders(orders.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products.toString(), icon: Package, color: 'var(--pink)' },
    { label: 'Active Orders', value: stats.orders.toString(), icon: ShoppingCart, color: 'var(--cyan)' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: '#10B981' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: '#8B5CF6' },
  ]

  const quickActions = [
    { label: 'Scan Product', href: '/admin/scan', icon: ScanBarcode },
    { label: 'Create Order', href: '/admin/orders/new', icon: Plus },
    { label: 'View Inventory', href: '/admin/inventory', icon: Boxes },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{getGreeting()} 👋</h1>
        <p className="text-[var(--text-secondary)] mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--pink)]/30 transition-all duration-300 group"
            style={{ '--hover-color': color } as React.CSSProperties}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[var(--pink)]/30 transition-all duration-200 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pink)] to-[var(--cyan)] flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-[var(--pink)] hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-1">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-[var(--text-muted)]">{order.customer_name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatPrice(order.total)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                    order.status === 'shipped' ? 'bg-cyan-500/10 text-cyan-400' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
