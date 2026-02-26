import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your shopping cart at Mixzo Kickz.',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
