import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mixzokickz.com'

  const staticPages = [
    { path: '', priority: 1.0 },
    { path: '/shop', priority: 0.9 },
    { path: '/cleaning', priority: 0.8 },
    { path: '/drops', priority: 0.7 },
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.5 },
    { path: '/faq', priority: 0.4 },
    { path: '/shipping', priority: 0.4 },
    { path: '/returns', priority: 0.3 },
    { path: '/terms', priority: 0.2 },
    { path: '/privacy', priority: 0.2 },
  ].map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }))

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, updated_at')
      .eq('status', 'active')

    productPages = (products || []).map(p => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  } catch { /* table may not exist */ }

  return [...staticPages, ...productPages]
}
