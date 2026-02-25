import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { order_number, email, customer_name } = await request.json()
    if (!order_number || !email) {
      return NextResponse.json({ error: 'order_number and email required' }, { status: 400 })
    }

    // Placeholder — integrate with Resend/SendGrid later
    console.log(`Send confirmation email to ${email} for order ${order_number}`)

    return NextResponse.json({
      success: true,
      message: 'Confirmation email queued',
      to: email,
      order_number,
    })
  } catch (error) {
    console.error('Send confirmation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
