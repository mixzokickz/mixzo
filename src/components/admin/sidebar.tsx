'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ScanBarcode, Package, ShoppingCart,
  Users, Flame, BarChart3, Settings, Menu, X, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/scan', label: 'Scan', icon: ScanBarcode },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/daily-deals', label: 'Daily Deals', icon: Flame },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const nav = (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            isActive(href)
              ? 'btn-gradient text-white glow-gradient'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
          )}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <span className="gradient-text text-lg font-bold">{SITE_NAME}</span>
        <button onClick={() => setOpen(!open)} className="text-white p-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border)] p-4 pt-16 flex flex-col transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-[var(--bg-card)] border-r border-[var(--border)] p-4 flex-col z-40">
        <div className="mb-6 px-4">
          <span className="gradient-text text-xl font-bold">{SITE_NAME}</span>
          <p className="text-[var(--text-muted)] text-xs mt-1">Admin Panel</p>
        </div>
        {nav}
      </aside>
    </>
  )
}
