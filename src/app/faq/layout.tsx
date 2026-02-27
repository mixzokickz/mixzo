import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about MixzoKickz — shipping, returns, authenticity, cleaning service, and more.',
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
