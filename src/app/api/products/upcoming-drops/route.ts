import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*, products(*)')
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(20)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ drops: data })
  } catch (error) {
    console.error('Upcoming drops error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
