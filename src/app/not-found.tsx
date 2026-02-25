import Link from 'next/link'
import { Home, ShoppingBag, Sparkles, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[160px] font-black leading-none bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] bg-clip-text text-transparent select-none">
        404
      </div>
      <h2 className="text-2xl font-bold text-white mt-2 mb-3">Page Not Found</h2>
      <p className="text-[var(--text-secondary)] max-w-md mb-10">
        Looks like this page got lost in the sauce. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white font-semibold px-6 py-3 rounded-xl text-sm">
          <Home size={16} /> Go Home
        </Link>
        <Link href="/shop" className="inline-flex items-center gap-2 border border-[var(--border)] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">
          <ShoppingBag size={16} /> Shop Kicks
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/cleaning" className="text-[var(--text-secondary)] hover:text-[var(--pink)] transition-colors flex items-center gap-1">
          <Sparkles size={14} /> Cleaning Service
        </Link>
        <Link href="/drops" className="text-[var(--text-secondary)] hover:text-[var(--pink)] transition-colors">
          Drops
        </Link>
        <Link href="/faq" className="text-[var(--text-secondary)] hover:text-[var(--pink)] transition-colors flex items-center gap-1">
          <HelpCircle size={14} /> FAQ
        </Link>
        <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--pink)] transition-colors">
          Contact
        </Link>
      </div>
    </div>
  )
}
