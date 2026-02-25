import { NextResponse } from 'next/server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&limit=20`,
      {
        headers: {
          'x-api-key': STOCKX_API_KEY,
          'Accept': 'application/json',
        },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('StockX API error:', res.status, text)
      return NextResponse.json({ error: 'StockX API error', products: [] }, { status: res.status })
    }

    const data = await res.json()
    const products = (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.title || p.name,
      brand: p.brand,
      colorway: p.colorway,
      retailPrice: p.retailPrice,
      styleId: p.styleId,
      image: p.media?.imageUrl || p.media?.thumbUrl || '',
      thumb: p.media?.thumbUrl || p.media?.imageUrl || '',
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('StockX search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
