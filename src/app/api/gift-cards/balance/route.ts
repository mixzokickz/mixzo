import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('gift_cards')
      .select('balance, status')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !data) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })

    return NextResponse.json({ balance: data.balance, status: data.status })
  } catch (error) {
    console.error('Gift card balance error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
