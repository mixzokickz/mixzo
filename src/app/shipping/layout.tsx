import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Information',
  description: 'MixzoKickz shipping details — processing times, free shipping on orders over $200, tracking, and cleaning service shipping.',
}

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children
}
