import { NextResponse } from 'next/server'
import { STOCKX_AUTH_URL, STOCKX_AUDIENCE, STOCKX_REDIRECT_URI } from '@/lib/constants'

export async function GET() {
  try {
    const clientId = process.env.STOCKX_CLIENT_ID
    if (!clientId) {
      return NextResponse.json({ error: 'StockX client ID not configured' }, { status: 500 })
    }

    // Generate random state
    const state = crypto.randomUUID()

    const authUrl = new URL(STOCKX_AUTH_URL)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', STOCKX_REDIRECT_URI)
    authUrl.searchParams.set('scope', 'offline_access openid')
    authUrl.searchParams.set('audience', STOCKX_AUDIENCE)
    authUrl.searchParams.set('state', state)

    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set('stockx_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('StockX auth error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
