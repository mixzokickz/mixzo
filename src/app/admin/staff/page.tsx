'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Shield, UserCog, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Staff { id: string; full_name: string; email: string; role: string; last_sign_in_at?: string; created_at: string }

const roleIcon: Record<string, any> = { owner: Shield, manager: UserCog, staff: User }
const roleColor: Record<string, string> = { owner: 'text-[var(--pink)] bg-[var(--pink)]/10', manager: 'text-[var(--cyan)] bg-[var(--cyan)]/10', staff: 'text-[var(--text-secondary)] bg-white/5' }

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').in('role', ['owner', 'manager', 'staff']).order('created_at', { ascending: true })
      .then(({ data }) => { setStaff(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-sm text-[var(--text-muted)]">{staff.length} team members</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Users size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No team members</h2>
          <p className="text-sm text-[var(--text-secondary)]">Add staff members to manage your store</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => {
            const Icon = roleIcon[s.role] || User
            return (
              <div key={s.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pink)] to-[var(--cyan)] flex items-center justify-center text-white font-bold text-sm">
                    {(s.full_name || s.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${roleColor[s.role] || roleColor.staff}`}>
                    <Icon size={12} /> {s.role}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] hidden sm:block">Joined {formatDate(s.created_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
