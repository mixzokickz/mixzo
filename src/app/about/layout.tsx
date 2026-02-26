import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Mixzo Kickz — Denver\'s trusted source for authenticated sneakers and professional cleaning. Learn our story.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
