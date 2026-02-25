import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lowStock } = await supabaseAdmin
      .from('products')
      .select('id, name, quantity, sku')
      .eq('status', 'active')
      .lte('quantity', 2)

    if (lowStock?.length) {
      // Log alerts — integrate with notification system later
      console.log(`Low stock alert: ${lowStock.length} products`, lowStock.map(p => p.name))

      for (const product of lowStock) {
        try {
          await supabaseAdmin.from('notifications').insert({
            title: 'Low Stock Alert',
            message: `${product.name} has only ${product.quantity} left in stock`,
            type: 'warning',
          })
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({ checked: true, low_stock_count: lowStock?.length || 0 })
  } catch (error) {
    console.error('Stock alerts cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
