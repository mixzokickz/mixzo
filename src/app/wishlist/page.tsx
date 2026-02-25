'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-8">Wishlist</h1>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-text-muted mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-text-muted mb-6">Save your favorite kicks for later.</p>
            <Link href="/shop"><Button>Browse Collection</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
