export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET single raffle with entry count
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: raffle, error } = await supabaseAdmin
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
    }

    const { count } = await supabaseAdmin
      .from('raffle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('raffle_id', id)
      .eq('status', 'confirmed')

    return NextResponse.json({ ...raffle, entry_count: count || 0 })
  } catch (error) {
    console.error('Failed to fetch raffle:', error)
    return NextResponse.json({ error: 'Failed to fetch raffle' }, { status: 500 })
  }
}

// PATCH update raffle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('raffles')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update raffle:', error)
    return NextResponse.json({ error: 'Failed to update raffle' }, { status: 500 })
  }
}

// DELETE raffle
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('raffles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete raffle:', error)
    return NextResponse.json({ error: 'Failed to delete raffle' }, { status: 500 })
  }
}
