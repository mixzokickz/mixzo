import { supabaseAdmin } from '@/lib/supabase-server'
import { User } from '@supabase/supabase-js'

export async function requireAdmin(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['owner', 'manager'].includes(profile.role)) return null
  return user
}
