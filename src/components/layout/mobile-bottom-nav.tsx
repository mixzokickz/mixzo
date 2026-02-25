'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Store, User } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shop', icon: Store, label: 'Shop' },
  { href: '/cart', icon: ShoppingBag, label: 'Cart' },
  { href: '/login', icon: User, label: 'Account' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.getCount())

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border">
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
                active ? 'text-pink' : 'text-text-muted'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {label === 'Cart' && count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-pink text-[9px] font-bold text-white px-0.5">
                    {count}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active && 'gradient-text')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
