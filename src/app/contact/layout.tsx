import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with MixzoKickz. Questions about orders, cleaning service, or authentication? We\'re here to help.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
