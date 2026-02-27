'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, User, Menu, X, Instagram, Sparkles } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { cn } from '@/lib/utils'
import { SearchOverlay } from '@/components/shop/search-overlay'
import { BUSINESS_INSTAGRAM } from '@/lib/constants'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/deals', label: 'Deals' },
  { href: '/cleaning', label: 'Cleaning' },
  { href: '/about', label: 'About' },
]

export function ShopHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const count = useCartStore((s) => s.getCount())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
        scrolled
          ? 'bg-[#0C0C0C]/90 backdrop-blur-xl border-b border-[#1E1E26]/60 shadow-xl shadow-black/20 shadow-[#FF2E88]/[0.03]'
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 h-16 md:h-20 grid grid-cols-[auto_1fr_auto] items-center">
          {/* Logo — hard left */}
          <Link href="/" className="group flex items-center justify-self-start relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#FF2E88]/20 to-[#00C2D6]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center leading-none">
              <span className="text-2xl md:text-3xl font-black tracking-[-0.02em] italic bg-gradient-to-r from-[#FF2E88] via-[#FF5C9A] to-[#00C2D6] bg-clip-text text-transparent">
                MIXZO
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="w-4 md:w-5 h-[2px] bg-gradient-to-r from-[#FF2E88] to-[#FF2E88]/60" />
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.35em] text-[#A0A0B8] group-hover:text-white transition-colors duration-300">
                  KICKZ
                </span>
                <span className="w-4 md:w-5 h-[2px] bg-gradient-to-l from-[#00C2D6] to-[#00C2D6]/60" />
              </div>
            </div>
          </Link>

          {/* Desktop Nav — true center */}
          <nav className="hidden md:flex items-center justify-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-[#A0A0B8] hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#FF2E88] rounded-full transition-all duration-300 group-hover:w-6" />
              </Link>
            ))}
          </nav>
          {/* Empty spacer for mobile when nav is hidden */}
          <div className="md:hidden" />

          {/* Actions — right */}
          <div className="flex items-center gap-0.5 justify-self-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-[#A0A0B8] hover:text-white hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <a
              href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#A0A0B8] hover:text-[#FF2E88] hover:bg-[#FF2E88]/[0.06] transition-all duration-300"
            >
              <Instagram className="w-[18px] h-[18px]" />
            </a>
            <Link
              href="/cart"
              className="relative h-10 w-10 flex items-center justify-center rounded-xl text-[#A0A0B8] hover:text-white hover:bg-white/[0.04] transition-all duration-300"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[1.25rem] flex items-center justify-center rounded-full bg-[#FF2E88] text-[10px] font-bold text-white px-1 shadow-lg shadow-[#FF2E88]/30 animate-in zoom-in duration-200">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl text-[#A0A0B8] hover:text-white hover:bg-white/[0.04] transition-all duration-300"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl text-[#A0A0B8] hover:text-white cursor-pointer transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-[#0C0C0C]/98 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col p-6 gap-1">
            {[...NAV_LINKS, { href: '/contact', label: 'Contact' }, { href: '/account', label: 'Account' }].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-4 px-5 text-xl font-bold text-[#A0A0B8] hover:text-white hover:bg-white/[0.03] rounded-2xl transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-8 left-6 right-6">
            <div className="glow-line mb-4" />
            <p className="text-[11px] text-[#4A4A5A] text-center">Denver, CO · Authenticated Sneakers</p>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
