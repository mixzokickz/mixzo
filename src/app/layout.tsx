import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Mixzo Kickz — New & Preowned Sneakers | Denver, CO',
    template: '%s | Mixzo Kickz',
  },
  description: 'Shop authenticated new and preowned sneakers at Mixzo Kickz. Premium kicks, fair prices, based in Denver, Colorado.',
  keywords: ['sneakers', 'kicks', 'shoes', 'preowned sneakers', 'new sneakers', 'denver', 'colorado', 'mixzo'],
  authors: [{ name: 'Mixzo Kickz' }],
  openGraph: {
    title: 'Mixzo Kickz — New & Preowned Sneakers',
    description: 'Shop authenticated new and preowned sneakers. Premium kicks, fair prices.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mixzo Kickz',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141418',
              border: '1px solid #1E1E26',
              color: '#F4F4F4',
              fontSize: '14px',
            },
          }}
          closeButton
        />
      </body>
    </html>
  )
}
