import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find carts older than 1 hour that haven't been converted
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: abandonedCarts } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('status', 'active')
      .lte('updated_at', oneHourAgo)

    if (!abandonedCarts?.length) {
      return NextResponse.json({ processed: 0, message: 'No abandoned carts' })
    }

    // Placeholder — send recovery emails
    console.log(`Found ${abandonedCarts.length} abandoned carts`)

    // Mark as abandoned
    const ids = abandonedCarts.map(c => c.id)
    await supabaseAdmin.from('carts').update({ status: 'abandoned' }).in('id', ids)

    return NextResponse.json({ processed: abandonedCarts.length })
  } catch (error) {
    console.error('Abandoned carts cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
