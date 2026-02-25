import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find deals starting today
    const today = new Date().toISOString().split('T')[0]
    const { data: todaysDrops } = await supabaseAdmin
      .from('deals')
      .select('*, products(name, image)')
      .gte('starts_at', `${today}T00:00:00`)
      .lte('starts_at', `${today}T23:59:59`)

    if (!todaysDrops?.length) {
      return NextResponse.json({ notified: 0, message: 'No drops today' })
    }

    // Get subscribers
    const { data: subscribers } = await supabaseAdmin
      .from('drop_subscribers')
      .select('email, phone')
      .eq('subscribed', true)

    // Placeholder — send emails/SMS to subscribers
    console.log(`Notifying ${subscribers?.length || 0} subscribers about ${todaysDrops.length} drops`)

    return NextResponse.json({
      drops: todaysDrops.length,
      subscribers: subscribers?.length || 0,
      notified: true,
    })
  } catch (error) {
    console.error('Drops notify cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
