'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { cn } from '@/lib/utils'
import { BUSINESS_EMAIL, BUSINESS_INSTAGRAM } from '@/lib/constants'

const FAQS = [
  {
    q: 'Are all your sneakers authentic?',
    a: 'Absolutely. Every single pair is carefully inspected and verified for authenticity before listing. We stake our reputation on it — no fakes, no exceptions. If a pair doesn\'t pass our authentication process, it never makes it to the site.',
  },
  {
    q: 'What does "Preowned" mean?',
    a: 'Preowned sneakers have been previously worn but are still in great condition. Each listing includes detailed photos and an honest condition description so you know exactly what you\'re getting. We also offer a "Like New" designation for pairs with minimal wear.',
  },
  {
    q: 'What is your return policy?',
    a: 'All sales are final. We provide detailed photos, honest descriptions, and multiple angles of every product so you can make an informed purchase. If you receive an item that is significantly different from the listing or damaged in transit, contact us within 48 hours with photos and we\'ll make it right.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Orders are processed within 1–2 business days. Standard shipping typically takes 5–7 business days within the United States. Orders over $200 qualify for free shipping — no code needed.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently, we only ship within the United States. International shipping may be available in the future — follow us on Instagram for updates.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status anytime on our Order Lookup page by entering your order number and email address.',
  },
  {
    q: 'What is your sneaker cleaning service?',
    a: 'We offer professional sneaker cleaning and restoration services at three tiers: Basic Clean ($25) for exterior wipe and deodorize, Deep Clean ($45) for full disassembly and deep scrub, and Full Restoration ($75) for color touch-ups, sole restoration, and complete rehab. Ship your kicks to us and we\'ll ship them back looking brand new.',
  },
  {
    q: 'How does the cleaning service shipping work?',
    a: 'You pay to ship your sneakers to us. Once the cleaning or restoration is complete, we cover the return shipping cost. We\'ll provide our shipping address after you submit a cleaning request.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and digital wallets through our secure payment system. All transactions are encrypted and processed securely.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'Orders can be cancelled within 1 hour of placement if they haven\'t been processed yet. Once an order enters processing, it cannot be cancelled or modified. Contact us immediately if you need to make changes.',
  },
  {
    q: 'Do you have a physical store?',
    a: 'We\'re based in Denver, Colorado and primarily operate online. Local pickups may be arranged — reach out to us on Instagram or by phone to coordinate.',
  },
  {
    q: 'How do I create an account?',
    a: 'Click "Sign Up" at the top of the page and enter your email and a password. Having an account lets you track orders, save items to your wishlist, and check out faster. Account creation is free and only takes a minute.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-pink/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-pink" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-text-muted">Everything you need to know about shopping with Mixzo Kickz.</p>
          </motion.div>

          <div className="divide-y divide-border">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                >
                  <span className="text-sm font-semibold pr-4 group-hover:text-pink transition-colors">{faq.q}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-text-muted shrink-0 transition-transform duration-200',
                    open === i && 'rotate-180 text-pink'
                  )} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-text-secondary leading-relaxed pb-5">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-card border border-border rounded-2xl p-8 text-center"
          >
            <h3 className="text-lg font-bold mb-2">Still Have Questions?</h3>
            <p className="text-sm text-text-secondary mb-4">
              Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll get back to you ASAP.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`mailto:${BUSINESS_EMAIL}`} className="text-sm text-pink hover:underline">{BUSINESS_EMAIL}</a>
              <span className="text-text-muted">•</span>
              <a href="https://instagram.com/mixzo.Kickz" target="_blank" rel="noopener noreferrer" className="text-sm text-pink hover:underline">{BUSINESS_INSTAGRAM}</a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
