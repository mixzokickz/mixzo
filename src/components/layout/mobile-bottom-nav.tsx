'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Sparkles, Store, User } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shop', icon: Store, label: 'Shop' },
  { href: '/cleaning', icon: Sparkles, label: 'Clean' },
  { href: '/cart', icon: ShoppingBag, label: 'Cart' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.getCount())

  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0C0C0C]/90 backdrop-blur-xl border-t border-[#1E1E26]/60">
        <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
          {links.map(({ href, icon: Icon, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-300',
                  active ? 'text-[#FF2E88]' : 'text-[#4A4A5A]'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5 transition-transform duration-300', active && 'scale-110')} />
                  {label === 'Cart' && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-[#FF2E88] text-[9px] font-bold text-white px-0.5 shadow-lg shadow-[#FF2E88]/30">
                      {count}
                    </span>
                  )}
                </div>
                <span className={cn('text-[10px] font-medium', active && 'text-[#FF2E88] font-semibold')}>{label}</span>
                {active && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[#FF2E88]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
