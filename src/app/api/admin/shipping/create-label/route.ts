import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // Placeholder — integrate with FedEx/ShipStation/EasyPost later
    console.log('Create label request:', body)
    return NextResponse.json({
      message: 'Shipping label creation placeholder',
      label_url: null,
      tracking_number: null,
    })
  } catch (error) {
    console.error('Create label error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
