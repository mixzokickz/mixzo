import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('gift_cards')
      .select('id, balance, status')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !data) return NextResponse.json({ valid: false, error: 'Gift card not found' }, { status: 404 })
    if (data.status !== 'active') return NextResponse.json({ valid: false, error: 'Gift card is not active' })
    if (data.balance <= 0) return NextResponse.json({ valid: false, error: 'Gift card has no balance' })

    return NextResponse.json({ valid: true, balance: data.balance })
  } catch (error) {
    console.error('Gift card validate error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
