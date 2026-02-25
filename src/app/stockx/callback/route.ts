import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { saveStockXTokens } from '@/lib/stockx'

const STOCKX_CLIENT_ID = process.env.STOCKX_CLIENT_ID || 'ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw'
const STOCKX_CLIENT_SECRET = process.env.STOCKX_CLIENT_SECRET || '4FIgqrNP2ZEBs_xZzPjUhGM2u5JEHoN_HKcrvNN4yCTl6O3nfg_neu1RLm6G7if6'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=no_code`)
    }

    // Verify state
    const cookieStore = await cookies()
    const savedState = cookieStore.get('stockx_oauth_state')?.value
    if (state && savedState && state !== savedState) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=invalid_state`)
    }
    cookieStore.delete('stockx_oauth_state')

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

    await saveStockXTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
    })

    return NextResponse.redirect(`${origin}/admin/settings?stockx=connected`)
  } catch (error) {
    console.error('StockX callback error:', error)
    return NextResponse.redirect(`${origin}/admin/settings?stockx=error`)
  }
}
