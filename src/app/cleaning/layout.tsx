import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sneaker Cleaning Service',
  description: 'Professional sneaker cleaning and sole icing. Starting at $20. Ship your kicks to us or drop off in Denver, CO.',
}

export default function CleaningLayout({ children }: { children: React.ReactNode }) {
  return children
}
