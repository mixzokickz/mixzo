import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
    const days = daysMap[period] || 30
    const since = new Date(Date.now() - days * 86400000).toISOString()

    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabaseAdmin.from('orders').select('*').gte('created_at', since),
      supabaseAdmin.from('products').select('id, status', { count: 'exact' }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
    ])

    const orders = ordersRes.data || []
    const totalRevenue = orders.reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      revenue: totalRevenue,
      orders: totalOrders,
      avgOrderValue,
      products: productsRes.count || 0,
      customers: customersRes.count || 0,
      period,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
