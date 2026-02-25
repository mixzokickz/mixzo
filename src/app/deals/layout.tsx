import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deals | Mixzo Kickz',
  description: 'Discounted sneakers — limited time deals on authenticated kicks from Denver.',
  openGraph: { title: 'Deals | Mixzo Kickz', description: 'Limited time sneaker deals.' },
}

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children
}
