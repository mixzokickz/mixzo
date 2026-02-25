import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

const STOCKX_API_KEY = process.env.STOCKX_API_KEY || 'Xr6NU7b5lpMUOnCrTxKz1h8hlERePF130gaNhWg9'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_ids } = await request.json()

    const { data: products, error } = product_ids
      ? await supabaseAdmin.from('products').select('id, stockx_id, name').in('id', product_ids)
      : await supabaseAdmin.from('products').select('id, stockx_id, name').not('stockx_id', 'is', null).eq('status', 'active')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const results: Array<{ id: string; name: string; success: boolean; market_price?: number; error?: string }> = []

    for (const product of products || []) {
      if (!product.stockx_id) {
        results.push({ id: product.id, name: product.name, success: false, error: 'No StockX ID' })
        continue
      }

      try {
        const res = await fetch(`https://api.stockx.com/v2/catalog/products/${product.stockx_id}`, {
          headers: { 'x-api-key': STOCKX_API_KEY, 'Accept': 'application/json' },
        })

        if (!res.ok) {
          results.push({ id: product.id, name: product.name, success: false, error: `StockX ${res.status}` })
          continue
        }

        const data = await res.json()
        const marketPrice = data.market?.lastSale || data.market?.lowestAsk || null

        if (marketPrice) {
          await supabaseAdmin.from('products').update({
            market_price: marketPrice,
            price_synced_at: new Date().toISOString(),
          }).eq('id', product.id)
        }

        results.push({ id: product.id, name: product.name, success: true, market_price: marketPrice })
      } catch (err) {
        results.push({ id: product.id, name: product.name, success: false, error: 'Fetch failed' })
      }
    }

    return NextResponse.json({ results, synced: results.filter(r => r.success).length, total: results.length })
  } catch (error) {
    console.error('Price sync error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
