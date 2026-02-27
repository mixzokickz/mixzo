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
    title: 'Mixzo Kickz — New & Preowned Sneakers',
    description: 'Shop authenticated new and preowned sneakers. Live heat, trusted pairs.',
    type: 'website',
    url: 'https://mixzokickz.com',
    locale: 'en_US',
    siteName: 'Mixzo Kickz',
    url: 'https://mixzokickz.com',
    images: [{ url: 'https://mixzokickz.com/og-image.png', width: 1200, height: 630, alt: 'Mixzo Kickz' }],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://mixzokickz.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
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
