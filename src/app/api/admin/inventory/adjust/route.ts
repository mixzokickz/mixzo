import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_id, size, adjustment, reason } = await request.json()
    if (!product_id || adjustment === undefined) {
      return NextResponse.json({ error: 'product_id and adjustment required' }, { status: 400 })
    }

    // Log the adjustment
    await supabaseAdmin.from('inventory_adjustments').insert({
      product_id,
      size: size || null,
      adjustment,
      reason: reason || '',
      adjusted_by: user.id,
    })

    // Update product quantity
    const { data: product } = await supabaseAdmin.from('products').select('quantity').eq('id', product_id).single()
    const newQty = Math.max(0, (product?.quantity || 0) + adjustment)

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ quantity: newQty })
      .eq('id', product_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data, newQuantity: newQty })
  } catch (error) {
    console.error('Inventory adjust error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
