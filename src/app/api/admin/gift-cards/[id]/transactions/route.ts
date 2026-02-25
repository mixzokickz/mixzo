import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('gift_card_transactions')
      .select('*')
      .eq('gift_card_id', id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ transactions: data })
  } catch (error) {
    console.error('Gift card transactions error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
