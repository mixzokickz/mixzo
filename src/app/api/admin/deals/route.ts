import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

// GET: Fetch all deals with joined product data
export async function GET(request: Request) {
  const user = await requireAdmin(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('daily_deals')
    .select('*, product:products(id, name, brand, size, price, images, image_url, compare_at_price)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Create a new deal
export async function POST(request: Request) {
  const user = await requireAdmin(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { product_id, sale_price } = body

  if (!product_id || !sale_price) {
    return NextResponse.json({ error: 'product_id and sale_price are required' }, { status: 400 })
  }

  // Get the product's current price
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, price, name')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (sale_price >= product.price) {
    return NextResponse.json({ error: 'Sale price must be less than original price' }, { status: 400 })
  }

  // Check for existing active deal on this product
  const { data: existing } = await supabaseAdmin
    .from('daily_deals')
    .select('id')
    .eq('product_id', product_id)
    .eq('active', true)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'An active deal already exists for this product' }, { status: 409 })
  }

  // Insert the deal
  const { data: deal, error: dealError } = await supabaseAdmin
    .from('daily_deals')
    .insert({
      product_id,
      original_price: product.price,
      sale_price: parseFloat(sale_price),
      active: true,
    })
    .select('*, product:products(id, name, brand, size, price, images, image_url)')
    .single()

  if (dealError) {
    return NextResponse.json({ error: dealError.message }, { status: 500 })
  }

  // Update product's compare_at_price so storefront shows crossed-out price
  await supabaseAdmin
    .from('products')
    .update({ compare_at_price: product.price, price: parseFloat(sale_price) })
    .eq('id', product_id)

  return NextResponse.json(deal, { status: 201 })
}

// DELETE: Remove a deal and reset product pricing
export async function DELETE(request: Request) {
  const user = await requireAdmin(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dealId = searchParams.get('id')

  if (!dealId) {
    return NextResponse.json({ error: 'Deal id is required' }, { status: 400 })
  }

  // Get the deal first to know the product
  const { data: deal, error: fetchError } = await supabaseAdmin
    .from('daily_deals')
    .select('id, product_id, original_price')
    .eq('id', dealId)
    .single()

  if (fetchError || !deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  // Delete the deal
  const { error: deleteError } = await supabaseAdmin
    .from('daily_deals')
    .delete()
    .eq('id', dealId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Reset product pricing
  if (deal.original_price) {
    await supabaseAdmin
      .from('products')
      .update({ price: deal.original_price, compare_at_price: null })
      .eq('id', deal.product_id)
  }

  return NextResponse.json({ success: true })
}

// PATCH: Toggle active status
export async function PATCH(request: Request) {
  const user = await requireAdmin(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, active } = body

  if (!id || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'id and active (boolean) are required' }, { status: 400 })
  }

  // Get the deal
  const { data: deal } = await supabaseAdmin
    .from('daily_deals')
    .select('id, product_id, original_price, sale_price')
    .eq('id', id)
    .single()

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  // Update deal status
  const { data: updated, error } = await supabaseAdmin
    .from('daily_deals')
    .update({ active })
    .eq('id', id)
    .select('*, product:products(id, name, brand, size, price, images, image_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update product pricing based on active status
  if (active) {
    // Re-activate: set sale price and compare_at_price
    await supabaseAdmin
      .from('products')
      .update({ price: deal.sale_price, compare_at_price: deal.original_price })
      .eq('id', deal.product_id)
  } else {
    // Deactivate: restore original price
    await supabaseAdmin
      .from('products')
      .update({ price: deal.original_price, compare_at_price: null })
      .eq('id', deal.product_id)
  }

  return NextResponse.json(updated)
}
