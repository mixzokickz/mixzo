'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight, Plus, FileText, BarChart3 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const RechartsArea = dynamic(
  () => import('recharts').then(mod => {
    const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod
    return function Chart({ data }: { data: Array<{ date: string; revenue: number }> }) {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF2E88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF2E88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#6A6A80" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6A6A80" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#141418', border: '1px solid #1E1E26', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#A0A0B8' }}
              itemStyle={{ color: '#FF2E88' }}
              formatter={((value: number | undefined) => [`$${value ?? 0}`, 'Revenue']) as never}
            />
            <Area type="monotone" dataKey="revenue" stroke="#FF2E88" fill="url(#colorRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }
  }),
  { ssr: false, loading: () => <div className="skeleton h-[220px] w-full rounded-xl" /> }
)

type TimeRange = '1d' | '7d' | '30d' | '90d' | 'all'
const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1d', label: '1D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'All' },
]

function getDaysForRange(range: TimeRange): number {
  switch (range) {
    case '1d': return 1
    case '7d': return 7
    case '30d': return 30
    case '90d': return 90
    case 'all': return 365
  }
}

interface Stats {
  revenue: number
  orders: number
  products: number
  customers: number
  revenueChange: number
  ordersChange: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, products: 0, customers: 0, revenueChange: 0, ordersChange: 0 })
  const [chartData, setChartData] = useState<Array<{ date: string; revenue: number }>>([])
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; total: number; status: string; created_at: string; customer_name?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  useEffect(() => {
    async function load() {
      const numDays = getDaysForRange(timeRange)
      const since = new Date()
      since.setDate(since.getDate() - numDays)
      const sinceStr = since.toISOString()

      const [products, orders, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status, created_at, customer_name').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      ])

      const allOrders = timeRange === 'all'
        ? await supabase.from('orders').select('total, created_at, status')
        : await supabase.from('orders').select('total, created_at, status').gte('created_at', sinceStr)

      const totalRevenue = allOrders.data?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0) || 0

      // Build chart data
      const chartDays = Math.min(numDays, 90)
      const days: Array<{ date: string; revenue: number }> = []
      for (let i = chartDays - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayRevenue = allOrders.data
          ?.filter(o => o.created_at?.startsWith(dateStr) && o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0) || 0
        const fmt = chartDays <= 7
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        days.push({ date: fmt, revenue: dayRevenue })
      }

      setStats({
        revenue: totalRevenue,
        orders: allOrders.data?.length || 0,
        products: products.count || 0,
        customers: customers.count || 0,
        revenueChange: 0,
        ordersChange: 0,
      })
      setChartData(days)
      setRecentOrders(orders.data || [])
      setLoading(false)
    }
    load()
  }, [timeRange])

  const statCards = [
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, href: '/admin/analytics', color: 'bg-[#FF2E88]/10 text-[#FF2E88]' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingCart, href: '/admin/orders', color: 'bg-[#00C2D6]/10 text-[#00C2D6]' },
    { label: 'Products', value: stats.products.toString(), icon: Package, href: '/admin/products', color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, href: '/admin/customers', color: 'bg-green-500/10 text-green-400' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)]">Here&apos;s what&apos;s happening with your store</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/admin/products/new" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FF2E88] text-white text-xs font-medium hover:opacity-90 transition">
            <Plus size={14} /> Add Product
          </Link>
          <Link href="/admin/orders/new" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141418] border border-[#1E1E26] text-white text-xs font-medium hover:bg-[#1A1A22] transition">
            <FileText size={14} /> Create Order
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141418] border border-[#1E1E26] text-white text-xs font-medium hover:bg-[#1A1A22] transition">
            <BarChart3 size={14} /> Reports
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-[#141418] border border-[#1E1E26] rounded-xl p-4 hover:border-[#FF2E88]/30 transition-colors min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Revenue</h2>
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-lg p-0.5">
            {TIME_RANGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === value
                    ? 'bg-[#FF2E88] text-white'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <RechartsArea data={chartData} />
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-[var(--pink)] hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-2">
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
      </div>
    </div>
  )
}
