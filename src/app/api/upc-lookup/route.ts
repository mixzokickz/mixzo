import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upc = searchParams.get('upc')
    if (!upc) return NextResponse.json({ error: 'UPC required' }, { status: 400 })

    // Try UPCitemdb free API
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`)

    if (!res.ok) {
      return NextResponse.json({ error: 'UPC lookup failed', upc }, { status: res.status })
    }

    const data = await res.json()
    const item = data.items?.[0]

    return NextResponse.json({
      upc,
      found: !!item,
      product: item ? {
        title: item.title,
        brand: item.brand,
        description: item.description,
        images: item.images || [],
        ean: item.ean,
      } : null,
    })
  } catch (error) {
    console.error('UPC lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
