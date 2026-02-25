'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { cn } from '@/lib/utils'
import { SearchOverlay } from '@/components/shop/search-overlay'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/drops', label: 'Drops' },
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
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'glass border-b border-border shadow-lg shadow-black/20' : 'bg-[#0C0C0C]/80 backdrop-blur-md'
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight text-text hover:text-pink transition-colors">
            MIXZO
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-elevated transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-elevated transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[1.25rem] flex items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white px-1">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/login" className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-elevated transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text cursor-pointer">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-bg/95 backdrop-blur-lg md:hidden">
          <nav className="flex flex-col p-6 gap-2">
            {[...NAV_LINKS, { href: '/contact', label: 'Contact' }, { href: '/account', label: 'Account' }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 text-lg font-medium text-text-secondary hover:text-text hover:bg-elevated rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
