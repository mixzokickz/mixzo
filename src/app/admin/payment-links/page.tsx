'use client'

import { Link2, CreditCard } from 'lucide-react'

export default function PaymentLinksPage() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Links</h1>
        <p className="text-sm text-[var(--text-muted)]">Send customers a link to pay for custom orders, deposits, or holds</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF2E88]/10 flex items-center justify-center mx-auto mb-4">
          <Link2 size={28} className="text-[#FF2E88]" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Stripe Required</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-4">
          Payment links let you create a unique URL for any amount. Send it to a customer via text or DM — they click, pay with card, and you get notified instantly.
        </p>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
          Perfect for custom orders, deposits, layaways, and one-off payments.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
          <CreditCard size={16} /> Connect Stripe in Settings to enable
        </div>
      </div>
    </div>
  )
}
