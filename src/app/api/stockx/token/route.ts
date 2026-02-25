import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabaseAdmin.from('settings').select('stockx_access_token, stockx_token_expires, stockx_connected').single()
    return NextResponse.json({
      connected: !!data?.stockx_connected,
      expires: data?.stockx_token_expires || null,
      has_token: !!data?.stockx_access_token,
    })
  } catch (error) {
    console.error('StockX token check error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
