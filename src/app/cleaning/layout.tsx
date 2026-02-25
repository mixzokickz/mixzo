import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sneaker Cleaning Service | Mixzo Kickz',
  description: 'Professional sneaker cleaning in Denver. Cleaning $20, Cleaning + Icing $30. Drop off or ship your kicks.',
  openGraph: { title: 'Sneaker Cleaning | Mixzo Kickz', description: 'Professional sneaker cleaning from $20.' },
}

export default function CleaningLayout({ children }: { children: React.ReactNode }) {
  return children
}
