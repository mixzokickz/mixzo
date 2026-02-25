import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'MXZ-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const { amount, sender_email, sender_name, recipient_email, recipient_name, message } = await request.json()

    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json({ error: 'Amount must be between $5 and $500' }, { status: 400 })
    }
    if (!sender_email) return NextResponse.json({ error: 'Sender email required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('gift_cards').insert({
      code: generateCode(),
      initial_balance: amount,
      balance: amount,
      sender_email,
      sender_name: sender_name || '',
      recipient_email: recipient_email || null,
      recipient_name: recipient_name || null,
      message: message || null,
      status: 'active',
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gift_card: data }, { status: 201 })
  } catch (error) {
    console.error('Gift card purchase error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
