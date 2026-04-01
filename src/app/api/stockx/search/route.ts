import { NextResponse } from 'next/server'
import { getStockXToken, stockxFetch } from '@/lib/stockx'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || ''

const GOAT_ALGOLIA_APP = '2FWOTDVM2O'
const GOAT_ALGOLIA_KEY = 'ac96de6fef0e02bb95d433d8d5c7038a'

// Abbreviations that should be UPPERCASED in title-cased URL keys
const ABBREVS = new Set(['ps', 'gs', 'td', 'og', 'se', 'sp', 'pe', 'qs', 'nrg', 'wmns', 'i', 'w'])

function buildTitleCase(key: string): string {
  return key.split('-').filter(Boolean)
    .map(w => ABBREVS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')
}

// Try multiple StockX CDN URL patterns
async function findCdnImage(urlKey: string | undefined): Promise<string | null> {
  if (!urlKey) return null
  const lower = urlKey.toLowerCase()
  const title = buildTitleCase(urlKey)
  const candidates = [
    `https://images.stockx.com/images/${title}.jpg`,
    `https://images.stockx.com/images/${lower}.jpg`,
    `https://images.stockx.com/images/${title}.png`,
    `https://images.stockx.com/images/${lower}.png`,
  ]
  for (const url of candidates) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
      if (r.ok) return url
    } catch {}
  }
  return null
}

// Normalize size strings: "10.5C" -> "10.5", "1Y" -> "1", "10.0" -> "10"
function normalizeSize(raw: string): string {
  if (!raw) return ''
  // Strip trailing letters (C for child, Y for youth, W for women)
  let s = raw.replace(/[CcYyWw]$/, '').trim()
  // Strip trailing .0
  s = s.replace(/\.0$/, '')
  return s
}

