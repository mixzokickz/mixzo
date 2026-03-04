import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Wishlist',
  description: 'Your Wishlist — MixzoKickz. Premium sneakers and cleaning, Denver CO.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
