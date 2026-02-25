import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tracking = searchParams.get('tracking')
    if (!tracking) return NextResponse.json({ error: 'Tracking number required' }, { status: 400 })

    // Placeholder — integrate with carrier tracking APIs
    return NextResponse.json({
      tracking_number: tracking,
      status: 'in_transit',
      estimated_delivery: null,
      events: [],
      message: 'Tracking integration placeholder',
    })
  } catch (error) {
    console.error('Track shipment error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
