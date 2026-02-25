import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('drop_subscribers').upsert({
      email,
      phone: phone || null,
      subscribed: true,
    }, { onConflict: 'email' }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, subscriber: data }, { status: 201 })
  } catch (error) {
    console.error('Drop subscribe error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
