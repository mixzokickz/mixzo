import { NextResponse } from 'next/server'
import { getStockXToken } from '@/lib/stockx'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || ''
const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

async function stockxSearch(query: string) {
  const token = await getStockXToken()
  if (!token || !STOCKX_API_KEY) return null

  const res = await fetch(
    `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&pageSize=5`,
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
  const products = data.products || []
  if (products.length === 0) return null

  const p = products[0]

  // Get variants (sizes)
  let variants: any[] = []
  let detectedSize: string | null = null
  try {
    const varRes = await fetch(
      `https://api.stockx.com/v2/catalog/products/${p.id}/variants?pageSize=100`,
      {
        headers: {
          'x-api-key': STOCKX_API_KEY,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    )
    if (varRes.ok) {
      const varData = await varRes.json()
      const rawVars = Array.isArray(varData) ? varData : (varData.variants || [])
      variants = rawVars.map((v: any) => ({
        id: v.variantId || v.id,
        size: v.sizeChart?.defaultConversion?.size || v.variantValue || v.size || '',
        gtins: (v.gtins || []).map((g: any) => typeof g === 'string' ? g : g.identifier).filter(Boolean),
      }))
    }
  } catch {}

  return {
    name: p.title || p.name,
    brand: p.brand,
    styleId: p.styleId,
    colorway: p.colorway,
    retailPrice: p.retailPrice,
    image: p.media?.imageUrl || p.media?.thumbUrl || '',
    images: [p.media?.imageUrl, p.media?.thumbUrl].filter(Boolean),
    stockxProductId: p.id,
    variants,
    detectedSize,
    source: 'stockx',
  }
}

async function goatSearch(query: string) {
  const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': GOAT_ALGOLIA_APP,
      'x-algolia-api-key': GOAT_ALGOLIA_KEY,
    },
    body: JSON.stringify({ query, hitsPerPage: 10 }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const hits = data.hits || []
  if (hits.length === 0) return null

  const best = hits[0]
  const allSizes = hits
    .filter((h: any) => h.sku === best.sku && h.size_us_men)
    .map((h: any) => h.size_us_men || h.size)
    .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)
    .sort((a: string, b: string) => parseFloat(a) - parseFloat(b))

  return {
    name: best.name || '',
    brand: best.brand_name || '',
    styleId: best.sku || '',
    colorway: best.color || '',
    retailPrice: best.retail_price_cents ? best.retail_price_cents / 100 : null,
    image: best.main_picture_url || '',
    images: [best.main_picture_url].filter(Boolean),
    stockxProductId: null,
    variants: allSizes.map((s: string) => ({ id: s, size: s, gtins: [] })),
    detectedSize: null,
    source: 'goat',
  }
}

async function lookupUPC(upc: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.items?.[0]?.title || null
  } catch { return null }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upc = searchParams.get('upc')
    if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

    // Try StockX first
    let product = await stockxSearch(upc)

    // If not found and it's a numeric barcode, lookup name then search
    if (!product && /^\d{10,14}$/.test(upc)) {
      const name = await lookupUPC(upc)
      if (name) {
        product = await stockxSearch(name) || await goatSearch(name)
      }
    }

    // Fallback to GOAT
    if (!product) {
      product = await goatSearch(upc)
    }

    if (product) {
      return NextResponse.json({ upc, found: true, source: product.source, product })
    }

    return NextResponse.json({ upc, found: false, product: null })
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
