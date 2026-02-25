import { NextResponse } from 'next/server'

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

async function searchGOAT(query: string, limit = 10) {
  const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': GOAT_ALGOLIA_APP,
      'x-algolia-api-key': GOAT_ALGOLIA_KEY,
    },
    body: JSON.stringify({ query, hitsPerPage: limit }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.hits || []).map((h: any) => ({
    name: h.name || h.product_title || '',
    brand: h.brand_name || '',
    styleId: h.sku || '',
    colorway: h.color || h.details || '',
    retailPrice: h.retail_price_cents ? h.retail_price_cents / 100 : null,
    image: h.main_picture_url || h.picture_url || '',
    size: h.size_us_men || h.size || '',
    slug: h.slug || '',
    goatId: h.product_template_id || h.id || '',
  }))
}

async function lookupUPC(upc: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`)
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    return item?.title || item?.brand || null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upc = searchParams.get('upc')
    if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

    // 1. Direct search on GOAT (works for style IDs and shoe names)
    let results = await searchGOAT(upc, 5)

    // 2. If no results and looks like a UPC barcode, lookup the name first
    if (results.length === 0 && /^\d{10,14}$/.test(upc)) {
      const name = await lookupUPC(upc)
      if (name) {
        results = await searchGOAT(name, 5)
      }
    }

    if (results.length > 0) {
      // Deduplicate by styleId, keep first (best match)
      const seen = new Set<string>()
      const unique = results.filter((r: any) => {
        const key = r.styleId || r.name
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      const best = unique[0]
      // Get all sizes for this product
      const allSizes = results
        .filter((r: any) => r.styleId === best.styleId && r.size)
        .map((r: any) => r.size)
        .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)
        .sort((a: string, b: string) => parseFloat(a) - parseFloat(b))

      return NextResponse.json({
        upc,
        found: true,
        source: 'goat',
        product: {
          name: best.name,
          brand: best.brand,
          styleId: best.styleId,
          colorway: best.colorway,
          retailPrice: best.retailPrice,
          image: best.image,
          images: [best.image].filter(Boolean),
          variants: allSizes.map((s: string) => ({ id: s, size: s, gtins: [] })),
          detectedSize: null,
        },
      })
    }

    return NextResponse.json({ upc, found: false, product: null })
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
