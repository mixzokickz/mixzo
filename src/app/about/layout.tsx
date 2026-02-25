import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Mixzo Kickz',
  description: 'Denver-based sneaker store. Authenticated new and preowned kicks, fair prices, trusted pairs.',
  openGraph: { title: 'About Mixzo Kickz', description: 'Denver\'s source for authenticated sneakers.' },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
