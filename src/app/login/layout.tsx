import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign In — MixzoKickz. Premium sneakers and cleaning, Denver CO.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
