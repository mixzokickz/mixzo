import { NextResponse } from 'next/server'
import { getStockXToken } from '@/lib/stockx'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || ''

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

async function searchStockX(query: string, limit: number) {
  const token = await getStockXToken()
  if (!token || !STOCKX_API_KEY) return null

  const res = await fetch(
    `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&pageSize=${limit}`,
    {
      headers: {
        'x-api-key': STOCKX_API_KEY,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return (data.products || []).map((p: any) => ({
    id: p.id,
    name: p.title || p.name,
    brand: p.brand,
    colorway: p.colorway,
    retailPrice: p.retailPrice,
    styleId: p.styleId,
    image: p.media?.imageUrl || p.media?.thumbUrl || '',
    thumb: p.media?.thumbUrl || p.media?.imageUrl || '',
  }))
}

async function searchGOAT(query: string, limit: number) {
  const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': GOAT_ALGOLIA_APP,
      'x-algolia-api-key': GOAT_ALGOLIA_KEY,
    },
    body: JSON.stringify({ query, hitsPerPage: limit }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const seen = new Set<string>()
  return (data.hits || [])
    .filter((h: any) => { const k = h.sku || h.name; if (seen.has(k)) return false; seen.add(k); return true })
    .map((h: any) => ({
      id: h.product_template_id || h.id || '',
      name: h.name || h.product_title || '',
      brand: h.brand_name || '',
      colorway: h.color || '',
      retailPrice: h.retail_price_cents ? h.retail_price_cents / 100 : null,
      styleId: h.sku || '',
      image: h.main_picture_url || h.picture_url || '',
      thumb: h.main_picture_url || h.picture_url || '',
    }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) return NextResponse.json({ error: 'Query required', products: [] }, { status: 400 })

    // Try StockX first (if authenticated), fallback to GOAT
    let products = await searchStockX(query, limit)
    if (!products || products.length === 0) {
      products = await searchGOAT(query, limit)
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
