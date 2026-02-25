import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // Placeholder — integrate with shipping API later
    console.log('Rate request:', body)
    return NextResponse.json({
      rates: [
        { carrier: 'USPS', service: 'Priority Mail', price: 8.99, estimated_days: '2-3' },
        { carrier: 'FedEx', service: 'Ground', price: 9.99, estimated_days: '3-5' },
        { carrier: 'FedEx', service: 'Express', price: 24.99, estimated_days: '1-2' },
      ],
    })
  } catch (error) {
    console.error('Shipping rates error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
