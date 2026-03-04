import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendAbandonedCartEmail } from '@/lib/email'

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

    console.log(`Found ${abandonedCarts.length} abandoned carts`)

    let emailsSent = 0
    const errors: string[] = []

    for (const cart of abandonedCarts) {
      // Only send if we have an email and items
      if (cart.customer_email && cart.items?.length) {
        try {
          const cartTotal = cart.items.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + (item.price * (item.quantity || 1)),
            0
          )

          await sendAbandonedCartEmail({
            customer_email: cart.customer_email,
            customer_name: cart.customer_name || undefined,
            items: cart.items.map((item: { name: string; size: string; price: number; image_url?: string | null }) => ({
              name: item.name,
              size: item.size || '',
              price: item.price,
              image_url: item.image_url || null,
            })),
            cart_total: cartTotal,
          })
          emailsSent++
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          errors.push(`Cart ${cart.id}: ${msg}`)
          console.error(`Failed to send abandoned cart email for cart ${cart.id}:`, err)
        }
      }
    }

    // Mark as abandoned
    const ids = abandonedCarts.map((c: { id: string }) => c.id)
    await supabaseAdmin.from('carts').update({ status: 'abandoned' }).in('id', ids)

    return NextResponse.json({
      processed: abandonedCarts.length,
      emails_sent: emailsSent,
      ...(errors.length > 0 ? { errors } : {}),
    })
  } catch (error) {
    console.error('Abandoned carts cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
