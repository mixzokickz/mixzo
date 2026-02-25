'use client'

import Link from 'next/link'
import { ArrowRight, Send, MessageSquare, Package, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const STEPS = [
  { icon: Send, label: 'Submit', desc: 'Tell us about your kicks and what they need' },
  { icon: MessageSquare, label: 'Quote', desc: 'We\'ll send you a price and timeline' },
  { icon: Package, label: 'Ship', desc: 'Send your sneakers to us (or drop off in Denver)' },
  { icon: Sparkles, label: 'Clean', desc: 'Our team works their magic on your kicks' },
  { icon: RotateCcw, label: 'Return', desc: 'Get your fresh kicks back, looking brand new' },
]

const TIERS = [
  {
    name: 'Basic Clean',
    price: '$25',
    features: ['Exterior wipe down', 'Lace cleaning', 'Deodorize treatment', 'Quick turnaround'],
    popular: false,
  },
  {
    name: 'Deep Clean',
    price: '$45',
    features: ['Full disassembly', 'Sole cleaning & whitening', 'Deep scrub all surfaces', 'Lace replacement (if needed)', 'Deodorize & sanitize'],
    popular: true,
  },
  {
    name: 'Full Restoration',
    price: '$75+',
    features: ['Everything in Deep Clean', 'Color touch-up & repainting', 'Sole swap (if needed)', 'Stain removal treatment', 'Complete rehab'],
    popular: false,
  },
]

const FAQS = [
  {
    q: 'How long does the cleaning process take?',
    a: 'Basic cleans take 2-3 business days. Deep cleans take 3-5 days. Full restorations can take 1-2 weeks depending on the work needed.',
  },
  {
    q: 'Can I drop off my sneakers in person?',
    a: 'Yes! We\'re based in Denver, CO and accept local drop-offs. Contact us to arrange a time.',
  },
  {
    q: 'What if my sneakers can\'t be restored?',
    a: 'We\'ll always be upfront with you. If we don\'t think we can improve them significantly, we\'ll let you know before starting any work.',
  },
  {
    q: 'Do you clean all brands?',
    a: 'Yes — Nike, Jordan, Adidas, Yeezy, New Balance, and more. We work with all sneaker brands and materials.',
  },
  {
    q: 'How do I ship my sneakers to you?',
    a: 'After you submit a request, we\'ll send you a prepaid shipping label. Just box them up and drop them off at any carrier location.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-medium text-text group-hover:text-pink transition-colors pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-5 text-sm text-text-secondary leading-relaxed -mt-1">{a}</p>
      )}
    </div>
  )
}

export default function CleaningPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      <main className="flex-1 pt-24 pb-24 pb-mobile-nav px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <p className="text-sm text-pink font-medium uppercase tracking-wider mb-4">Sneaker Cleaning Service</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Give Your Kicks
              <br />
              <span className="text-pink">New Life</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Professional sneaker cleaning and restoration from Denver, CO. From a quick refresh to a complete rehab — we bring your kicks back to life.
            </p>
            <div className="mt-8">
              <Link href="/contact">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {STEPS.map(({ icon: Icon, label, desc }, i) => (
                <div key={label} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:border-pink/40 hover:shadow-lg hover:shadow-pink/10">
                    <Icon className="w-6 h-6 text-pink" />
                  </div>
                  <div className="text-xs text-text-muted mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-sm mb-1">{label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Pricing */}
          <motion.section
            id="pricing"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Service Tiers</h2>
            <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">
              Choose the level of care your kicks need. Not sure? We&apos;ll help you decide after seeing them.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl bg-card border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    tier.popular
                      ? 'border-pink/50 shadow-lg shadow-pink/10 relative'
                      : 'border-border hover:border-pink/30 hover:shadow-pink/5'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-pink text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">{tier.name}</h3>
                  <p className="text-3xl font-black text-pink mb-6">{tier.price}</p>
                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Sparkles className="w-4 h-4 text-pink shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="block mt-8">
                    <Button variant={tier.popular ? 'primary' : 'outline'} className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Before/After placeholder */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">The Results Speak</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="aspect-square bg-elevated flex items-center justify-center border-r border-border">
                      <div className="text-center">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Before</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-elevated flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-pink font-medium uppercase tracking-wider">After</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm font-medium">Coming Soon</p>
                    <p className="text-xs text-text-muted">Before &amp; after photos</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            id="faq"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-border p-6 md:p-8">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </motion.section>

          {/* Bottom CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Refresh Your Kicks?</h2>
            <p className="text-text-secondary mb-8">Get in touch and we&apos;ll take care of the rest.</p>
            <Link href="/contact">
              <Button size="lg">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
