import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: lookup barcode in local cache
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barcode = searchParams.get('barcode')
  if (!barcode) return NextResponse.json({ found: false })

  const supabase = getServiceClient()
  const { data } = await supabase
    .from('barcode_catalog')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (data) {
    // Increment scan count
    await supabase
      .from('barcode_catalog')
      .update({
        scan_count: (data.scan_count || 0) + 1,
        last_scanned_at: new Date().toISOString(),
      })
      .eq('barcode', barcode)

    return NextResponse.json({
      found: true,
      product: {
        name: data.product_name,
        brand: data.brand,
        styleId: data.style_id,
        colorway: data.colorway,
        size: data.size,
        retailPrice: data.retail_price,
        imageUrl: data.image_url,
        imageUrls: data.image_urls || [],
        stockxProductId: data.stockx_product_id,
      },
      scanCount: (data.scan_count || 0) + 1,
    })
  }

  return NextResponse.json({ found: false })
}

// POST: save barcode to local cache
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = getServiceClient()

    const { error } = await supabase
      .from('barcode_catalog')
      .upsert({
        barcode: body.barcode,
        barcode_type: /^\d{10,14}$/.test(body.barcode) ? 'UPC' : 'STYLE_ID',
        stockx_product_id: body.stockxProductId || null,
        product_name: body.productName,
        brand: body.brand || null,
        colorway: body.colorway || null,
        style_id: body.styleId || null,
        size: body.size || null,
        retail_price: body.retailPrice || null,
        image_url: body.imageUrl || null,
        image_urls: body.imageUrls || [],
        last_scanned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'barcode' })

    if (error) {
      console.error('Barcode cache save error:', error)
      return NextResponse.json({ saved: false, error: error.message })
    }

    return NextResponse.json({ saved: true })
  } catch (err) {
    return NextResponse.json({ saved: false, error: 'Server error' }, { status: 500 })
  }
}
