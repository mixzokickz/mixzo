import Link from 'next/link'
import { Home, Store } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[8rem] sm:text-[10rem] font-black leading-none gradient-text tracking-tight">404</h1>
      <h2 className="text-xl font-semibold mt-2 mb-2">Page Not Found</h2>
      <p className="text-text-muted max-w-sm mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="h-12 px-7 rounded-2xl bg-gradient-to-r from-pink to-cyan text-white font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link href="/shop" className="h-12 px-7 rounded-2xl bg-white/5 border border-white/10 text-text font-semibold inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
          <Store className="w-4 h-4" /> Shop
        </Link>
      </div>
    </div>
  )
}
