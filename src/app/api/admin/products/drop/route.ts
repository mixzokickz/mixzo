import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_id, deal_price, starts_at, ends_at } = await request.json()
    if (!product_id || !deal_price) {
      return NextResponse.json({ error: 'product_id and deal_price required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from('deals').insert({
      product_id,
      deal_price,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      created_by: user.id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deal: data }, { status: 201 })
  } catch (error) {
    console.error('Product drop error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
