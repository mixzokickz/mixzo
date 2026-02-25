'use client'

import { useState } from 'react'
import { Link2, Plus, Copy, X, ExternalLink, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface PaymentLink { id: string; amount: number; note: string; status: 'active' | 'paid' | 'expired'; url: string; created: string }

const MOCK: PaymentLink[] = [
  { id: 'pl_1', amount: 250, note: 'Custom Jordan 4 order', status: 'active', url: 'https://mixzo.store/pay/pl_1', created: '2026-02-22' },
  { id: 'pl_2', amount: 180, note: 'Yeezy 350 hold deposit', status: 'paid', url: 'https://mixzo.store/pay/pl_2', created: '2026-02-19' },
]

const statusStyle: Record<string, string> = {
  active: 'text-[var(--cyan)] bg-[var(--cyan)]/10',
  paid: 'text-green-400 bg-green-500/10',
  expired: 'text-[var(--text-muted)] bg-white/5',
}

export default function PaymentLinksPage() {
  const [links] = useState<PaymentLink[]>(MOCK)
  const [showCreate, setShowCreate] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Links</h1>
          <p className="text-sm text-[var(--text-muted)]">{links.length} links created</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">
          {showCreate ? <X size={16} /> : <Plus size={16} />} {showCreate ? 'Cancel' : 'Create Link'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Payment Link</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="number" placeholder="Amount ($)" className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
            <input placeholder="Note (e.g. Custom order for John)" className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[var(--pink)] text-white text-sm font-medium hover:opacity-90 transition">Generate Link</button>
        </div>
      )}

      {links.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Link2 size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No payment links</h2>
          <p className="text-sm text-[var(--text-secondary)]">Create links for custom payments</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map(l => (
            <div key={l.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-[var(--pink)]/10"><Link2 size={18} className="text-[var(--pink)]" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{formatPrice(l.amount)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{l.note}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[l.status]}`}>{l.status}</span>
                <span className="text-xs text-[var(--text-muted)] hidden sm:block">{l.created}</span>
                <button onClick={() => copyUrl(l.id, l.url)} className="p-1.5 rounded-lg hover:bg-white/5 transition" title="Copy link">
                  {copied === l.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-[var(--text-muted)]" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
