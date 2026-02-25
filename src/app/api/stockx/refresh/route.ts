import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const STOCKX_CLIENT_ID = process.env.STOCKX_CLIENT_ID || 'ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw'
const STOCKX_CLIENT_SECRET = process.env.STOCKX_CLIENT_SECRET || '4FIgqrNP2ZEBs_xZzPjUhGM2u5JEHoN_HKcrvNN4yCTl6O3nfg_neu1RLm6G7if6'

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json()
    if (!refresh_token) return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })

    const res = await fetch('https://accounts.stockx.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: STOCKX_CLIENT_ID,
        client_secret: STOCKX_CLIENT_SECRET,
        refresh_token,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('StockX refresh error:', res.status, text)
      return NextResponse.json({ error: 'Token refresh failed' }, { status: res.status })
    }

    const tokens = await res.json()

    // Store updated tokens
    await supabaseAdmin.from('settings').update({
      stockx_access_token: tokens.access_token,
      stockx_refresh_token: tokens.refresh_token || refresh_token,
      stockx_token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }).eq('id', 1)

    return NextResponse.json({ success: true, expires_in: tokens.expires_in })
  } catch (error) {
    console.error('StockX refresh error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
