'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, Ban, Phone, Mail, Instagram } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM } from '@/lib/constants'

const TRUST = [
  { icon: Shield, title: 'Authenticated', desc: 'Every pair is hand-inspected and verified for authenticity before it reaches you.' },
  { icon: Truck, title: 'Fast Shipping', desc: 'Orders ship within 1–2 business days. Free shipping on orders over $200.' },
  { icon: Ban, title: 'All Sales Final', desc: 'We stand behind every product. All sales are final — inspect your pair with confidence.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      <main className="flex-1 pt-24 md:pt-28 px-4 pb-mobile-nav">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              About <span className="gradient-text">MixzoKickz</span>
            </h1>
            <p className="mt-6 text-text-secondary leading-relaxed text-lg">
              Based in Denver, Colorado, Mixzo is your trusted source for new and preowned sneakers.
              We believe everyone deserves access to authentic heat — whether it&apos;s a fresh-out-the-box
              pair or a clean preowned find at a fair price.
            </p>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Every sneaker we sell is hand-inspected for authenticity and quality. No fakes, no games.
              Just verified kicks shipped fast from our Denver operation.
            </p>
          </motion.div>

          {/* Trust signals */}
          <div className="mt-16 grid gap-6">
            {TRUST.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink/10 to-cyan/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{item.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <a href={`tel:${BUSINESS_PHONE}`} className="flex items-center gap-3 text-text-secondary hover:text-text transition-colors">
                <Phone className="w-4 h-4 text-pink shrink-0" />
                <span className="text-sm">{BUSINESS_PHONE}</span>
              </a>
              <a href={`mailto:${BUSINESS_EMAIL}`} className="flex items-center gap-3 text-text-secondary hover:text-text transition-colors">
                <Mail className="w-4 h-4 text-pink shrink-0" />
                <span className="text-sm">{BUSINESS_EMAIL}</span>
              </a>
              <a
                href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-secondary hover:text-pink transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink shrink-0" />
                <span className="text-sm">{BUSINESS_INSTAGRAM}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
