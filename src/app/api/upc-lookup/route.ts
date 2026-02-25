import { NextResponse } from 'next/server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || ''

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upc = searchParams.get('upc')
    if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

    // Try StockX catalog search first (most reliable for sneakers)
    if (STOCKX_API_KEY) {
      try {
        const stockxRes = await fetch(
          `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(upc)}&pageSize=5`,
          { headers: { 'x-api-key': STOCKX_API_KEY, Accept: 'application/json' } }
        )
        if (stockxRes.ok) {
          const stockxData = await stockxRes.json()
          const products = stockxData.products || []
          if (products.length > 0) {
            const p = products[0]

            // Get full product details with variants
            let variants: any[] = []
            let imageUrls: string[] = []
            let detectedSize: string | null = null

            try {
              const detailRes = await fetch(
                `https://api.stockx.com/v2/catalog/products/${p.id}`,
                { headers: { 'x-api-key': STOCKX_API_KEY, Accept: 'application/json' } }
              )
              if (detailRes.ok) {
                const detail = await detailRes.json()
                const product = detail.product || detail

                // Build image URL from urlKey
                const urlKey = product.urlKey || ''
                if (urlKey) {
                  const lowerKey = urlKey.toLowerCase()
                  imageUrls = [`https://images.stockx.com/images/${lowerKey}.jpg`]
                }
              }
            } catch {}

            // Get variants (sizes)
            try {
              const varRes = await fetch(
                `https://api.stockx.com/v2/catalog/products/${p.id}/variants?pageSize=100`,
                { headers: { 'x-api-key': STOCKX_API_KEY, Accept: 'application/json' } }
              )
              if (varRes.ok) {
                const varData = await varRes.json()
                const rawVars = Array.isArray(varData) ? varData : (varData.variants || [])
                variants = rawVars.map((v: any) => ({
                  id: v.variantId || v.id,
                  size: v.sizeChart?.defaultConversion?.size || v.variantValue || v.size || '',
                  gtins: (v.gtins || []).map((g: any) => typeof g === 'string' ? g : g.identifier).filter(Boolean),
                }))

                // Try to match UPC to a specific variant
                for (const v of variants) {
                  if (v.gtins.includes(upc)) {
                    detectedSize = v.size
                    break
                  }
                }
              }
            } catch {}

            const mainImage = p.media?.imageUrl || p.media?.thumbUrl || (imageUrls[0] || '')

            return NextResponse.json({
              upc,
              found: true,
              source: 'stockx',
              product: {
                name: p.title || p.name,
                brand: p.brand,
                styleId: p.styleId,
                colorway: p.colorway,
                retailPrice: p.retailPrice,
                image: mainImage,
                images: [mainImage, ...imageUrls].filter(Boolean),
                stockxProductId: p.id,
                variants,
                detectedSize,
              },
            })
          }
        }
      } catch (e) {
        console.error('StockX lookup error:', e)
      }
    }

    // Fallback: UPCitemdb
    try {
      const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`)
      if (res.ok) {
        const data = await res.json()
        const item = data.items?.[0]
        if (item) {
          return NextResponse.json({
            upc,
            found: true,
            source: 'upcdb',
            product: {
              name: item.title,
              brand: item.brand,
              image: item.images?.[0] || '',
              images: item.images || [],
            },
          })
        }
      }
    } catch {}

    return NextResponse.json({ upc, found: false, product: null })
  } catch (error) {
    console.error('UPC lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
