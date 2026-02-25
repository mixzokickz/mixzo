import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (condition) query = query.eq('condition', condition)

    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'name': query = query.order('name', { ascending: true }); break
      default: query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)
    const { data, error, count } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products: data, total: count, page, limit })
  } catch (error) {
    console.error('Public products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
