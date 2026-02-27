import { NextResponse } from 'next/server'
import { getStockXTokens } from '@/lib/stockx'

export async function GET() {
  try {
    const tokens = await getStockXTokens()
    if (!tokens) {
      return NextResponse.json({ connected: false, reason: 'no_tokens' })
    }

    const now = new Date()
    const expiresAt = new Date(tokens.expires_at)
    const expired = expiresAt.getTime() < now.getTime()

    return NextResponse.json({
      connected: !expired,
      reason: expired ? 'expired' : 'ok',
      expiresAt: tokens.expires_at,
    })
  } catch {
    return NextResponse.json({ connected: false, reason: 'error' })
  }
}
