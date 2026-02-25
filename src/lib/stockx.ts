'use server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY!

interface StockXProduct {
  id: string
  name: string
  brand: string
  colorway: string
  retailPrice: number
  styleId: string
  media: { imageUrl: string; thumbUrl: string }
  market?: { lowestAsk: number; highestBid: number }
}

export async function searchStockX(query: string): Promise<StockXProduct[]> {
  try {
    const res = await fetch(
      `https://api.stockx.com/v2/catalog/search?query=${encodeURIComponent(query)}&limit=20`,
      {
        headers: {
          'x-api-key': STOCKX_API_KEY,
          'Accept': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      console.error('StockX search error:', res.status, await res.text())
      return []
    }

    const data = await res.json()
    return (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.title || p.name,
      brand: p.brand,
      colorway: p.colorway,
      retailPrice: p.retailPrice,
      styleId: p.styleId,
      media: {
        imageUrl: p.media?.imageUrl || p.media?.thumbUrl || '',
        thumbUrl: p.media?.thumbUrl || p.media?.imageUrl || '',
      },
      market: p.market ? {
        lowestAsk: p.market.lowestAsk,
        highestBid: p.market.highestBid,
      } : undefined,
    }))
  } catch (error) {
    console.error('StockX search failed:', error)
    return []
  }
}

export async function lookupBarcode(barcode: string): Promise<StockXProduct | null> {
  try {
    const products = await searchStockX(barcode)
    return products.length > 0 ? products[0] : null
  } catch {
    return null
  }
}
