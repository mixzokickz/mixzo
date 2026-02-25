'use client'

import Link from 'next/link'
import { ShoppingBag, Instagram, ArrowRight } from 'lucide-react'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text tracking-tight">MIXZO</h1>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)] text-sm mb-8">
            <ShoppingBag className="w-4 h-4" />
            Free shipping over ${FREE_SHIPPING_THRESHOLD}
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">MIXZO</span>
            <span className="block text-white mt-2">KICKZ</span>
          </h2>
          
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg mx-auto">
            New and preowned sneakers. Authenticated. Denver, CO.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl border border-[var(--border)] text-white font-semibold flex items-center justify-center gap-2 hover:border-[var(--border-light)] transition-colors"
            >
              <Instagram className="w-4 h-4" /> Follow Us
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-sm text-[var(--text-muted)]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} MixzoKickz</span>
          <span className="hidden sm:inline">|</span>
          <a href={`tel:${BUSINESS_PHONE}`} className="hover:text-[var(--text-secondary)] transition-colors">{BUSINESS_PHONE}</a>
          <span className="hidden sm:inline">|</span>
          <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-[var(--text-secondary)] transition-colors">{BUSINESS_EMAIL}</a>
        </div>
      </footer>
    </div>
  )
}
