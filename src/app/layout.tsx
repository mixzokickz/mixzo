import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MixzoKickz — New & Preowned Sneakers',
  description: 'Shop new and preowned sneakers from MixzoKickz. Based in Denver, CO. Free shipping over $200.',
  metadataBase: new URL('https://mixzokickz.com'),
  openGraph: {
    title: 'MixzoKickz — New & Preowned Sneakers',
    description: 'Shop new and preowned sneakers from MixzoKickz. Based in Denver, CO.',
    url: 'https://mixzokickz.com',
    siteName: 'MixzoKickz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MixzoKickz',
    description: 'New & Preowned Sneakers — Denver, CO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  )
}
