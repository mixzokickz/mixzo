import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth role - invalid token:', authError?.message)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, email, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Auth role - profile error:', profileError.message)
      // Create profile if it doesn't exist
      if (profileError.code === 'PGRST116') {
        await supabaseAdmin.from('profiles').insert({
          id: user.id,
          email: user.email,
          role: 'customer',
        })
        return NextResponse.json({ role: 'customer', email: user.email })
      }
      return NextResponse.json({ error: 'Profile error' }, { status: 500 })
    }

    return NextResponse.json({
      role: profile.role || 'customer',
      name: profile.full_name,
      email: profile.email,
      avatar: profile.avatar_url,
    })
  } catch (error) {
    console.error('Auth role error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
