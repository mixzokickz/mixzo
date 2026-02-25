'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') || 'N/A'

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-pink flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed</h1>
      <p className="text-text-secondary mb-4">Thank you for your purchase.</p>
      <div className="w-full p-4 rounded-xl bg-card border border-border mb-6">
        <p className="text-sm text-text-muted mb-1">Order ID</p>
        <p className="text-lg font-bold gradient-text">{orderId}</p>
      </div>
      <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-card border border-border mb-8 w-full">
        <Package className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary">
          <p>You will receive an email confirmation shortly with tracking details once your order ships.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/shop"><Button size="lg">Continue Shopping <ArrowRight className="w-4 h-4" /></Button></Link>
        <Link href="/orders/lookup"><Button variant="secondary" size="lg">Track Order</Button></Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4">
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-text-muted">Loading...</div>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
