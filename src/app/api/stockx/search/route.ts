import { NextResponse } from 'next/server'
import { getStockXToken, stockxFetch } from '@/lib/stockx'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || ''

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

interface ProductResult {
  id: string
  name: string
  brand: string
  colorway: string
  retailPrice: number | null
  styleId: string
  image: string
  thumb: string
  availableSizes: string[]
  imageUrls: string[]
}

async function searchStockX(query: string, limit: number): Promise<ProductResult[] | null> {
  const token = await getStockXToken()
  if (!token || !STOCKX_API_KEY) return null

  const headers = {
    'x-api-key': STOCKX_API_KEY,
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  }

  const res = await fetch(
    `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&pageSize=${limit}`,
    { headers }
  )
  if (!res.ok) return null
  const data = await res.json()
  const products = data.products || []
  if (products.length === 0) return null

  // For each product, fetch variants to get sizes + images
  const results: ProductResult[] = []
  for (const p of products.slice(0, limit)) {
    const productId = p.productId || p.id
    let sizes: string[] = []
    let imageUrl = p.media?.imageUrl || p.media?.thumbUrl || ''

    // Fetch variants for sizes
    try {
      const varRes = await fetch(
        `https://api.stockx.com/v2/catalog/products/${productId}/variants?pageSize=100`,
        { headers }
      )
      if (varRes.ok) {
        const varData = await varRes.json()
        const variants = Array.isArray(varData) ? varData : (varData.variants || [])
        sizes = Array.from(new Set<string>(
          variants
            .map((v: any) => v.sizeChart?.defaultConversion?.size || v.variantValue || '')
            .filter(Boolean)
        )).sort((a: string, b: string) => parseFloat(a) - parseFloat(b))
      }
    } catch {}

    // Try to resolve image from StockX CDN if media URL is missing
    if (!imageUrl) {
      const urlKey = p.urlKey || ''
      if (urlKey) {
        imageUrl = `https://images.stockx.com/images/${urlKey}.jpg`
      }
    }

    results.push({
      id: productId,
      name: p.title || p.name || '',
      brand: p.brand || '',
      colorway: p.productAttributes?.colorway || p.colorway || '',
      retailPrice: p.productAttributes?.retailPrice || p.retailPrice || null,
      styleId: p.styleId || p.productAttributes?.sku || '',
      image: imageUrl,
      thumb: p.media?.thumbUrl || imageUrl,
      availableSizes: sizes,
      imageUrls: [imageUrl, p.media?.thumbUrl, ...(p.media?.gallery || [])].filter(Boolean),
    })
  }

  return results.length > 0 ? results : null
}

// Search by barcode — look through StockX variants for matching GTIN
async function searchStockXByBarcode(barcode: string): Promise<ProductResult | null> {
  const token = await getStockXToken()
  if (!token || !STOCKX_API_KEY) return null

  const headers = {
    'x-api-key': STOCKX_API_KEY,
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  }

  // StockX catalog search can match barcodes directly
  const res = await fetch(
    `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(barcode)}&pageSize=5`,
    { headers }
  )
  if (!res.ok) return null
  const data = await res.json()
  const products = data.products || []

  // Check each product's variants for GTIN match
  for (const p of products) {
    const productId = p.productId || p.id
    try {
      const varRes = await fetch(
        `https://api.stockx.com/v2/catalog/products/${productId}/variants?pageSize=100`,
        { headers }
      )
      if (!varRes.ok) continue
      const varData = await varRes.json()
      const variants = Array.isArray(varData) ? varData : (varData.variants || [])

      // Check GTINs for barcode match
      let matchedSize = ''
      for (const v of variants) {
        const gtins = (v.gtins || []).map((g: any) => typeof g === 'string' ? g : g.identifier).filter(Boolean)
        if (gtins.includes(barcode)) {
          matchedSize = v.sizeChart?.defaultConversion?.size || v.variantValue || ''
          break
        }
      }

      // If barcode matched or this is the first result, return it
      const allSizes = Array.from(new Set<string>(
        variants
          .map((v: any) => v.sizeChart?.defaultConversion?.size || v.variantValue || '')
          .filter(Boolean)
      )).sort((a: string, b: string) => parseFloat(a) - parseFloat(b))

      const imageUrl = p.media?.imageUrl || p.media?.thumbUrl || (p.urlKey ? `https://images.stockx.com/images/${p.urlKey}.jpg` : '')

      return {
        id: productId,
        name: p.title || p.name || '',
        brand: p.brand || '',
        colorway: p.productAttributes?.colorway || p.colorway || '',
        retailPrice: p.productAttributes?.retailPrice || p.retailPrice || null,
        styleId: p.styleId || p.productAttributes?.sku || '',
        image: imageUrl,
        thumb: p.media?.thumbUrl || imageUrl,
        availableSizes: allSizes,
        imageUrls: [imageUrl].filter(Boolean),
        // Include matched size info
        ...(matchedSize ? { matchedSize } : {}),
      } as ProductResult
    } catch {}
  }

  return null
}

async function searchGOAT(query: string, limit: number): Promise<ProductResult[] | null> {
  const res = await fetch(`https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': GOAT_ALGOLIA_APP,
      'x-algolia-api-key': GOAT_ALGOLIA_KEY,
    },
    body: JSON.stringify({
      query,
      hitsPerPage: Math.min(limit * 10, 100),
      distinct: false,
      attributesToRetrieve: ['product_template_id', 'name', 'product_title', 'brand_name', 'color', 'retail_price_cents', 'sku', 'main_picture_url', 'picture_url', 'size', 'slug'],
    }),
  })
  if (!res.ok) return null
  const data = await res.json()

  const grouped = new Map<string, { hit: any; sizes: Set<string> }>()
  for (const h of (data.hits || [])) {
    const pid = String(h.product_template_id || h.sku || h.name)
    if (!grouped.has(pid)) {
      grouped.set(pid, { hit: h, sizes: new Set() })
    }
    if (h.size) grouped.get(pid)!.sizes.add(String(h.size))
  }

  return Array.from(grouped.values())
    .slice(0, limit)
    .map(({ hit: h, sizes }) => ({
      id: h.product_template_id || h.id || '',
      name: h.name || h.product_title || '',
      brand: h.brand_name || '',
      colorway: h.color || '',
      retailPrice: h.retail_price_cents ? h.retail_price_cents / 100 : null,
      styleId: h.sku || '',
      image: h.main_picture_url || h.picture_url || '',
      thumb: h.main_picture_url || h.picture_url || '',
      availableSizes: Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b)),
      imageUrls: [h.main_picture_url || h.picture_url || ''].filter(Boolean),
    }))
}

function isBarcode(query: string): boolean {
  return /^\d{10,14}$/.test(query.trim())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) return NextResponse.json({ error: 'Query required', products: [] }, { status: 400 })

    const trimmed = query.trim()

    // If barcode, try StockX barcode lookup first (matches GTINs in variants)
    if (isBarcode(trimmed)) {
      const barcodeResult = await searchStockXByBarcode(trimmed)
      if (barcodeResult) {
        return NextResponse.json({ products: [barcodeResult], source: 'stockx-barcode' })
      }
    }

    // StockX is primary search (name, style ID, or barcode fallback)
    let products = await searchStockX(trimmed, limit)
    let source = 'stockx'

    // GOAT Algolia as fallback if StockX returned nothing
    if (!products || products.length === 0) {
      products = await searchGOAT(trimmed, limit)
      source = 'goat'
    }

    return NextResponse.json({ products: products || [], source })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 })
  }
}
