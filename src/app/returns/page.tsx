'use client'

import Link from 'next/link'
import { ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-[var(--pink)]" />
            <h1 className="text-2xl font-bold">All Sales Are Final</h1>
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            At MixzoKickz, all sales are final. We stand behind every pair we sell with our authenticity guarantee.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[var(--blue)] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">100% Authenticity Guaranteed</h3>
                <p className="text-sm text-[var(--text-secondary)]">Every sneaker is verified authentic before listing. If we made a mistake, we make it right.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[var(--blue)] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Accurate Descriptions</h3>
                <p className="text-sm text-[var(--text-secondary)]">Preowned items include detailed photos and honest condition descriptions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[var(--blue)] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Wrong Item or Damage?</h3>
                <p className="text-sm text-[var(--text-secondary)]">If you receive the wrong item or it arrives damaged due to our error, contact us and we will resolve it.</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold mb-2">Questions?</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Email us at <a href="mailto:Mixzo.kickz@gmail.com" className="text-[var(--pink)] hover:underline">Mixzo.kickz@gmail.com</a> or
              DM us on Instagram <a href="https://instagram.com/mixzo.Kickz" target="_blank" rel="noopener noreferrer" className="text-[var(--pink)] hover:underline">@mixzo.Kickz</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
