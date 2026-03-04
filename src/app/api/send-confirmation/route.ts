export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendOrderConfirmation, sendShippingNotification, sendCleaningConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { order_number, email, type } = await request.json()

    if (!order_number || !email) {
      return NextResponse.json({ error: 'order_number and email required' }, { status: 400 })
    }

    // Fetch order from Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', order_number)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const emailType = type || 'confirmation'

    switch (emailType) {
      case 'confirmation': {
        await sendOrderConfirmation({
          order_number: order.order_number,
          customer_email: email,
          customer_name: order.customer_name || '',
          items: order.items || [],
          subtotal: order.subtotal || 0,
          discount: order.discount || 0,
          gift_card_amount: order.gift_card_amount || 0,
          shipping: order.shipping || 0,
          total: order.total || 0,
          shipping_address: order.shipping_address || { line1: '', city: '', state: '', postal_code: '', country: 'US' },
        })
        break
      }
      case 'shipping': {
        if (!order.tracking_number || !order.tracking_url) {
          return NextResponse.json({ error: 'Order has no tracking info' }, { status: 400 })
        }
        await sendShippingNotification({
          order_number: order.order_number,
          customer_email: email,
          customer_name: order.customer_name || '',
          tracking_number: order.tracking_number,
          tracking_url: order.tracking_url,
          items: (order.items || []).map((i: { name: string; size: string; quantity: number }) => ({
            name: i.name,
            size: i.size,
            quantity: i.quantity,
          })),
        })
        break
      }
      case 'cleaning': {
        const cleaningItems = (order.items || [])
          .filter((i: { cleaning?: string }) => i.cleaning)
          .map((i: { name: string; size: string; cleaning: string }) => ({
            name: i.name,
            size: i.size,
            tier: i.cleaning,
          }))

        if (!cleaningItems.length) {
          return NextResponse.json({ error: 'No cleaning services in this order' }, { status: 400 })
        }

        await sendCleaningConfirmation({
          customer_email: email,
          customer_name: order.customer_name || '',
          items: cleaningItems,
          order_number: order.order_number,
          total: cleaningItems.reduce((sum: number, i: { tier: string }) =>
            sum + (i.tier === 'cleaning' ? 20 : 30), 0
          ),
        })
        break
      }
      default:
        return NextResponse.json({ error: `Unknown email type: ${emailType}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${emailType} email sent`,
      to: email,
      order_number,
    })
  } catch (error) {
    console.error('Send confirmation error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
