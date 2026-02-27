import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Look up a barcode in the cache
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barcode = searchParams.get('barcode')

  if (!barcode) return NextResponse.json({ found: false })

  const { data, error } = await supabase
    .from('barcode_cache')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (error || !data) return NextResponse.json({ found: false })

  // Increment scan count
  await supabase
    .from('barcode_cache')
    .update({ scan_count: (data.scan_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq('id', data.id)

  return NextResponse.json({
    found: true,
    scanCount: (data.scan_count || 0) + 1,
    product: {
      name: data.product_name,
      brand: data.brand,
      colorway: data.colorway,
      styleId: data.style_id,
      size: data.size,
      retailPrice: data.retail_price,
      imageUrl: data.image_url,
      imageUrls: data.image_urls || [],
      stockxProductId: data.stockx_product_id,
      goatProductId: data.goat_product_id,
    },
  })
}

// POST: Save a barcode→product mapping
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { barcode, productName, brand, colorway, styleId, size, retailPrice, imageUrl, imageUrls, stockxProductId, goatProductId } = body

    if (!barcode || !productName) {
      return NextResponse.json({ error: 'barcode and productName required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('barcode_cache')
      .upsert(
        {
          barcode,
          product_name: productName,
          brand: brand || null,
          colorway: colorway || null,
          style_id: styleId || null,
          size: size || null,
          retail_price: retailPrice || null,
          image_url: imageUrl || null,
          image_urls: imageUrls || [],
          stockx_product_id: stockxProductId || null,
          goat_product_id: goatProductId || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'barcode' }
      )
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Barcode cache save error:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
