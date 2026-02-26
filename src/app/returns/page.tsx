'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, CheckCircle, Droplets, ArrowLeft, Mail } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_EMAIL, BUSINESS_INSTAGRAM } from '@/lib/constants'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-pink/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-pink" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">All Sales Are Final</h1>
                  <p className="text-sm text-text-muted">Return & Refund Policy</p>
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed">
                At MixzoKickz, all sales are final. We stand behind every pair we sell with our
                authenticity guarantee and provide detailed photos and descriptions so you can shop
                with confidence.
              </p>
            </div>

            {/* Authentication Guarantee */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Our Authenticity Guarantee
              </h2>
              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                <p>
                  Every sneaker listed on MixzoKickz has been carefully inspected and verified for
                  authenticity. We check materials, stitching, tags, boxes, and every detail that matters.
                  If we made a mistake and a pair turns out to be inauthentic, we will issue a full refund
                  — no questions asked.
                </p>
                <p>
                  Preowned items include multiple detailed photos and honest condition descriptions.
                  What you see is what you get.
                </p>
              </div>
            </div>

            {/* Exception: Damaged in Transit */}
            <div className="bg-card border border-pink/20 rounded-2xl p-8 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Exception: Damaged in Transit
              </h2>
              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                <p>
                  If your order arrives damaged due to shipping or you receive an item that is significantly
                  different from the listing description, you must contact us <strong className="text-white">within 48 hours of delivery</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Take clear photos of the damage or discrepancy</li>
                  <li>Email us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-pink hover:underline">{BUSINESS_EMAIL}</a></li>
                  <li>Include your order number and description of the issue</li>
                  <li>We will review your claim and work to resolve it promptly</li>
                </ul>
                <p className="text-text-muted italic">
                  Claims submitted after 48 hours may not be eligible for resolution.
                </p>
              </div>
            </div>

            {/* Cleaning Service Guarantee */}
            <div className="bg-card border border-[#00C2D6]/20 rounded-2xl p-8 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-[#00C2D6]" />
                Cleaning Service: Satisfaction Guarantee
              </h2>
              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                <p>
                  Our sneaker cleaning and restoration service comes with a satisfaction guarantee.
                  If you&apos;re not satisfied with the results of your cleaning, contact us within 7 days
                  of receiving your sneakers back and we&apos;ll work with you to make it right — whether
                  that means a re-clean or a partial refund on the service.
                </p>
                <p>
                  Please note: this applies to the cleaning service only and does not cover pre-existing
                  damage, material limitations, or wear that cannot be reversed.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-elevated border border-border rounded-2xl p-6 text-center">
              <Mail className="w-6 h-6 text-pink mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Questions About Our Policy?</h3>
              <p className="text-sm text-text-secondary">
                Email us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-pink hover:underline">{BUSINESS_EMAIL}</a> or
                DM us on Instagram <a href="https://instagram.com/mixzo.kickz" target="_blank" rel="noopener noreferrer" className="text-pink hover:underline">{BUSINESS_INSTAGRAM}</a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
