'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
        scrolled
          ? 'glass border-b border-border/50 shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="gradient-text text-2xl font-black tracking-[-0.04em] hover:opacity-80 transition-opacity">
            MIXZO
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors relative',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-text'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                {link.label}
                {(pathname === link.href || pathname.startsWith(link.href + '/')) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-pink to-cyan rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
          {/* Empty spacer for mobile when nav is hidden */}
          <div className="md:hidden" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <Link
              href="/cart"
              className="relative h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-white/5 transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white px-1"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Link
              href="/login"
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-white/5 transition-all"
              aria-label="Account"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 md:hidden"
          >
            <div className="absolute inset-0 bg-bg/95 backdrop-blur-xl" />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-card/90 backdrop-blur-xl border-l border-border pt-20 px-6"
            >
              <div className="flex flex-col gap-1">
                {[...NAV_LINKS, { href: '/login', label: 'Account' }].map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block py-3.5 px-4 text-lg font-medium rounded-xl transition-all',
                        pathname === link.href
                          ? 'text-text bg-white/5'
                          : 'text-text-secondary hover:text-text hover:bg-white/5'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
