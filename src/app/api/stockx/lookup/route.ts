import { NextResponse } from 'next/server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || 'Xr6NU7b5lpMUOnCrTxKz1h8hlERePF130gaNhWg9'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')
    if (!barcode) return NextResponse.json({ error: 'Barcode required' }, { status: 400 })

    const res = await fetch(
      `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(barcode)}&limit=5`,
      { headers: { 'x-api-key': STOCKX_API_KEY, 'Accept': 'application/json' } }
    )

    if (!res.ok) {
      console.error('StockX lookup error:', res.status)
      return NextResponse.json({ error: 'StockX lookup failed' }, { status: res.status })
    }

    const data = await res.json()
    const products = (data.products || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.title || p.name,
      brand: p.brand,
      styleId: p.styleId,
      retailPrice: p.retailPrice,
      image: (p.media as Record<string, string>)?.imageUrl || '',
    }))

    return NextResponse.json({ products, barcode })
  } catch (error) {
    console.error('StockX barcode lookup failed:', error)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
