'use client'

import { useState } from 'react'
import { Truck, Search, Package, Plug, ExternalLink } from 'lucide-react'

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', order: 'ORD-1042', customer: 'James Wilson', carrier: 'FedEx', tracking: '789456123', status: 'In Transit', date: '2026-02-22' },
  { id: 'SHP-002', order: 'ORD-1038', customer: 'Maria Lopez', carrier: 'UPS', tracking: '321654987', status: 'Delivered', date: '2026-02-20' },
  { id: 'SHP-003', order: 'ORD-1035', customer: 'Tyler Chen', carrier: 'USPS', tracking: '654789321', status: 'Label Created', date: '2026-02-19' },
]

const statusColor: Record<string, string> = {
  'Delivered': 'text-green-400 bg-green-500/10',
  'In Transit': 'text-[var(--cyan)] bg-[var(--cyan)]/10',
  'Label Created': 'text-yellow-400 bg-yellow-500/10',
}

export default function ShippingPage() {
  const [tracking, setTracking] = useState('')
  const [search, setSearch] = useState('')

  const filtered = MOCK_SHIPMENTS.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.order.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q) || s.tracking.includes(q)
  })

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Shipping</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage shipments and tracking</p>
      </div>

      {/* Connect Provider Card */}
      <div className="bg-gradient-to-br from-[var(--pink)]/10 to-[var(--cyan)]/10 border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--pink)]/20"><Plug size={24} className="text-[var(--pink)]" /></div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">Connect Shipping Provider</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Connect FedEx, UPS, or USPS to auto-generate labels and track shipments in real time.</p>
            <button className="px-4 py-2 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">Connect Provider</button>
          </div>
        </div>
      </div>

      {/* Tracking Lookup */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Tracking Lookup</h3>
        <div className="flex gap-2">
          <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number..." className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
          <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-white text-sm font-medium hover:bg-white/10 transition flex items-center gap-2">
            <Search size={16} /> Track
          </button>
        </div>
      </div>

      {/* Recent Shipments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent Shipments</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none w-48" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Truck size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-1">No shipments yet</h2>
            <p className="text-sm text-[var(--text-secondary)]">Shipments will appear here when orders are fulfilled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => (
              <div key={s.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5"><Package size={18} className="text-[var(--text-muted)]" /></div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.customer}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.order} · {s.carrier} · {s.tracking}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[s.status] || 'text-[var(--text-muted)] bg-white/5'}`}>{s.status}</span>
                  <span className="text-xs text-[var(--text-muted)]">{s.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
