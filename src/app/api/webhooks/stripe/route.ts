import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // Placeholder — implement Stripe webhook verification when ready
    console.log('Stripe webhook received:', { signature: !!signature, bodyLength: body.length })

    // TODO: Verify signature with Stripe secret
    // TODO: Handle events: payment_intent.succeeded, checkout.session.completed, etc.

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
