export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const { ok } = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
  if (!ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const { id } = await params
    const { customer_email, customer_name } = await request.json()

    if (!customer_email || !customer_name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Fetch raffle
    const { data: raffle, error: raffleError } = await supabaseAdmin
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
    }

    if (raffle.status !== 'active') {
      return NextResponse.json({ error: 'This raffle is no longer active' }, { status: 400 })
    }

    if (new Date(raffle.end_date) < new Date()) {
      return NextResponse.json({ error: 'This raffle has ended' }, { status: 400 })
    }

    // Check entries per person
    const { count: existingEntries } = await supabaseAdmin
      .from('raffle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('raffle_id', id)
      .eq('customer_email', customer_email.toLowerCase())
      .eq('status', 'confirmed')

    if (existingEntries && existingEntries >= (raffle.entries_per_person || 1)) {
      return NextResponse.json({ error: 'You have reached the maximum number of entries for this raffle' }, { status: 400 })
    }

    // Check max entries
    if (raffle.max_entries) {
      const { count: totalEntries } = await supabaseAdmin
        .from('raffle_entries')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', id)
        .eq('status', 'confirmed')

      if (totalEntries && totalEntries >= raffle.max_entries) {
        return NextResponse.json({ error: 'This raffle is full' }, { status: 400 })
      }
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const stripe = getStripe()

    const images: string[] = []
    if (raffle.product_image && raffle.product_image.startsWith('http')) {
      images.push(raffle.product_image)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(raffle.entry_price * 100),
          product_data: {
            name: `Raffle Entry: ${raffle.title}`,
            ...(images.length > 0 ? { images } : {}),
          },
        },
        quantity: 1,
      }],
      customer_email: customer_email.toLowerCase(),
      metadata: {
        type: 'raffle_entry',
        raffle_id: id,
        customer_email: customer_email.toLowerCase(),
        customer_name,
      },
      success_url: `${origin}/raffles?entered=true`,
      cancel_url: `${origin}/raffles`,
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (error) {
    console.error('Raffle entry error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create raffle entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
