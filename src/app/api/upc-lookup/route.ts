import { NextResponse } from 'next/server'

interface UpcResult {
  source: string
  title: string
  brand: string
  images: string[]
}

async function tryUpcItemDb(upc: string): Promise<UpcResult | null> {
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    if (item?.title || item?.brand) {
      return {
        source: 'upcitemdb',
        title: item.title || '',
        brand: item.brand || '',
        images: item.images || [],
      }
    }
  } catch {}
  return null
}

async function tryOpenFoodFacts(upc: string): Promise<UpcResult | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(upc)}.json`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === 1 && data.product) {
      const p = data.product
      const title = p.product_name || p.product_name_en || ''
      if (title) {
        return {
          source: 'openfoodfacts',
          title,
          brand: p.brands || '',
          images: p.image_url ? [p.image_url] : [],
        }
      }
    }
  } catch {}
  return null
}

async function tryGoatDirectBarcode(upc: string): Promise<UpcResult | null> {
  try {
    const res = await fetch('https://2FWOTDVM2O-dsn.algolia.net/1/indexes/product_variants_v2/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-application-id': '2FWOTDVM2O',
        'x-algolia-api-key': 'ac96de6fef0e02bb95d433d8d5c7038a',
      },
      body: JSON.stringify({ query: upc, hitsPerPage: 1 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const hit = data.hits?.[0]
    if (hit?.name) {
      return {
        source: 'goat_barcode',
        title: hit.name || hit.product_title || '',
        brand: hit.brand_name || '',
        images: hit.main_picture_url ? [hit.main_picture_url] : [],
      }
    }
  } catch {}
  return null
}

// UPC lookup with multiple fallback sources
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const upc = searchParams.get('upc')

  if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

  // Try all sources concurrently — return the first one with data
  const results = await Promise.allSettled([
    tryUpcItemDb(upc),
    tryOpenFoodFacts(upc),
    tryGoatDirectBarcode(upc),
  ])

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      return NextResponse.json(r.value)
    }
  }

  return NextResponse.json({ source: 'none', title: '', brand: '', images: [] })
}
