import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email, phone, preferences } = await request.json()
    if (!email && !phone) return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('notification_subscribers').upsert({
      email: email || null,
      phone: phone || null,
      preferences: preferences || { deals: true, drops: true, restock: true },
      subscribed: true,
    }, { onConflict: 'email' }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ subscriber: data }, { status: 201 })
  } catch (error) {
    console.error('Notification subscribe error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
