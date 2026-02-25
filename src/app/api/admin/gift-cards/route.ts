import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'MXZ-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin.from('gift_cards').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gift_cards: data })
  } catch (error) {
    console.error('Gift cards GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { initial_balance, recipient_email, note } = await request.json()
    if (!initial_balance) return NextResponse.json({ error: 'initial_balance required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('gift_cards').insert({
      code: generateCode(),
      initial_balance,
      balance: initial_balance,
      recipient_email: recipient_email || null,
      note: note || null,
      status: 'active',
      created_by: user.id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gift_card: data }, { status: 201 })
  } catch (error) {
    console.error('Gift cards POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'Gift card ID required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('gift_cards').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gift_card: data })
  } catch (error) {
    console.error('Gift cards PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
