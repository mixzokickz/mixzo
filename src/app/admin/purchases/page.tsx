'use client'

import { useState } from 'react'
import { Receipt, Plus, X, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Purchase { id: number; product: string; cost: number; quantity: number; date: string; supplier: string }

const MOCK: Purchase[] = [
  { id: 1, product: 'Jordan 4 Retro Bred', cost: 180, quantity: 3, date: '2026-02-20', supplier: 'Nike Direct' },
  { id: 2, product: 'New Balance 550', cost: 95, quantity: 5, date: '2026-02-18', supplier: 'Wholesale Co' },
  { id: 3, product: 'Yeezy Slide Onyx', cost: 55, quantity: 8, date: '2026-02-15', supplier: 'Adidas Confirmed' },
]

export default function PurchasesPage() {
  const [purchases] = useState<Purchase[]>(MOCK)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = purchases.filter(p => !search || p.product.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase()))
  const totalSpent = purchases.reduce((s, p) => s + p.cost * p.quantity, 0)

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchases</h1>
          <p className="text-sm text-[var(--text-muted)]">Total spent: {formatPrice(totalSpent)}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">
          {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'Add Purchase'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Purchase</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['Product Name', 'Cost ($)', 'Quantity', 'Date', 'Supplier'].map(p => (
              <input key={p} type={p === 'Date' ? 'date' : p.includes('Cost') || p === 'Quantity' ? 'number' : 'text'} placeholder={p} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none [color-scheme:dark]" />
            ))}
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">Save Purchase</button>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchases..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Receipt size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No purchases recorded</h2>
          <p className="text-sm text-[var(--text-secondary)]">Track your inventory costs here</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
              <th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Cost</th><th className="px-4 py-3 font-medium">Qty</th><th className="px-4 py-3 font-medium hidden sm:table-cell">Supplier</th><th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th><th className="px-4 py-3 font-medium text-right">Total</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{p.product}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatPrice(p.cost)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{p.quantity}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden sm:table-cell">{p.supplier}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] hidden sm:table-cell">{p.date}</td>
                  <td className="px-4 py-3 text-white font-medium text-right">{formatPrice(p.cost * p.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
