export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  console.log(`Stripe webhook received: ${event.type} [${event.id}]`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    // Return 200 so Stripe doesn't retry — we log the error
    return NextResponse.json({ received: true, error: 'Handler error' })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const orderNumber = metadata.order_number

  if (!orderNumber) {
    console.error('No order_number in session metadata')
    return
  }

  // Check if order already exists (idempotency)
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single()

  if (existingOrder) {
    console.log(`Order ${orderNumber} already exists, skipping creation`)
    // Update payment info if needed
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        payment_intent_id: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null,
        payment_method: 'stripe',
      })
      .eq('order_number', orderNumber)
    return
  }

  // Parse metadata
  let shippingAddress = {}
  let orderItems: Array<{ product_id: string; name: string; size: string; quantity: number; price: number }> = []

  try {
    shippingAddress = JSON.parse(metadata.shipping_address || '{}')
    orderItems = JSON.parse(metadata.items || '[]')
  } catch (e) {
    console.error('Failed to parse metadata:', e)
  }

  const subtotal = parseFloat(metadata.subtotal || '0')
  const discount = parseFloat(metadata.discount_amount || '0')
  const giftCardAmount = parseFloat(metadata.gift_card_amount || '0')
  const shipping = parseFloat(metadata.shipping || '0')
  const total = (session.amount_total || 0) / 100

  // Create order in Supabase
  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    order_number: orderNumber,
    customer_email: session.customer_email || '',
    customer_name: metadata.customer_name || '',
    customer_phone: metadata.customer_phone || '',
    shipping_address: shippingAddress,
    items: orderItems,
    subtotal,
    discount,
    gift_card_amount: giftCardAmount,
    shipping,
    total,
    status: 'confirmed',
    payment_method: 'stripe',
    payment_intent_id: typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null,
    discount_code: metadata.discount_code || null,
    stripe_session_id: session.id,
  }).select().single()

  if (error) {
    console.error('Failed to create order:', error)
    return
  }

  console.log(`Order ${orderNumber} created successfully`)

  // Decrement inventory
  for (const item of orderItems) {
    const { data: current } = await supabaseAdmin
      .from('products')
      .select('quantity')
      .eq('id', item.product_id)
      .single()

    if (current) {
      await supabaseAdmin
        .from('products')
        .update({ quantity: Math.max(0, current.quantity - item.quantity) })
        .eq('id', item.product_id)
    }
  }

  // Deduct gift card balance if used
  if (metadata.gift_card_code && giftCardAmount > 0) {
    const { data: gc } = await supabaseAdmin
      .from('gift_cards')
      .select('balance')
      .eq('code', metadata.gift_card_code.toUpperCase())
      .single()

    if (gc) {
      await supabaseAdmin
        .from('gift_cards')
        .update({ balance: Math.max(0, gc.balance - giftCardAmount) })
        .eq('code', metadata.gift_card_code.toUpperCase())
    }
  }

  // Increment discount usage
  if (metadata.discount_code) {
    const { data: disc } = await supabaseAdmin
      .from('discounts')
      .select('id, times_used')
      .eq('code', metadata.discount_code.toUpperCase())
      .single()

    if (disc) {
      await supabaseAdmin
        .from('discounts')
        .update({ times_used: (disc.times_used || 0) + 1 })
        .eq('id', disc.id)
    }
  }

  // Send confirmation email
  if (order && session.customer_email) {
    try {
      await sendOrderConfirmation({
        order_number: orderNumber,
        customer_email: session.customer_email,
        customer_name: metadata.customer_name || '',
        items: orderItems,
        subtotal,
        discount,
        gift_card_amount: giftCardAmount,
        shipping,
        total,
        shipping_address: shippingAddress as {
          line1: string
          city: string
          state: string
          postal_code: string
          country: string
        },
      })
      console.log(`Confirmation email sent to ${session.customer_email}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the webhook for email errors
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderNumber = paymentIntent.metadata?.order_number
  if (!orderNumber) return

  // Backup: ensure order is confirmed
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('order_number', orderNumber)
    .single()

  if (order && order.status === 'pending') {
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        payment_intent_id: paymentIntent.id,
        payment_method: 'stripe',
      })
      .eq('order_number', orderNumber)

    console.log(`Order ${orderNumber} confirmed via payment_intent.succeeded`)
  }
}
