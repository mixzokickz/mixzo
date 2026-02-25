import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, quantity, status')
      .eq('status', 'active')
      .order('name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      products: products || [],
      total_items: products?.length || 0,
      total_quantity: products?.reduce((sum: number, p: { quantity?: number }) => sum + (p.quantity || 0), 0) || 0,
    })
  } catch (error) {
    console.error('Reconciliation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await request.json()
    if (!Array.isArray(items)) return NextResponse.json({ error: 'items array required' }, { status: 400 })

    const results = []
    for (const item of items) {
      const { product_id, actual_quantity } = item
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ quantity: actual_quantity })
        .eq('id', product_id)
        .select()
        .single()
      results.push({ product_id, success: !error, error: error?.message })
    }

    await supabaseAdmin.from('reconciliation_logs').insert({
      performed_by: user.id,
      items_count: items.length,
      completed_at: new Date().toISOString(),
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Reconciliation POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
