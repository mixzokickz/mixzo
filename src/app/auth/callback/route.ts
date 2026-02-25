import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const origin = new URL(request.url).origin

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    // Exchange code for session — handled client-side typically
    // This route exists for OAuth providers that redirect here
    const { error } = await supabaseAdmin.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    return NextResponse.redirect(`${origin}/`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/login?error=server_error`)
  }
}
