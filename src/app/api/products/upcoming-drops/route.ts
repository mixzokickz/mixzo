import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Try deals table first, fallback to empty array if table doesn't exist
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'upcoming')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return NextResponse.json({ drops: [] })
    return NextResponse.json({ drops: data || [] })
  } catch (error) {
    return NextResponse.json({ drops: [] })
  }
}
