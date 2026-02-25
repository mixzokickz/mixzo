import { NextResponse } from 'next/server'

const STOCKX_CLIENT_ID = process.env.STOCKX_CLIENT_ID || 'ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const redirectUri = searchParams.get('redirect_uri') || `${new URL(request.url).origin}/stockx/callback`

    const authUrl = new URL('https://accounts.stockx.com/authorize')
    authUrl.searchParams.set('client_id', STOCKX_CLIENT_ID)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'openid offline_access')
    authUrl.searchParams.set('audience', 'gateway.stockx.com')

    return NextResponse.json({ auth_url: authUrl.toString() })
  } catch (error) {
    console.error('StockX auth error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
