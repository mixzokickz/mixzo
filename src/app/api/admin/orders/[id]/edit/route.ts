import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'
import { sendShippingNotification } from '@/lib/email'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const updates = await request.json()

    // Get current order state before update
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-send shipping email when tracking number is added or status changes to "shipped"
    const trackingJustAdded = updates.tracking_number && !currentOrder?.tracking_number
    const justShipped = updates.status === 'shipped' && currentOrder?.status !== 'shipped'

    if ((trackingJustAdded || justShipped) && data.customer_email && data.tracking_number) {
      try {
        await sendShippingNotification({
          order_number: data.order_number || data.id.slice(0, 8).toUpperCase(),
          customer_email: data.customer_email,
          customer_name: data.customer_name || '',
          tracking_number: data.tracking_number,
          tracking_url: data.tracking_url || `https://www.fedex.com/fedextrack/?trknbr=${data.tracking_number}`,
          items: (data.items || []).map((i: { name: string; size: string; quantity: number }) => ({
            name: i.name,
            size: i.size || '',
            quantity: i.quantity || 1,
          })),
        })
        console.log(`Shipping email sent to ${data.customer_email} for order ${data.order_number}`)
      } catch (emailErr) {
        console.error('Failed to send shipping email:', emailErr)
        // Don't fail the update for email errors
      }
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Edit order error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
