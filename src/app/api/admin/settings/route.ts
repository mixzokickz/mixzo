import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin.from('settings').select('*').single()
    if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ settings: data || {} })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { data: existing } = await supabaseAdmin.from('settings').select('id').single()

    let result
    if (existing) {
      result = await supabaseAdmin.from('settings').update(body).eq('id', existing.id).select().single()
    } else {
      result = await supabaseAdmin.from('settings').insert(body).select().single()
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json({ settings: result.data })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
