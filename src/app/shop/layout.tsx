import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse authenticated new and preowned sneakers. Nike, Jordan, Adidas, Yeezy, New Balance and more. Based in Denver, CO.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
