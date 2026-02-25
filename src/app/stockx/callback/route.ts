import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { STOCKX_TOKEN_URL, STOCKX_REDIRECT_URI } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const savedState = request.cookies.get('stockx_state')?.value

    if (!code) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=no_code`)
    }

    if (!state || state !== savedState) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=invalid_state`)
    }

    const clientId = process.env.STOCKX_CLIENT_ID
    const clientSecret = process.env.STOCKX_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=missing_config`)
    }

    const res = await fetch(STOCKX_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: STOCKX_REDIRECT_URI,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('StockX token exchange error:', res.status, text)
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=token_exchange`)
    }

    const tokens = await res.json()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Save tokens to settings table
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    }

    // Upsert into settings table
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: 'stockx_tokens',
        value: tokenData,
      }, { onConflict: 'key' })

    if (error) {
      console.error('Failed to save StockX tokens:', error)
      return NextResponse.redirect(`${origin}/admin/settings?stockx=error&reason=save_failed`)
    }

    const response = NextResponse.redirect(`${origin}/admin/settings?stockx=connected`)
    // Clear state cookie
    response.cookies.delete('stockx_state')
    return response
  } catch (error) {
    console.error('StockX callback error:', error)
    return NextResponse.redirect(`${origin}/admin/settings?stockx=error`)
  }
}
