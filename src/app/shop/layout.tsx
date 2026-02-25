'use client'

import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
