'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, Mail, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setCustomers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <span className="text-sm text-[var(--text-muted)]">{filtered.length} total</span>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search customers..."
        className="w-full mb-6"
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--pink)]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No customers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 card-hover flex items-center justify-between">
              <div>
                <p className="font-medium">{c.full_name || 'Unnamed'}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-muted)]">
                  {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>}
                </div>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)]">
                <span className="capitalize px-2 py-0.5 rounded-full bg-[var(--bg-elevated)]">{c.role || 'customer'}</span>
                <p className="mt-1">{formatDate(c.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
