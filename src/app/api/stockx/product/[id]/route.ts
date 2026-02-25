import { NextResponse } from 'next/server'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || 'Xr6NU7b5lpMUOnCrTxKz1h8hlERePF130gaNhWg9'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const res = await fetch(`https://api.stockx.com/v2/catalog/products/${id}`, {
      headers: { 'x-api-key': STOCKX_API_KEY, 'Accept': 'application/json' },
    })

    if (!res.ok) {
      console.error('StockX product error:', res.status)
      return NextResponse.json({ error: 'Product not found' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('StockX product detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
