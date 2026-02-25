import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User } from '@supabase/supabase-js'

export async function requireAdmin(request: Request): Promise<User | null> {
  let user: User | null = null

  // Method 1: Bearer token in Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    const { data } = await supabaseAdmin.auth.getUser(token)
    user = data?.user || null
  }

  // Method 2: Cookie-based auth (from createBrowserClient)
  if (!user) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
          },
        }
      )
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {}
  }

  if (!user) return null

  // Check role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['owner', 'manager', 'staff'].includes(profile.role)) return null
  return user
}
