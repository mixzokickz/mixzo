import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find products with duplicate or invalid barcodes
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, barcode, sku')
      .not('barcode', 'is', null)
      .order('barcode')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const barcodeMap = new Map<string, Array<{ id: string; name: string }>>()
    const invalid: Array<{ id: string; name: string; barcode: string }> = []

    for (const p of products || []) {
      if (!p.barcode || p.barcode.length < 8) {
        invalid.push({ id: p.id, name: p.name, barcode: p.barcode })
        continue
      }
      const existing = barcodeMap.get(p.barcode) || []
      existing.push({ id: p.id, name: p.name })
      barcodeMap.set(p.barcode, existing)
    }

    const duplicates = Array.from(barcodeMap.entries())
      .filter(([, items]) => items.length > 1)
      .map(([barcode, items]) => ({ barcode, products: items }))

    return NextResponse.json({ duplicates, invalid, total_scanned: products?.length || 0 })
  } catch (error) {
    console.error('Barcode cleanup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
