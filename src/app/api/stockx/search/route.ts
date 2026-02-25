import { NextResponse } from 'next/server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || 'Xr6NU7b5lpMUOnCrTxKz1h8hlERePF130gaNhWg9'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') || '20'

    if (!query) return NextResponse.json({ error: 'Query required', products: [] }, { status: 400 })

    const res = await fetch(
      `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: { 'x-api-key': STOCKX_API_KEY, 'Accept': 'application/json' } }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('StockX API error:', res.status, text)
      return NextResponse.json({ error: `StockX API error: ${res.status}`, products: [] }, { status: res.status })
    }

    const data = await res.json()
    const products = (data.products || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.title || p.name,
      brand: p.brand,
      colorway: p.colorway,
      retailPrice: p.retailPrice,
      styleId: p.styleId,
      image: (p.media as Record<string, string>)?.imageUrl || (p.media as Record<string, string>)?.thumbUrl || '',
      thumb: (p.media as Record<string, string>)?.thumbUrl || (p.media as Record<string, string>)?.imageUrl || '',
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('StockX search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
