'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

interface Customer {
  id: string; full_name: string; email: string; phone?: string; created_at: string;
  address_line1?: string; city?: string; state?: string; zip?: string;
}

interface Order {
  id: string; created_at: string; status: string; total: number;
}

export default function CustomerDetailPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: o }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('orders').select('id, created_at, status, total').eq('customer_id', params.id).order('created_at', { ascending: false }),
      ])
      setCustomer(c)
      setOrders(o || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="skeleton h-48 rounded-xl" /></div>

  if (!customer) return (
    <div className="text-center py-16">
      <User size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-white mb-2">Customer not found</h2>
      <Link href="/admin/customers" className="text-sm text-[var(--pink)] hover:underline">Back to customers</Link>
    </div>
  )

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white"><ArrowLeft size={16} /> Customers</Link>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pink)] to-[var(--cyan)] flex items-center justify-center">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{customer.full_name || 'No name'}</h1>
          <p className="text-sm text-[var(--text-muted)]">Customer since {formatDate(customer.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)]">Total Spent</p>
          <p className="text-xl font-bold text-white">{formatPrice(totalSpent)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)]">Orders</p>
          <p className="text-xl font-bold text-white">{orders.length}</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Contact Info</h2>
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"><Mail size={14} /> {customer.email}</div>
        {customer.phone && <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"><Phone size={14} /> {customer.phone}</div>}
        {customer.address_line1 && <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"><MapPin size={14} /> {customer.address_line1}, {customer.city}, {customer.state} {customer.zip}</div>}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatPrice(o.total)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${o.status === 'delivered' ? 'bg-green-500/10 text-green-400' : o.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{o.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
