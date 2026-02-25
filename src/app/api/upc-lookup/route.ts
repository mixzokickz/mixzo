import { NextResponse } from 'next/server'

// Simple UPC lookup - returns product name/brand for secondary search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const upc = searchParams.get('upc')

  if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      const item = data.items?.[0]
      if (item) {
        return NextResponse.json({
          source: 'upcitemdb',
          title: item.title || '',
          brand: item.brand || '',
          images: item.images || [],
        })
      }
    }
  } catch {}

  return NextResponse.json({ source: 'none', title: '', brand: '', images: [] })
}
