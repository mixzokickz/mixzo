'use client'

import { Gift, Plus, CreditCard, Sparkles, DollarSign, Hash } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GiftCardsPage() {
  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Gift Cards</h1>
          <p className="text-sm text-[var(--text-muted)]">Create and manage store gift cards</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF2E88] text-white text-sm font-bold hover:bg-[#FF2E88]/90 transition-all shadow-lg shadow-[#FF2E88]/20 opacity-50 cursor-not-allowed" disabled>
          <Plus size={16} /> Create Gift Card
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A855F7]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF2E88]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#A855F7]/15 to-[#FF2E88]/15 border border-[#A855F7]/20 flex items-center justify-center mx-auto mb-6">
            <Gift size={32} className="text-[#A855F7]" />
          </div>

          <h2 className="text-xl font-black text-white mb-3">Gift Cards Coming Soon</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
            Let customers buy gift cards for friends and family. Gift cards are stored as balance codes that can be applied at checkout.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            {[
              { icon: DollarSign, label: 'Custom Amounts', desc: '$25 - $500', color: '#10B981' },
              { icon: Hash, label: 'Unique Codes', desc: 'Auto-generated', color: '#A855F7' },
              { icon: Sparkles, label: 'Instant Delivery', desc: 'Email or text', color: '#FF2E88' },
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

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
            <CreditCard size={16} className="text-[#A855F7]" /> Requires Stripe integration
          </div>
        </div>
      </motion.div>
    </div>
  )
}
