export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET active raffles (public)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('raffles')
      .select('*, raffle_entries(count)')
      .in('status', ['active', 'completed', 'drawing'])
      .order('created_at', { ascending: false })

    if (error) throw error

    const raffles = (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      entry_count: Array.isArray(r.raffle_entries) && r.raffle_entries.length > 0
        ? (r.raffle_entries[0] as { count: number }).count
        : 0,
      raffle_entries: undefined,
    }))

    return NextResponse.json(raffles)
  } catch (error) {
    console.error('Failed to fetch raffles:', error)
    return NextResponse.json({ error: 'Failed to fetch raffles' }, { status: 500 })
  }
}

// POST create raffle (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      title, description, entry_price, max_entries, entries_per_person,
      start_date, end_date, status, product_id, product_name,
      product_image, product_size, product_retail_price, featured,
    } = body

    if (!title || !entry_price || !end_date) {
      return NextResponse.json({ error: 'Title, entry price, and end date are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from('raffles').insert({
      title,
      description: description || null,
      entry_price: parseFloat(entry_price),
      max_entries: max_entries ? parseInt(max_entries) : null,
      entries_per_person: entries_per_person ? parseInt(entries_per_person) : 1,
      start_date: start_date || new Date().toISOString(),
      end_date,
      status: status || 'active',
      product_id: product_id || null,
      product_name: product_name || null,
      product_image: product_image || null,
      product_size: product_size || null,
      product_retail_price: product_retail_price ? parseFloat(product_retail_price) : null,
      featured: featured || false,
    }).select().single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Failed to create raffle:', error)
    const message = error instanceof Error ? error.message : 'Failed to create raffle'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
