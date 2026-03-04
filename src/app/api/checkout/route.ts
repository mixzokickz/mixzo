export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export async function POST(request: Request) {
  const stripe = getStripe()
  try {
    const { items, customer, shipping_address, discount_code, gift_card_code, cleaning_services } = await request.json()

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!customer?.email) return NextResponse.json({ error: 'Customer email required' }, { status: 400 })
    if (!shipping_address) return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })

    // Validate products and build line items
    let subtotal = 0
    const orderItems: Array<{ product_id: string; name: string; size: string; quantity: number; price: number; image_url: string | null }> = []
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

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
        image_url: product.image_url || (product.image_urls?.[0] ?? null),
      })

      const images: string[] = []
      const imgUrl = product.image_url || product.image_urls?.[0]
      if (imgUrl && imgUrl.startsWith('http')) {
        images.push(imgUrl)
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `Size ${item.size || 'N/A'}`,
            ...(images.length > 0 ? { images } : {}),
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })
    }

    // Add cleaning services as line items
    if (cleaning_services?.length) {
      for (const service of cleaning_services) {
        const price = service.tier === 'cleaning' ? 20 : 30
        const label = service.tier === 'cleaning' ? 'Sneaker Cleaning' : 'Cleaning + Icing'
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${label} — ${service.product_name}`,
              description: `Cleaning service for Size ${service.size || 'N/A'}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: service.quantity || 1,
        })
      }
    }

    // Handle discount codes
    let discountAmount = 0
    let stripeDiscounts: Stripe.Checkout.SessionCreateParams.Discount[] = []

    if (discount_code) {
      const { data: disc } = await supabaseAdmin
        .from('discounts')
        .select('*')
        .eq('code', discount_code.toUpperCase())
        .eq('active', true)
        .single()

      if (disc) {
        discountAmount = disc.type === 'percentage' ? subtotal * (disc.value / 100) : disc.value

        // Create a Stripe coupon for this discount
        try {
          const couponParams: Stripe.CouponCreateParams = {
            ...(disc.type === 'percentage'
              ? { percent_off: disc.value }
              : { amount_off: Math.round(disc.value * 100), currency: 'usd' }),
            duration: 'once',
            name: `${discount_code.toUpperCase()} discount`,
          }
          const coupon = await stripe.coupons.create(couponParams)
          stripeDiscounts = [{ coupon: coupon.id }]
        } catch (e) {
          console.error('Failed to create Stripe coupon:', e)
          // Continue without Stripe discount — will be tracked in metadata
        }
      }
    }

    // Handle gift cards — apply as line item discount
    let giftCardAmount = 0
    if (gift_card_code) {
      const { data: gc } = await supabaseAdmin
        .from('gift_cards')
        .select('*')
        .eq('code', gift_card_code.toUpperCase())
        .eq('status', 'active')
        .single()

      if (gc && gc.balance > 0) {
        giftCardAmount = Math.min(gc.balance, subtotal - discountAmount)
        // Gift card balance will be deducted in the webhook after payment succeeds
      }
    }

    // Shipping calculation
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 14.99

    // Add shipping as a line item if not free
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `Standard shipping (free on orders $${FREE_SHIPPING_THRESHOLD}+)`,
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // If gift card covers part of the order, add a negative line item (credit)
    if (giftCardAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Gift Card Applied',
            description: `Gift card ${gift_card_code?.toUpperCase()}`,
          },
          unit_amount: -Math.round(giftCardAmount * 100),
        },
        quantity: 1,
      })
    }

    const orderNumber = `MXZ-${Date.now().toString(36).toUpperCase()}`

    // Build the origin URL for redirects
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
      customer_email: customer.email,
      metadata: {
        order_number: orderNumber,
        customer_name: customer.name || '',
        customer_phone: customer.phone || '',
        shipping_address: JSON.stringify(shipping_address),
        items: JSON.stringify(orderItems),
        discount_code: discount_code || '',
        discount_amount: discountAmount.toString(),
        gift_card_code: gift_card_code || '',
        gift_card_amount: giftCardAmount.toString(),
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        cleaning_services: cleaning_services ? JSON.stringify(cleaning_services) : '',
      },
      success_url: `${origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      payment_intent_data: {
        metadata: {
          order_number: orderNumber,
        },
      },
    })

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      order_number: orderNumber,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
