'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ScanBarcode, Package, ShoppingCart,
  Users, Flame, BarChart3, Settings, Menu, X, LogOut,
  Tag, FileText, Boxes, Sparkles, Ticket
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/scan', label: 'Scan In', icon: ScanBarcode },
    ],
  },
  {
    label: 'Store',
    items: [
      { href: '/admin/products', label: 'Inventory', icon: Boxes },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/cleaning', label: 'Cleaning', icon: Sparkles },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/daily-deals', label: 'Daily Deals', icon: Flame },
      { href: '/admin/discounts', label: 'Discounts', icon: Tag },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
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
      <div className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">
              {section.label}
            </p>
            <nav className="flex flex-col gap-0.5 px-3">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 relative group',
                      active
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.03]'
                    )}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[#FF2E88] to-[#FF2E88]/60" />
                    )}
                    <Icon size={20} className={cn('transition-colors duration-200', active ? 'text-[var(--pink)]' : 'group-hover:text-[var(--text-primary)]')} />
                    {label}
                    {/* Hover glow */}
                    {!active && (
                      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-white/[0.01] to-transparent" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MixzoKickz" width={32} height={32} className="rounded-md" />
          <span className="text-[var(--text-muted)] text-xs font-medium">Admin</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="text-white p-2 -mr-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-0 z-50 w-full max-w-[320px] bg-[var(--bg-card)] border-r border-[var(--border)] pt-14 flex flex-col"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] flex-col z-40">
        <div className="p-6 pb-4 border-b border-[var(--border)]">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="MixzoKickz" width={40} height={40} className="rounded-lg" />
            <div className="flex flex-col">
              <span className="gradient-text text-lg font-bold tracking-tight leading-tight">MixzoKickz</span>
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Admin Panel</span>
            </div>
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  )
}
