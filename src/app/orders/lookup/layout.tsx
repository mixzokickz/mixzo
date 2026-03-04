import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track Your Order — MixzoKickz. Premium sneakers and cleaning, Denver CO.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
