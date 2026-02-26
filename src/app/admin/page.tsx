'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DollarSign, Package, ShoppingCart, Users, ArrowUpRight, Plus, FileText,
  ScanLine, AlertTriangle, TrendingUp, TrendingDown, Eye, Clock, Truck,
  CheckCircle, XCircle, MessageSquare, Star, Activity
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const RechartsArea = dynamic(
  () => import('recharts').then(mod => {
    const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod
    return function Chart({ data }: { data: Array<{ date: string; revenue: number; orders: number }> }) {
      return (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF2E88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF2E88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#4A4A5A" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#4A4A5A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} width={45} />
            <Tooltip
              contentStyle={{ background: '#141418', border: '1px solid #1E1E26', borderRadius: '10px', fontSize: '11px', padding: '8px 12px' }}
              labelStyle={{ color: '#A0A0B8', fontSize: '10px' }}
              formatter={((value: number, name: string) => [name === 'revenue' ? `$${value.toFixed(2)}` : value, name === 'revenue' ? 'Revenue' : 'Orders']) as never}
            />
            <Area type="monotone" dataKey="revenue" stroke="#FF2E88" fill="url(#colorRev)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }
  }),
  { ssr: false, loading: () => <div className="h-[180px] shimmer rounded-lg" /> }
)

type TimeRange = '1d' | '7d' | '30d' | '90d' | 'all'

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Data
  const [revenue, setRevenue] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [unitCount, setUnitCount] = useState(0)
  const [inventoryValue, setInventoryValue] = useState(0)
  const [inventoryCost, setInventoryCost] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [avgOrderValue, setAvgOrderValue] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [ticketCount, setTicketCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => { load() }, [timeRange])

  async function load() {
    setLoading(true)
    const numDays = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const since = new Date(Date.now() - numDays * 86400000).toISOString()

    const [prodRes, ordersRes, allOrdersRes, customersRes, ticketsRes] = await Promise.all([
      supabase.from('products').select('*').eq('status', 'active'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      timeRange === 'all'
        ? supabase.from('orders').select('*')
        : supabase.from('orders').select('*').gte('created_at', since),
      supabase.from('orders').select('customer_email'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ])

    const products = prodRes.data || []
    const allOrders = (allOrdersRes.data || []).filter((o: any) => o.status !== 'cancelled')
    const orders = ordersRes.data || []

    const rev = allOrders.reduce((s: number, o: any) => s + (o.total || 0), 0)
    const units = products.reduce((s: number, p: any) => s + (p.quantity || 0), 0)
    const invValue = products.reduce((s: number, p: any) => s + (p.price || 0) * (p.quantity || 0), 0)
    const invCost = products.reduce((s: number, p: any) => s + ((p.cost || 0) * (p.quantity || 0)), 0)
    const uniqueCustomers = new Set((customersRes.data || []).map((c: any) => c.customer_email)).size
    const pending = allOrders.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.status)).length

    // Chart data
    const days = Math.min(numDays, 90)
    const chart = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const ds = d.toISOString().split('T')[0]
      const dayOrders = allOrders.filter((o: any) => o.created_at?.startsWith(ds))
      chart.push({
        date: days <= 7 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
        orders: dayOrders.length,
      })
    }

    // Top products by quantity (from orders)
    const productSales: Record<string, { name: string; qty: number; rev: number; image: string }> = {}
    for (const o of allOrders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const key = item.name || item.product_id
          if (!productSales[key]) productSales[key] = { name: item.name || key, qty: 0, rev: 0, image: item.image || '' }
          productSales[key].qty += item.quantity || 1
          productSales[key].rev += (item.price || 0) * (item.quantity || 1)
        }
      }
    }
    const top = Object.values(productSales).sort((a, b) => b.rev - a.rev).slice(0, 5)

    setRevenue(rev)
    setOrderCount(allOrders.length)
    setProductCount(products.length)
    setUnitCount(units)
    setInventoryValue(invValue)
    setInventoryCost(invCost)
    setCustomerCount(uniqueCustomers)
    setAvgOrderValue(allOrders.length > 0 ? rev / allOrders.length : 0)
    setPendingOrders(pending)
    setTicketCount(ticketsRes.count || 0)
    setRecentOrders(orders)
    setRecentProducts(products.slice(0, 6))
    setChartData(chart)
    setTopProducts(top)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-48 shimmer rounded-xl" />)}</div>
      </div>
    )
  }

  const profit = inventoryValue - inventoryCost

  return (
    <div className="space-y-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">Overview — sales, inventory, and what needs attention</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1">
          {(['1d','7d','30d','90d','all'] as TimeRange[]).map(v => (
            <button key={v} onClick={() => setTimeRange(v)} className={cn('px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all', timeRange === v ? 'bg-[#FF2E88] text-white' : 'text-[var(--text-muted)] hover:text-white')}>
              {v === 'all' ? 'All' : v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(pendingOrders > 0 || ticketCount > 0) && (
        <div className="flex gap-3">
          {pendingOrders > 0 && (
            <Link href="/admin/orders" className="flex-1 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 hover:border-yellow-500/40 transition">
              <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{pendingOrders} order{pendingOrders > 1 ? 's' : ''} need attention</p>
                <p className="text-[11px] text-[var(--text-muted)]">Pending or paid, waiting to be processed</p>
              </div>
              <span className="text-xs text-yellow-400 font-medium shrink-0">Review →</span>
            </Link>
          )}
          {ticketCount > 0 && (
            <Link href="/admin/tickets" className="flex items-center gap-3 bg-[#FF2E88]/10 border border-[#FF2E88]/20 rounded-xl px-4 py-3 hover:border-[#FF2E88]/40 transition">
              <MessageSquare size={18} className="text-[#FF2E88]" />
              <span className="text-sm font-medium text-white">{ticketCount} open ticket{ticketCount > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/admin/scan" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF2E88] text-white text-sm font-semibold hover:opacity-90 transition">
          <ScanLine size={16} /> Scan Product
        </Link>
        <Link href="/admin/orders/new" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:text-white hover:border-[var(--pink)]/30 transition">
          <ShoppingCart size={16} /> Create Order
        </Link>
        <Link href="/admin/products" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:text-white hover:border-[var(--pink)]/30 transition">
          <Eye size={16} /> View Inventory
        </Link>
      </div>

      {/* Inventory Overview — 5 KPIs */}
      <div>
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Inventory Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            { label: 'Products', value: productCount.toString(), icon: Package, color: '#FF2E88', sub: `${unitCount} total units` },
            { label: 'Inventory Value', value: formatPrice(inventoryValue), icon: DollarSign, color: '#00C2D6', sub: 'at sell price' },
            { label: 'Total Cost', value: formatPrice(inventoryCost), icon: TrendingDown, color: '#A855F7', sub: 'cost basis' },
            { label: 'Potential Profit', value: formatPrice(profit), icon: TrendingUp, color: profit >= 0 ? '#10B981' : '#EF4444', sub: inventoryCost > 0 ? `${((profit / inventoryCost) * 100).toFixed(1)}% margin` : 'no cost data' },
            { label: 'Avg Unit Price', value: unitCount > 0 ? formatPrice(inventoryValue / unitCount) : '$0', icon: Activity, color: '#F59E0B', sub: 'per item' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{kpi.label}</span>
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
              <p className="text-lg font-bold text-white font-mono leading-none">{kpi.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Performance — 4 KPIs */}
      <div>
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Sales Performance</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: 'Revenue', value: formatPrice(revenue), icon: DollarSign, color: '#FF2E88' },
            { label: 'Orders', value: orderCount.toString(), icon: ShoppingCart, color: '#00C2D6' },
            { label: 'Avg Order Value', value: formatPrice(avgOrderValue), icon: TrendingUp, color: '#A855F7' },
            { label: 'Customers', value: customerCount.toString(), icon: Users, color: '#10B981' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{kpi.label}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                  <kpi.icon size={14} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-white font-mono">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart + Recent Orders side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Chart — 3 cols */}
        <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h2 className="text-xs font-semibold text-white mb-3">Revenue Over Time</h2>
          <RechartsArea data={chartData} />
        </div>

        {/* Recent Orders — 2 cols */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] text-[var(--pink)] hover:underline">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-0.5">
              {recentOrders.map(o => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">#{(o.order_number || o.id).slice(0, 12)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{o.customer_name || o.customer_email || 'Guest'}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-bold text-white font-mono">{formatPrice(o.total || 0)}</p>
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                      o.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                      o.status === 'shipped' ? 'bg-cyan-500/10 text-cyan-400' :
                      o.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    )}>{o.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Added + Top Products side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recently Added Products */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white">Recently Added</h2>
            <Link href="/admin/products" className="text-[10px] text-[var(--pink)] hover:underline">View all →</Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-6">No products yet — scan your first item!</p>
          ) : (
            <div className="space-y-0.5">
              {recentProducts.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.02]">
                  {(p.image_url || p.images?.[0]) ? (
                    <img src={p.image_url || p.images[0]} alt="" className="w-9 h-9 rounded-lg object-contain bg-white shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0"><Package size={14} className="text-[var(--text-muted)]" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Size {p.size} · Qty {p.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-white font-mono shrink-0">{formatPrice(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h2 className="text-xs font-semibold text-white mb-3">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-6">Sales data will appear after orders come in</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{p.qty} sold</p>
                  </div>
                  <p className="text-xs font-bold text-[#FF2E88] font-mono">{formatPrice(p.rev)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Pipeline */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
        <h2 className="text-xs font-semibold text-white mb-3">Order Pipeline</h2>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Pending', icon: Clock, count: recentOrders.filter(o => o.status === 'pending').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Processing', icon: Activity, count: recentOrders.filter(o => ['confirmed','processing'].includes(o.status)).length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Shipped', icon: Truck, count: recentOrders.filter(o => o.status === 'shipped').length, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Delivered', icon: CheckCircle, count: recentOrders.filter(o => o.status === 'delivered').length, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Cancelled', icon: XCircle, count: recentOrders.filter(o => o.status === 'cancelled').length, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(s => (
            <div key={s.label} className="text-center py-3 rounded-xl bg-[var(--bg-elevated)]">
              <div className={cn('w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center', s.bg)}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-lg font-bold text-white font-mono">{s.count}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
