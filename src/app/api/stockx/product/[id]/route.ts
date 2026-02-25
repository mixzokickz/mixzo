import { NextResponse } from 'next/server'
import { stockxFetch } from '@/lib/stockx'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await stockxFetch(`https://api.stockx.com/v2/catalog/products/${id}`)

    if (!res.ok) {
      return NextResponse.json({ error: `StockX error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    const p = data.product || data.Product || data

    const productName = p.title || p.name || ''
    const attrs = p.productAttributes || {}
    const urlKey = p.urlKey || p.url_key || ''
    const styleId = p.styleId || attrs.sku || ''

    // Resolve image URL from CDN patterns
    let imageUrl = ''
    if (urlKey || productName || styleId) {
      const lowerKey = urlKey ? urlKey.toLowerCase() : ''
      const cleanTitle = productName.replace(/[()]/g, '').trim().replace(/\s+/g, '-').replace(/--+/g, '-').toLowerCase()
      const skuKey = styleId ? styleId.replace(/\s+/g, '-') : ''

      const candidates = [
        ...(lowerKey ? [`https://images.stockx.com/images/${lowerKey}.jpg`] : []),
        `https://images.stockx.com/images/${cleanTitle}.jpg`,
        ...(skuKey ? [`https://images.stockx.com/images/${skuKey}.jpg`] : []),
        ...(lowerKey ? [`https://images.stockx.com/images/${lowerKey}.png`] : []),
      ]

      const results = await Promise.allSettled(
        candidates.map(async (url) => {
          try {
            const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
            return r.ok ? url : null
          } catch { return null }
        })
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) { imageUrl = r.value; break }
      }
    }

    // Get variants
    let variants: any[] = []
    try {
      const varRes = await stockxFetch(`https://api.stockx.com/v2/catalog/products/${id}/variants?pageSize=100`)
      if (varRes.ok) {
        const varData = await varRes.json()
        const raw = Array.isArray(varData) ? varData : (varData.variants || [])
        variants = raw.map((v: any) => ({
          id: v.variantId || v.id,
          size: v.sizeChart?.defaultConversion?.size || v.variantValue || v.size || '',
          gtins: (v.gtins || []).map((g: any) => typeof g === 'string' ? g : g.identifier).filter(Boolean),
        }))
      }
    } catch {}

    return NextResponse.json({
      id: p.productId || p.id || id,
      title: productName,
      name: productName,
      brand: p.brand,
      styleId: p.styleId || attrs.sku,
      colorway: attrs.colorway || p.colorway,
      retailPrice: attrs.retailPrice || p.retailPrice,
      imageUrl,
      imageUrls: [imageUrl].filter(Boolean),
      variants,
    })
  } catch (error) {
    console.error('StockX product error:', error)
    return NextResponse.json({ error: 'Product lookup failed' }, { status: 500 })
  }
}
