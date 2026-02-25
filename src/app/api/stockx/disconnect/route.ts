import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabaseAdmin.from('settings').update({
      stockx_access_token: null,
      stockx_refresh_token: null,
      stockx_token_expires: null,
      stockx_connected: false,
    }).eq('id', 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('StockX disconnect error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
