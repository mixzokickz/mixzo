import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STOCKX_CLIENT_ID = process.env.STOCKX_CLIENT_ID || 'ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/stockx/callback`
  const state = crypto.randomUUID()

  const cookieStore = await cookies()
  cookieStore.set('stockx_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const authUrl = new URL('https://accounts.stockx.com/authorize')
  authUrl.searchParams.set('client_id', STOCKX_CLIENT_ID)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'openid offline_access')
  authUrl.searchParams.set('audience', 'gateway.stockx.com')
  authUrl.searchParams.set('state', state)

  return NextResponse.redirect(authUrl.toString())
}
