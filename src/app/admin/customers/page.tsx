'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Users, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Customer {
  id: string; full_name: string; email: string; phone?: string; created_at: string; role: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data || []); setLoading(false) })
  }, [])

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm text-[var(--text-muted)]">{customers.length} total customers</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Users size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No customers yet</h2>
          <p className="text-sm text-[var(--text-secondary)]">Customers will appear here after they sign up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link key={c.id} href={`/admin/customers/${c.id}`} className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--pink)]/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pink)] to-[var(--cyan)] flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{c.full_name || 'No name'}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{c.email}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{formatDate(c.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
