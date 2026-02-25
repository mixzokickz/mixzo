import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const { data: discount, error } = await supabaseAdmin
      .from('discounts')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single()

    if (error || !discount) return NextResponse.json({ valid: false, error: 'Invalid discount code' }, { status: 404 })

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Discount code expired' })
    }

    if (discount.max_uses && discount.times_used >= discount.max_uses) {
      return NextResponse.json({ valid: false, error: 'Discount code usage limit reached' })
    }

    if (discount.min_purchase && subtotal && subtotal < discount.min_purchase) {
      return NextResponse.json({ valid: false, error: `Minimum purchase of $${discount.min_purchase} required` })
    }

    const amount = discount.type === 'percentage'
      ? (subtotal || 0) * (discount.value / 100)
      : discount.value

    return NextResponse.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        amount,
        description: discount.description,
      },
    })
  } catch (error) {
    console.error('Discount validate error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
