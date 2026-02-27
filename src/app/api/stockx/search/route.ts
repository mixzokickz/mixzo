import { NextResponse } from 'next/server'

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

async function searchGOAT(query: string, limit: number) {
  const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': GOAT_ALGOLIA_APP,
      'x-algolia-api-key': GOAT_ALGOLIA_KEY,
    },
    body: JSON.stringify({
      query,
      hitsPerPage: Math.min(limit * 5, 100),
      distinct: true,
      attributesToRetrieve: [
        'product_template_id', 'name', 'product_title', 'brand_name',
        'color', 'retail_price_cents', 'sku', 'main_picture_url',
        'picture_url', 'slug',
      ],
    }),
  })
  if (!res.ok) return []
  const data = await res.json()
  const seen = new Set<string>()
  return (data.hits || [])
    .filter((h: any) => {
      const k = h.product_template_id || h.sku || h.name
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, limit)
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

async function resolveBarcode(upc: string): Promise<string | null> {
  // Try UPC Item DB
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      const item = data.items?.[0]
      if (item?.title) return item.title.replace(/\s*size\s*\d+\.?\d*/gi, '').trim()
    }
  } catch {}

  // Try Barcode Spider (free, no key)
  try {
    const res = await fetch(`https://api.barcodespider.com/v1/lookup?upc=${encodeURIComponent(upc)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.item_attributes?.title) return data.item_attributes.title
    }
  } catch {}

  return null
}

function looksLikeBarcode(q: string): boolean {
  return /^\d{8,14}$/.test(q.trim())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) return NextResponse.json({ error: 'Query required', products: [] }, { status: 400 })

    // If barcode, try to resolve to product name
    if (looksLikeBarcode(query)) {
      const resolved = await resolveBarcode(query)
      if (resolved) {
        query = resolved
      } else {
        // Can't resolve barcode — return empty with hint
        return NextResponse.json({
          products: [],
          hint: 'Barcode not found in database. Try searching by product name instead.',
        })
      }
    }

    // Search via GOAT (free, no auth needed, reliable)
    const products = await searchGOAT(query, limit)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
