'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#FF2E88', '#00C2D6', '#FF5C9A', '#33D1E0', '#CC2570', '#009BAB']

const ttStyle = {
  contentStyle: { background: '#141418', border: '1px solid #1E1E26', borderRadius: 8, color: '#F4F4F4', fontSize: 12 },
  itemStyle: { color: '#A0A0B8' },
}

function fmtVal(v: any) { return formatPrice(Number(v || 0)) }
function fmtTick(v: any) { return '$' + v }

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [conditionData, setConditionData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .order('created_at', { ascending: true })

      const byDay: Record<string, number> = {}
      ;(orders || []).forEach((o: any) => {
        const day = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        byDay[day] = (byDay[day] || 0) + (o.total || 0)
      })
      setRevenueData(Object.entries(byDay).map(([date, revenue]) => ({ date, revenue })))

      const { data: products } = await supabase.from('products').select('condition, quantity, name, price').eq('status', 'active')
      const condCounts: Record<string, number> = {}
      ;(products || []).forEach((p: any) => {
        const label = p.condition === 'new' ? 'New' : 'Preowned'
        condCounts[label] = (condCounts[label] || 0) + (p.quantity || 1)
      })
      setConditionData(Object.entries(condCounts).map(([name, value]) => ({ name, value })))

      const sorted = (products || []).sort((a: any, b: any) => b.price - a.price).slice(0, 5)
      setTopProducts(sorted.map((p: any) => ({ name: (p.name || '').slice(0, 20), price: p.price })))

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--pink)]" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Revenue Over Time</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2E88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF2E88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6A6A7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6A6A7A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtTick} />
                <Tooltip {...ttStyle} formatter={fmtVal} />
                <Area type="monotone" dataKey="revenue" stroke="#FF2E88" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6A6A7A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtTick} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#A0A0B0', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip {...ttStyle} formatter={fmtVal} />
                <Bar dataKey="price" fill="#00C2D6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Inventory Breakdown</h2>
          {conditionData.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={conditionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {conditionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
