import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin.from('refunds').select('*, orders(*)').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ refunds: data })
  } catch (error) {
    console.error('Refunds GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id, amount, reason } = await request.json()
    if (!order_id || !amount) return NextResponse.json({ error: 'order_id and amount required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('refunds').insert({
      order_id,
      amount,
      reason: reason || '',
      status: 'pending',
      processed_by: user.id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update order status
    await supabaseAdmin.from('orders').update({ status: 'refunded' }).eq('id', order_id)

    return NextResponse.json({ refund: data }, { status: 201 })
  } catch (error) {
    console.error('Refunds POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
