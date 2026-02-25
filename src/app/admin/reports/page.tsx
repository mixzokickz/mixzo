'use client'

import { useState } from 'react'
import { FileText, Download, DollarSign, Package, Users, Calendar } from 'lucide-react'

const REPORTS = [
  { id: 'sales', title: 'Sales Report', desc: 'Revenue, orders, and sales trends over time', icon: DollarSign, color: 'var(--pink)' },
  { id: 'inventory', title: 'Inventory Report', desc: 'Stock levels, low-stock alerts, and product movement', icon: Package, color: 'var(--cyan)' },
  { id: 'customers', title: 'Customer Report', desc: 'Customer acquisition, retention, and lifetime value', icon: Users, color: '#A855F7' },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<Record<string, { from: string; to: string }>>({})

  const handleGenerate = (reportId: string) => {
    const range = dateRange[reportId]
    alert(`Generating ${reportId} report${range?.from ? ` from ${range.from} to ${range.to}` : ''}... (Download placeholder)`)
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-[var(--text-muted)]">Generate and download business reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: '$12,450', icon: DollarSign, change: '+18%' },
          { label: 'Total Orders', value: '84', icon: FileText, change: '+12%' },
          { label: 'Avg Order Value', value: '$148', icon: Calendar, change: '+5%' },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className="text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-green-400">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${r.color}20` }}>
                <r.icon size={20} style={{ color: r.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{r.desc}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateRange[r.id]?.from || ''} onChange={e => setDateRange(p => ({ ...p, [r.id]: { ...p[r.id], from: e.target.value, to: p[r.id]?.to || '' } }))} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-white focus:border-[var(--pink)] focus:outline-none [color-scheme:dark]" />
                <input type="date" value={dateRange[r.id]?.to || ''} onChange={e => setDateRange(p => ({ ...p, [r.id]: { ...p[r.id], to: e.target.value, from: p[r.id]?.from || '' } }))} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-white focus:border-[var(--pink)] focus:outline-none [color-scheme:dark]" />
              </div>
              <button onClick={() => handleGenerate(r.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-white text-sm font-medium hover:bg-white/10 transition">
                <Download size={14} /> Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
