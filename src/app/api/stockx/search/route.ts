import { NextResponse } from 'next/server'

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) return NextResponse.json({ error: 'Query required', products: [] }, { status: 400 })

    const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-application-id': GOAT_ALGOLIA_APP,
        'x-algolia-api-key': GOAT_ALGOLIA_KEY,
      },
      body: JSON.stringify({ query, hitsPerPage: limit }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Search error: ${res.status}`, products: [] }, { status: res.status })
    }

    const data = await res.json()

    // Deduplicate by SKU
    const seen = new Set<string>()
    const products = (data.hits || [])
      .filter((h: any) => {
        const key = h.sku || h.name
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
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

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
