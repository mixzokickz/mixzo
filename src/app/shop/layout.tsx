import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Sneakers | Mixzo Kickz',
  description: 'Browse authenticated new and preowned sneakers from Denver, CO. Every pair verified.',
  openGraph: { title: 'Shop Sneakers | Mixzo Kickz', description: 'Authenticated sneakers, fair prices.' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
