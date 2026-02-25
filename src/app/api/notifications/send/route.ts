import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { user_id, title, message, type } = await request.json()
    if (!title || !message) return NextResponse.json({ error: 'title and message required' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('notifications').insert({
      user_id: user_id || null,
      title,
      message,
      type: type || 'info',
      read: false,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ notification: data }, { status: 201 })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
