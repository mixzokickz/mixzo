'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ScanBarcode, Package, ShoppingCart,
  Users, Flame, BarChart3, Settings, Menu, X, LogOut,
  Tag, FileText, Truck, Bell, Star, DollarSign,
  RefreshCw, Gift, CreditCard, UserCog, Scale,
  Activity, HelpCircle, Boxes, TrendingUp, Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/scan', label: 'Scan Product', icon: ScanBarcode },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/admin/products', label: 'All Products', icon: Package },
      { href: '/admin/products/new', label: 'Add Product', icon: Boxes },
      { href: '/admin/inventory', label: 'Inventory', icon: Scale },
      { href: '/admin/price-sync', label: 'Price Sync', icon: RefreshCw },
    ],
  },
  {
    label: 'Orders',
    items: [
      { href: '/admin/orders', label: 'All Orders', icon: ShoppingCart },
      { href: '/admin/orders/new', label: 'Create Order', icon: FileText },
      { href: '/admin/shipping', label: 'Shipping', icon: Truck },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/admin/customers', label: 'All Customers', icon: Users },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/daily-deals', label: 'Daily Deals', icon: Flame },
      { href: '/admin/discounts', label: 'Discounts', icon: Tag },
      { href: '/admin/gift-cards', label: 'Gift Cards', icon: Gift },
      { href: '/admin/payment-links', label: 'Payment Links', icon: LinkIcon },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/reports', label: 'Reports', icon: TrendingUp },
      { href: '/admin/purchases', label: 'Purchases', icon: DollarSign },
      { href: '/admin/reconciliation', label: 'Reconciliation', icon: CreditCard },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/admin/settings', label: 'Store Settings', icon: Settings },
      { href: '/admin/staff', label: 'Staff', icon: UserCog },
      { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
      { href: '/admin/help', label: 'Help', icon: HelpCircle },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2 space-y-5 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              {section.label}
            </p>
            <nav className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                      active
                        ? 'text-white bg-white/5'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.03]'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[var(--pink)] to-[var(--cyan)]" />
                    )}
                    <Icon size={18} className={active ? 'text-[var(--pink)]' : ''} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <Link href="/admin" className="gradient-text text-lg font-bold tracking-tight">{SITE_NAME}</Link>
        <button onClick={() => setOpen(!open)} className="text-white p-2 -mr-2">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[var(--bg-card)] border-r border-[var(--border)] pt-14 flex flex-col transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col z-40">
        <div className="p-4 pb-2 border-b border-[var(--border)]">
          <Link href="/admin" className="gradient-text text-xl font-bold tracking-tight">{SITE_NAME}</Link>
          <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Admin Panel</p>
        </div>
        {navContent}
      </aside>
    </>
  )
}
