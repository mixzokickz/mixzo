export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendRaffleWinnerNotification, sendRaffleNotSelectedNotification } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const winnerId = body.winner_id // optional: pre-selected winner from spin wheel

    // Fetch raffle
    const { data: raffle, error: raffleError } = await supabaseAdmin
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
    }

    if (raffle.status === 'completed') {
      return NextResponse.json({ error: 'Winner already drawn' }, { status: 400 })
    }

    let winner

    if (winnerId) {
      // Use the pre-selected winner from the spin wheel
      const { data, error } = await supabaseAdmin
        .from('raffle_entries')
        .select('*')
        .eq('id', winnerId)
        .eq('raffle_id', id)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Invalid winner entry' }, { status: 400 })
      }
      winner = data
    } else {
      // Random draw
      const { data: entries, error: entriesError } = await supabaseAdmin
        .from('raffle_entries')
        .select('*')
        .eq('raffle_id', id)
        .eq('status', 'confirmed')

      if (entriesError) throw entriesError

      if (!entries || entries.length === 0) {
        return NextResponse.json({ error: 'No entries to draw from' }, { status: 400 })
      }

      // Random selection
      const randomIndex = Math.floor(Math.random() * entries.length)
      winner = entries[randomIndex]
    }

    // Mark winner entry
    await supabaseAdmin
      .from('raffle_entries')
      .update({ status: 'winner' })
      .eq('id', winner.id)

    // Update raffle
    await supabaseAdmin
      .from('raffles')
      .update({
        status: 'completed',
        winner_id: winner.id,
        winner_announced_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Create order for winner
    const orderNumber = `MXZ-RAF-${Date.now().toString(36).toUpperCase()}`
    await supabaseAdmin.from('orders').insert({
      order_number: orderNumber,
      customer_email: winner.customer_email,
      customer_name: winner.customer_name,
      items: [{
        name: raffle.product_name || raffle.title,
        size: raffle.product_size || '',
        quantity: 1,
        price: raffle.entry_price,
        image_url: raffle.product_image,
      }],
      subtotal: raffle.entry_price,
      total: raffle.entry_price,
      discount: 0,
      gift_card_amount: 0,
      shipping: 0,
      status: 'confirmed',
      payment_method: 'raffle_win',
      shipping_address: {},
    })

    // Mark product as sold if applicable
    if (raffle.product_id) {
      await supabaseAdmin
        .from('products')
        .update({ status: 'sold' })
        .eq('id', raffle.product_id)
    }

    // Send winner email
    try {
      await sendRaffleWinnerNotification({
        customer_email: winner.customer_email,
        customer_name: winner.customer_name,
        raffle_title: raffle.title,
        product_name: raffle.product_name,
        product_image: raffle.product_image,
        product_size: raffle.product_size,
      })
    } catch (emailError) {
      console.error('Failed to send winner email:', emailError)
    }

    // Send not-selected emails to other entrants (async, don't block)
    const { data: otherEntries } = await supabaseAdmin
      .from('raffle_entries')
      .select('customer_email, customer_name')
      .eq('raffle_id', id)
      .eq('status', 'confirmed')
      .neq('id', winner.id)

    if (otherEntries) {
      for (const entry of otherEntries) {
        sendRaffleNotSelectedNotification({
          customer_email: entry.customer_email,
          customer_name: entry.customer_name,
          raffle_title: raffle.title,
        }).catch((err) => console.error('Failed to send not-selected email:', err))
      }
    }

    return NextResponse.json({
      winner: {
        id: winner.id,
        customer_name: winner.customer_name,
        customer_email: winner.customer_email,
        entry_number: winner.entry_number,
      },
      order_number: orderNumber,
    })
  } catch (error) {
    console.error('Draw winner error:', error)
    return NextResponse.json({ error: 'Failed to draw winner' }, { status: 500 })
  }
}
