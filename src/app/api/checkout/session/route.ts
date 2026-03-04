import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const stripe = getStripe()
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const orderNumber = searchParams.get('order_number')

    if (!sessionId && !orderNumber) {
      return NextResponse.json({ error: 'session_id or order_number required' }, { status: 400 })
    }

    // If we have a session_id, get the order number from Stripe metadata
    let resolvedOrderNumber = orderNumber

    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        resolvedOrderNumber = session.metadata?.order_number || null
      } catch (e) {
        console.error('Failed to retrieve Stripe session:', e)
      }
    }

    if (!resolvedOrderNumber) {
      // Fallback: try to find order by stripe_session_id
      if (sessionId) {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single()

        if (order) {
          return NextResponse.json({ order })
        }
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', resolvedOrderNumber)
      .single()

    if (error || !order) {
      // Order may not have been created yet by the webhook — return what we know from Stripe
      if (sessionId) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId)
          const metadata = session.metadata || {}
          let items = []
          let shippingAddress = {}
          try {
            items = JSON.parse(metadata.items || '[]')
            shippingAddress = JSON.parse(metadata.shipping_address || '{}')
          } catch { /* ignore parse errors */ }

          return NextResponse.json({
            order: {
              order_number: metadata.order_number || 'Processing...',
              customer_name: metadata.customer_name || '',
              customer_email: session.customer_email || '',
              items,
              subtotal: parseFloat(metadata.subtotal || '0'),
              discount: parseFloat(metadata.discount_amount || '0'),
              gift_card_amount: parseFloat(metadata.gift_card_amount || '0'),
              shipping: parseFloat(metadata.shipping || '0'),
              total: (session.amount_total || 0) / 100,
              shipping_address: shippingAddress,
              status: session.payment_status === 'paid' ? 'confirmed' : 'pending',
            },
          })
        } catch {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Checkout session lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
