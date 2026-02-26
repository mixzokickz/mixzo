import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deals & Drops',
  description: 'Shop limited-time deals and daily drops on authenticated sneakers at Mixzo Kickz.',
}

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children
}
