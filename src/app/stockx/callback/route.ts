import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const STOCKX_CLIENT_ID = process.env.STOCKX_CLIENT_ID || 'ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw'
const STOCKX_CLIENT_SECRET = process.env.STOCKX_CLIENT_SECRET || '4FIgqrNP2ZEBs_xZzPjUhGM2u5JEHoN_HKcrvNN4yCTl6O3nfg_neu1RLm6G7if6'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const origin = new URL(request.url).origin

    if (!code) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=no_code`)
    }

    const res = await fetch('https://accounts.stockx.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: STOCKX_CLIENT_ID,
        client_secret: STOCKX_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/stockx/callback`,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('StockX token exchange error:', res.status, text)
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=token_exchange`)
    }

    const tokens = await res.json()

    await supabaseAdmin.from('settings').update({
      stockx_access_token: tokens.access_token,
      stockx_refresh_token: tokens.refresh_token,
      stockx_token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      stockx_connected: true,
    }).eq('id', 1)

    return NextResponse.redirect(`${origin}/admin/settings?stockx=connected`)
  } catch (error) {
    console.error('StockX callback error:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/admin/settings?stockx=error`)
  }
}
