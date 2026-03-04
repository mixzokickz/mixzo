import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MixzoKickz — Premium Sneakers, Denver CO',
    template: '%s | MixzoKickz',
  },
  description: 'Shop authenticated new and preowned sneakers. Professional sneaker cleaning service. Based in Denver, Colorado.',
  keywords: ['sneakers', 'kicks', 'denver', 'preowned sneakers', 'sneaker cleaning', 'authenticated'],
  authors: [{ name: 'MixzoKickz' }],
  openGraph: {
    title: 'MixzoKickz',
    description: 'Premium Kicks, Fair Prices. Denver, CO.',
    type: 'website',
    url: 'https://mixzokickz.com',
    locale: 'en_US',
    siteName: 'MixzoKickz',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MixzoKickz' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MixzoKickz — New & Preowned Sneakers',
    description: 'Shop authenticated new and preowned sneakers. Premium kicks, fair prices.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://mixzokickz.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'MixzoKickz',
              url: 'https://mixzokickz.com',
              logo: 'https://mixzokickz.com/favicon.png',
              description: 'Premium new and preowned sneakers. Professional sneaker cleaning service. Based in Denver, Colorado.',
              telephone: '720-720-5015',
              email: 'Mixzo.kickz@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Denver',
                addressRegion: 'CO',
                addressCountry: 'US',
              },
              sameAs: ['https://instagram.com/mixzo.kickz'],
              priceRange: '$$',
            }),
          }}
        />
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#141418',
              border: '1px solid #1E1E26',
              color: '#F4F4F4',
              fontSize: '14px',
              borderRadius: '12px',
            },
          }}
          closeButton
        />
      </body>
    </html>
  )
}
