'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { CartDrawer } from '@/components/shop/cart-drawer'

interface ShopHeaderProps {
  onSearch?: (query: string) => void
}

export function ShopHeader({ onSearch }: ShopHeaderProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const getCount = useCartStore((s) => s.getCount)

  useEffect(() => { setMounted(true) }, [])

  const count = mounted ? getCount() : 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(search)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold gradient-text tracking-tight shrink-0">
              MIXZO
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search sneakers..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    onSearch?.(e.target.value)
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg"
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Link href="/shop" className="hidden sm:block text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                Shop
              </Link>
              <Link href="/login" className="hidden sm:flex p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={() => setCartOpen(true)} className="relative p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[var(--pink)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 text-[var(--text-secondary)] hover:text-white">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="sm:hidden pb-4 space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search sneakers..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      onSearch?.(e.target.value)
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg"
                  />
                </div>
              </form>
              <div className="flex flex-col gap-2">
                <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--text-secondary)] hover:text-white py-1">Shop</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--text-secondary)] hover:text-white py-1">Account</Link>
              </div>
            </div>
          )}
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
