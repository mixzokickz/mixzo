import Link from 'next/link'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0C0C0C]">
      <ShopHeader />
      <main className="flex-1 pt-24 flex flex-col items-center justify-center text-center px-6">
        <div className="text-8xl mb-6">👟</div>
        <h1 className="text-4xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-[#6A6A80] mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Link href="/shop" className="bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Shop Now
          </Link>
          <Link href="/" className="bg-[#1A1A22] hover:bg-[#1E1E26] text-white font-semibold px-6 py-3 rounded-xl border border-[#1E1E26] transition-colors">
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
