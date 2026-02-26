import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your shopping cart at MixzoKickz.',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
