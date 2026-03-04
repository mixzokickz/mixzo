import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { ok } = rateLimit(ip, { maxRequests: 3, windowMs: 60000 })
  if (!ok) return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })

  try {
    const { name, email, subject, message, category } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 })
    }

    // Create ticket
    const { data: ticket, error: ticketErr } = await supabase
      .from('support_tickets')
      .insert({
        subject: subject || 'Contact Form Submission',
        customer_name: name,
        customer_email: email,
        category: category || 'general',
        status: 'open',
        priority: 'normal',
      })
      .select()
      .single()

    if (ticketErr) throw ticketErr

    // Add first message
    await supabase.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_type: 'customer',
      sender_name: name,
      message,
    })

    return NextResponse.json({ success: true, ticketId: ticket.id })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
