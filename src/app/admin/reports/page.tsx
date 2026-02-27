'use client'

import { useState, useEffect } from 'react'
import { Download, DollarSign, Package, Users, TrendingUp, ShoppingBag, BarChart3, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Stats {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalProducts: number
  totalCustomers: number
  totalCost: number
  profit: number
  profitMargin: number
}

type ReportType = 'sales' | 'inventory' | 'customers'
type TimeRange = '7d' | '30d' | '90d' | 'all'

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  useEffect(() => {
    loadStats()
  }, [timeRange])

  async function loadStats() {
    setLoading(true)
    try {
      const now = new Date()
      let fromDate: string | null = null
      if (timeRange === '7d') fromDate = new Date(now.getTime() - 7 * 86400000).toISOString()
      else if (timeRange === '30d') fromDate = new Date(now.getTime() - 30 * 86400000).toISOString()
      else if (timeRange === '90d') fromDate = new Date(now.getTime() - 90 * 86400000).toISOString()

      // Fetch orders
      let ordersQuery = supabase.from('orders').select('*')
      if (fromDate) ordersQuery = ordersQuery.gte('created_at', fromDate)
      const { data: orders } = await ordersQuery

      // Fetch products
      const { data: products } = await supabase.from('products').select('*')

      // Fetch unique customer emails
      const { data: customers } = await supabase.from('orders').select('customer_email')

      const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0)
      const totalOrders = (orders || []).length
      const totalCost = (products || []).reduce((sum, p) => sum + ((p.cost || 0) * (p.quantity || 0)), 0)
      const uniqueEmails = new Set((customers || []).map(c => c.customer_email))

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        totalProducts: (products || []).length,
        totalCustomers: uniqueEmails.size,
        totalCost,
        profit: totalRevenue - totalCost,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
    setLoading(false)
  }

  async function generateReport(type: ReportType) {
    setGenerating(type)
    try {
      let csvContent = ''
      let filename = ''

      if (type === 'sales') {
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (!orders?.length) { toast.error('No orders to export'); setGenerating(null); return }
        csvContent = 'Order ID,Date,Customer,Email,Items,Subtotal,Shipping,Discount,Total,Status\n'
        csvContent += orders.map(o => {
          const items = Array.isArray(o.items) ? o.items.length : 0
          return `"${o.order_number || o.id}","${new Date(o.created_at).toLocaleDateString()}","${o.customer_name || ''}","${o.customer_email || ''}",${items},${o.subtotal || 0},${o.shipping || 0},${o.discount || 0},${o.total || 0},"${o.status || ''}"`
        }).join('\n')
        filename = `mixzo-sales-report-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'inventory') {
        const { data: products } = await supabase.from('products').select('*').order('name')
        if (!products?.length) { toast.error('No products to export'); setGenerating(null); return }
        csvContent = 'Name,Brand,Style ID,Size,Condition,Price,Cost,Quantity,Status,Date Added\n'
        csvContent += products.map(p =>
          `"${p.name}","${p.brand || ''}","${p.style_id || ''}","${p.size || ''}","${p.condition || ''}",${p.price || 0},${p.cost || 0},${p.quantity || 0},"${p.status || ''}","${new Date(p.created_at).toLocaleDateString()}"`
        ).join('\n')
        filename = `mixzo-inventory-report-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'customers') {
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (!orders?.length) { toast.error('No customer data to export'); setGenerating(null); return }
        // Group by customer email
        const customerMap: Record<string, { name: string; orders: number; totalSpent: number; lastOrder: string }> = {}
        for (const o of orders) {
          const email = o.customer_email || 'unknown'
          if (!customerMap[email]) customerMap[email] = { name: o.customer_name || '', orders: 0, totalSpent: 0, lastOrder: o.created_at }
          customerMap[email].orders++
          customerMap[email].totalSpent += o.total || 0
        }
        csvContent = 'Email,Name,Orders,Total Spent,Avg Order,Last Order\n'
        csvContent += Object.entries(customerMap).map(([email, c]) =>
          `"${email}","${c.name}",${c.orders},${c.totalSpent.toFixed(2)},${(c.totalSpent / c.orders).toFixed(2)},"${new Date(c.lastOrder).toLocaleDateString()}"`
        ).join('\n')
        filename = `mixzo-customer-report-${new Date().toISOString().split('T')[0]}.csv`
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`)
    } catch {
      toast.error('Failed to generate report')
    }
    setGenerating(null)
  }

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`

  const REPORTS = [
    { id: 'sales' as ReportType, title: 'Sales Report', desc: 'Orders, revenue, and payment details', icon: DollarSign, color: '#FF2E88' },
    { id: 'inventory' as ReportType, title: 'Inventory Report', desc: 'All products with pricing and stock levels', icon: Package, color: '#00C2D6' },
    { id: 'customers' as ReportType, title: 'Customer Report', desc: 'Customer spend, frequency, and lifetime value', icon: Users, color: '#A855F7' },
  ]

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-[var(--text-muted)]">Real-time business analytics and CSV exports</p>
        </div>

        {/* Time Range Pills */}
        <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1">
          {([['7d', '7D'], ['30d', '30D'], ['90d', '90D'], ['all', 'All']] as [TimeRange, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTimeRange(val)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                timeRange === val
                  ? 'bg-[#FF2E88] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 h-28 shimmer" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Revenue', value: fmt(stats.totalRevenue), icon: DollarSign, color: '#FF2E88', sub: `${stats.totalOrders} orders` },
            { label: 'Profit', value: fmt(stats.profit), icon: TrendingUp, color: stats.profit >= 0 ? '#10B981' : '#EF4444', sub: `${stats.profitMargin.toFixed(1)}% margin` },
            { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: '#00C2D6', sub: 'in inventory' },
            { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: '#A855F7', sub: stats.avgOrderValue > 0 ? `${fmt(stats.avgOrderValue)} avg` : 'no orders yet' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ background: `${kpi.color}15` }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{kpi.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Export Cards */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--text-muted)]" />
          Export Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REPORTS.map(r => (
            <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${r.color}15` }}>
                  <r.icon size={20} style={{ color: r.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="mt-auto">
                <button
                  onClick={() => generateReport(r.id)}
                  disabled={generating === r.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border"
                  style={{
                    background: `${r.color}10`,
                    borderColor: `${r.color}30`,
                    color: r.color,
                  }}
                >
                  {generating === r.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {generating === r.id ? 'Generating...' : 'Download CSV'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
