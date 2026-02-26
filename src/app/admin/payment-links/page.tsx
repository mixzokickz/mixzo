'use client'

import { Link2, CreditCard, ExternalLink, Zap, Shield, Copy, Plus, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PaymentLinksPage() {
  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payment Links</h1>
          <p className="text-sm text-[var(--text-muted)]">Send customers a link to pay for custom orders, deposits, or holds</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:bg-[#FF2E88]/90 transition-all shadow-lg shadow-[#FF2E88]/20 opacity-50 cursor-not-allowed" disabled>
          <Plus size={16} /> Create Link
        </button>
      </div>

      {/* Connect Stripe CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-10 text-center relative overflow-hidden"
      >
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2E88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C2D6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF2E88]/15 to-[#00C2D6]/15 border border-[#FF2E88]/20 flex items-center justify-center mx-auto mb-6">
            <Link2 size={32} className="text-[#FF2E88]" />
          </div>

          <h2 className="text-xl font-black text-white mb-3">Connect Stripe to Get Started</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
            Payment links let you create a unique URL for any amount. Send it via text or DM — they click, pay with card, and you get notified instantly.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {[
              { icon: Zap, label: 'Instant', desc: 'Create links in seconds', color: '#00C2D6' },
              { icon: Shield, label: 'Secure', desc: 'Stripe-powered payments', color: '#FF2E88' },
              { icon: DollarSign, label: 'Flexible', desc: 'Any amount, any purpose', color: '#10B981' },
            ].map(f => (
              <div key={f.label} className="text-center p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${f.color}10` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <p className="text-xs font-bold text-white">{f.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Use cases */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {['Custom Orders', 'Deposits', 'Layaways', 'Hold Fees'].map(tag => (
              <span key={tag} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                {tag}
              </span>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[#00C2D6]/30 text-sm text-[#00C2D6] font-bold hover:bg-[#00C2D6]/10 hover:border-[#00C2D6]/50 transition-all duration-300">
            <CreditCard size={16} /> Connect Stripe in Settings
          </button>
        </div>
      </motion.div>
    </div>
  )
}
