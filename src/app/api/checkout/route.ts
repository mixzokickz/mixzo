import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { items, customer, shipping_address, discount_code, gift_card_code, payment_method } = await request.json()

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!customer?.email) return NextResponse.json({ error: 'Customer email required' }, { status: 400 })
    if (!shipping_address) return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })

    // Calculate totals
    let subtotal = 0
    const orderItems: Array<{ product_id: string; name: string; size: string; quantity: number; price: number }> = []

    for (const item of items) {
      const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', item.product_id).single()
      if (!product) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 })
      if (product.quantity < item.quantity) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
      }
      subtotal += product.price * item.quantity
      orderItems.push({
        product_id: product.id,
        name: product.name,
        size: item.size || '',
        quantity: item.quantity,
        price: product.price,
      })
    }

    let discount = 0
    if (discount_code) {
      const { data: disc } = await supabaseAdmin
        .from('discounts')
        .select('*')
        .eq('code', discount_code.toUpperCase())
        .eq('active', true)
        .single()

      if (disc) {
        discount = disc.type === 'percentage' ? subtotal * (disc.value / 100) : disc.value
        // Increment usage
        await supabaseAdmin.from('discounts').update({ times_used: (disc.times_used || 0) + 1 }).eq('id', disc.id)
      }
    }

    let giftCardAmount = 0
    if (gift_card_code) {
      const { data: gc } = await supabaseAdmin
        .from('gift_cards')
        .select('*')
        .eq('code', gift_card_code.toUpperCase())
        .eq('status', 'active')
        .single()

      if (gc && gc.balance > 0) {
        giftCardAmount = Math.min(gc.balance, subtotal - discount)
        await supabaseAdmin.from('gift_cards').update({ balance: gc.balance - giftCardAmount }).eq('id', gc.id)
      }
    }

    const shipping = 0 // Free shipping for now
    const total = Math.max(0, subtotal - discount - giftCardAmount + shipping)

    const orderNumber = `MXZ-${Date.now().toString(36).toUpperCase()}`

    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      order_number: orderNumber,
      customer_email: customer.email,
      customer_name: customer.name || '',
      customer_phone: customer.phone || '',
      shipping_address,
      items: orderItems,
      subtotal,
      discount,
      gift_card_amount: giftCardAmount,
      shipping,
      total,
      status: 'pending',
      payment_method: payment_method || 'pending',
      discount_code: discount_code || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Decrement inventory
    for (const item of orderItems) {
      const { data: current } = await supabaseAdmin.from('products').select('quantity').eq('id', item.product_id).single()
      if (current) {
        await supabaseAdmin.from('products').update({ quantity: Math.max(0, current.quantity - item.quantity) }).eq('id', item.product_id)
      }
    }

    return NextResponse.json({ order, order_number: orderNumber }, { status: 201 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
