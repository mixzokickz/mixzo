import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mixzo.store'

  const staticPages = [
    '', '/shop', '/drops', '/cart', '/login', '/signup',
    '/returns', '/faq', '/terms', '/privacy', '/shipping', '/contact',
    '/orders/lookup', '/wishlist',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  // Dynamic product pages
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, updated_at')
    .eq('status', 'active')

  const productPages = (products || []).map(p => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...productPages]
}
