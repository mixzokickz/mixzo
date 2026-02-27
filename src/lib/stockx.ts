import { createClient } from '@supabase/supabase-js'
import { STOCKX_TOKEN_URL } from './constants'

const STOCKX_CLIENT_ID = (process.env.STOCKX_CLIENT_ID || '').trim()
const STOCKX_CLIENT_SECRET = (process.env.STOCKX_CLIENT_SECRET || '').trim()
const STOCKX_API_KEY = (process.env.STOCKX_API_KEY || '').trim()

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface StockXTokenRow {
  id: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: string
  scope: string | null
}

export async function getStockXTokens(): Promise<StockXTokenRow | null> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('stockx_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function saveStockXTokens(tokens: {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in: number
  scope?: string
}): Promise<void> {
  const supabase = getServiceClient()
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase.from('stockx_tokens').delete().gt('created_at', '1900-01-01T00:00:00Z')
  await supabase.from('stockx_tokens').insert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? '',
    token_type: tokens.token_type ?? 'Bearer',
    expires_at: expiresAt,
    scope: tokens.scope ?? null,
  })
}

export async function deleteStockXTokens(): Promise<void> {
  const supabase = getServiceClient()
  await supabase.from('stockx_tokens').delete().gt('created_at', '1900-01-01T00:00:00Z')
}

async function fetchClientCredentialsToken(): Promise<{
  access_token: string
  expires_in: number
  token_type: string
} | null> {
  if (!STOCKX_CLIENT_ID || !STOCKX_CLIENT_SECRET) return null
  try {
    const res = await fetch(STOCKX_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: STOCKX_CLIENT_ID,
        client_secret: STOCKX_CLIENT_SECRET,
        audience: 'gateway.stockx.com',
      }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getStockXToken(): Promise<string | null> {
  const tokens = await getStockXTokens()
  if (tokens) {
    const now = new Date()
    const expiresAt = new Date(tokens.expires_at)
    if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
      return tokens.access_token
    }
  }

  // Try client_credentials
  const ccToken = await fetchClientCredentialsToken()
  if (ccToken) {
    await saveStockXTokens({
      access_token: ccToken.access_token,
      expires_in: ccToken.expires_in,
      token_type: ccToken.token_type,
    })
    return ccToken.access_token
  }

  return null
}

export async function stockxFetch(url: string): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (STOCKX_API_KEY) headers['x-api-key'] = STOCKX_API_KEY
  const token = await getStockXToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, { headers })
}

export async function isStockXConnected(): Promise<boolean> {
  // Simple check — can we search?
  try {
    const res = await fetch(`https://api.stockx.com/v2/catalog/search?query=test&pageSize=1`, {
      headers: { 'x-api-key': STOCKX_API_KEY, Accept: 'application/json' },
    })
    return res.ok
  } catch {
    return false
  }
}
