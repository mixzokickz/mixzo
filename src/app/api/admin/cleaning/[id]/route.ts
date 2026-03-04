import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendCleaningConfirmation } from '@/lib/email'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('cleaning_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch cleaning request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await req.json()

    // Get current state
    const { data: current } = await supabaseAdmin
      .from('cleaning_requests')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabaseAdmin
      .from('cleaning_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Auto-send cleaning confirmation when status changes to "completed"
    if (updates.status === 'completed' && current?.status !== 'completed' && data.customer_email) {
      try {
        const items = (data.items || []).map((i: { name: string; size: string; tier: string }) => ({
          name: i.name,
          size: i.size || '',
          tier: i.tier || 'cleaning',
        }))
        const total = items.reduce((sum: number, i: { tier: string }) => sum + (i.tier === 'cleaning' ? 20 : 30), 0)
        await sendCleaningConfirmation({
          order_number: data.order_number || data.id.slice(0, 8).toUpperCase(),
          customer_email: data.customer_email,
          customer_name: data.customer_name || '',
          items,
          total,
        })
        console.log(`Cleaning confirmation email sent to ${data.customer_email}`)
      } catch (emailErr) {
        console.error('Failed to send cleaning email:', emailErr)
      }
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update cleaning request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