// GOAT enrichment — returns image + sizes
async function enrichFromGoat(styleCode: string | undefined, productName: string | undefined): Promise<{ image: string | null; sizes: string[] }> {
  const query = styleCode || productName
  if (!query) return { image: null, sizes: [] }
  try {
    const resp = await fetch(
      `https://${GOAT_ALGOLIA_APP}-dsn.algolia.net/1/indexes/product_variants_v2/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-algolia-application-id': GOAT_ALGOLIA_APP,
          'x-algolia-api-key': GOAT_ALGOLIA_KEY,
        },
        body: JSON.stringify({
          query,
          hitsPerPage: 50,
          distinct: false,
          attributesToRetrieve: ['main_picture_url', 'grid_picture_url', 'original_picture_url', 'size', 'product_template_id'],
        }),
      }
    )
    if (!resp.ok) return { image: null, sizes: [] }
    const data = await resp.json()
    const hits = data?.hits || []
    if (hits.length === 0) return { image: null, sizes: [] }

    const image = hits[0]?.main_picture_url || hits[0]?.grid_picture_url || hits[0]?.original_picture_url || null

    // Collect unique sizes from all variants of the same product
    const firstPid = hits[0]?.product_template_id
    const sizeSet = new Set<string>()
    for (const h of hits) {
      if (firstPid && h.product_template_id !== firstPid) continue
      if (h.size) sizeSet.add(normalizeSize(String(h.size)))
    }
    const sizes = Array.from(sizeSet).filter(Boolean).sort((a, b) => parseFloat(a) - parseFloat(b))

    return { image, sizes }
  } catch { return { image: null, sizes: [] } }
}

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
  // Only enrich first 5 with variants/GOAT (rest get basic data) for speed
  const ENRICH_LIMIT = 5
  const results: ProductResult[] = []
  for (let idx = 0; idx < Math.min(products.length, limit); idx++) {
    const p = products[idx]
    const productId = p.productId || p.id
    let sizes: string[] = []
    let imageUrl = p.media?.imageUrl || p.media?.thumbUrl || ''
    const urlKey = p.urlKey || p.url_key || ''
    const styleId = p.styleId || p.productAttributes?.sku || ''
    const productName = p.title || p.name || ''

    // Only do expensive enrichment (variants + GOAT) for first few results
    if (idx >= ENRICH_LIMIT) {
      // Basic result without variant fetch
      const quickGoatImg = !imageUrl ? (await enrichFromGoat(styleId, productName)).image : null
      results.push({
        id: productId,
        name: productName,
        brand: p.brand || '',
        colorway: p.productAttributes?.colorway || p.colorway || '',
        retailPrice: p.productAttributes?.retailPrice || p.retailPrice || null,
        styleId,
        image: imageUrl || quickGoatImg || '',
        thumb: p.media?.thumbUrl || imageUrl || quickGoatImg || '',
        availableSizes: [],
        imageUrls: [imageUrl || quickGoatImg || ''].filter(Boolean),
      })
      continue
    }

    // Fetch StockX variants + GOAT enrichment in parallel
    const [variantResult, goatResult] = await Promise.all([
      // Fetch StockX variants for sizes
      (async () => {
        try {
          const varRes = await fetch(
            `https://api.stockx.com/v2/catalog/products/${productId}/variants?pageSize=100`,
            { headers }
          )
          if (varRes.ok) {
            const varData = await varRes.json()
            const variants = Array.isArray(varData) ? varData : (varData.variants || [])
            return Array.from(new Set<string>(
              variants
                .map((v: any) => normalizeSize(v.sizeChart?.defaultConversion?.size || v.variantValue || ''))
                .filter(Boolean)
            )).sort((a: string, b: string) => parseFloat(a) - parseFloat(b))
          }
        } catch {}
        return [] as string[]
      })(),
      // Always fetch GOAT for image + sizes fallback
      enrichFromGoat(styleId, productName),
    ])

    // Use StockX sizes if available, otherwise GOAT sizes
    sizes = variantResult.length > 0 ? variantResult : goatResult.sizes

    // Use StockX image if available, otherwise try CDN, then GOAT
    if (!imageUrl) {
      // Try StockX product detail
      if (productId) {
        try {
          const detailRes = await stockxFetch(`https://api.stockx.com/v2/catalog/products/${productId}`)
          if (detailRes.ok) {
            const detail = await detailRes.json()
            const prod = detail.product || detail
            imageUrl = prod?.media?.imageUrl || prod?.media?.thumbUrl || prod?.media?.smallImageUrl || ''
          }
        } catch {}
      }
      // Try CDN
      if (!imageUrl && urlKey) {
        imageUrl = (await findCdnImage(urlKey)) || ''
      }
      // Use GOAT image
      if (!imageUrl && goatResult.image) {
        imageUrl = goatResult.image
      }
    }

    results.push({
      id: productId,
      name: productName,
      brand: p.brand || '',
      colorway: p.productAttributes?.colorway || p.colorway || '',
      retailPrice: p.productAttributes?.retailPrice || p.retailPrice || null,
      styleId,
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
          matchedSize = normalizeSize(v.sizeChart?.defaultConversion?.size || v.variantValue || '')
          break
        }
      }

      // If barcode matched or this is the first result, return it
      const allSizes = Array.from(new Set<string>(
        variants
          .map((v: any) => normalizeSize(v.sizeChart?.defaultConversion?.size || v.variantValue || ''))
          .filter(Boolean)
      )).sort((a: string, b: string) => parseFloat(a) - parseFloat(b))

      // Get image — try StockX first, then GOAT
      const sxStyleId = p.styleId || p.productAttributes?.sku || ''
      const sxName = p.title || p.name || ''
      let imageUrl = p.media?.imageUrl || p.media?.thumbUrl || ''
      if (!imageUrl) {
        const goat = await enrichFromGoat(sxStyleId, sxName)
        imageUrl = goat.image || (p.urlKey ? `https://images.stockx.com/images/${p.urlKey}.jpg` : '')
      }

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
    if (h.size) grouped.get(pid)!.sizes.add(normalizeSize(String(h.size)))
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

export const maxDuration = 30

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 10)

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
