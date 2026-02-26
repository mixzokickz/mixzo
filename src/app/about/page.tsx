'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION, BUSINESS_PHONE } from '@/lib/constants'
import {
  MapPin, Mail, Phone, Instagram, Shield, Heart, Sparkles,
  ShoppingBag, Droplets, Truck, CheckCircle, Star, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const TRUST_BADGES = [
  { icon: Shield, title: '100% Authenticated', desc: 'Every pair is inspected and verified for authenticity before it ever reaches you. No fakes, no exceptions.' },
  { icon: MapPin, title: 'Denver-Based', desc: 'Proudly operating out of Denver, Colorado. Local pickups available — supporting the local sneaker community.' },
  { icon: Truck, title: 'Fast Shipping', desc: 'Orders ship within 1–2 business days. Free standard shipping on all orders over $200.' },
  { icon: Star, title: 'Trusted Seller', desc: 'Hundreds of satisfied customers. Check our Instagram for reviews and proof of authenticity on every pair.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF2E88]/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto relative text-center">
          <motion.p
            initial="hidden" animate="visible" custom={0} variants={fadeIn}
            className="text-sm text-pink font-medium uppercase tracking-widest mb-4"
          >
            About Us
          </motion.p>
          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeIn}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight"
          >
            Denver&apos;s Premier
            <br />
            <span className="bg-gradient-to-r from-[#FF2E88] to-[#00C2D6] bg-clip-text text-transparent">
              Sneaker Destination
            </span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeIn}
            className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Connecting sneakerheads with authentic kicks since day one. New releases,
            preowned heat, and professional cleaning — all under one roof.
          </motion.p>
          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeIn}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-card border border-border text-xs text-text-muted"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink" />
            LIVE HEAT. TRUSTED PAIRS.
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                MixzoKickz was born out of a simple belief: everyone deserves access to authentic,
                premium sneakers at fair prices. Based in Denver, Colorado, we&apos;ve built a reputation
                for trust, transparency, and an unmatched selection of new and preowned kicks.
              </p>
              <p>
                Every single pair that passes through our hands is carefully inspected and authenticated.
                We don&apos;t cut corners. Whether it&apos;s a brand-new release or a classic preowned gem,
                you can shop with complete confidence knowing your purchase is 100% legit.
              </p>
              <p>
                But we&apos;re more than just a sneaker shop. We offer a full-service sneaker cleaning
                and restoration service — bringing your worn favorites back to life. From basic cleans
                to complete restorations, we treat every pair like it&apos;s our own.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Two-Column: Sales + Cleaning */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-8 hover:border-pink/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-pink/10 flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7 text-pink" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sneaker Sales</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Shop our curated collection of new and preowned sneakers. Jordans, Nikes, Yeezys,
              New Balance, and more — all authenticated and priced fairly. We restock daily with
              the freshest drops and hardest-to-find pairs.
            </p>
            <ul className="space-y-2 text-sm text-text-secondary mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-pink shrink-0" /> New & preowned options</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-pink shrink-0" /> Every pair authenticated</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-pink shrink-0" /> Free shipping over $200</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-pink shrink-0" /> Daily deals & drops</li>
            </ul>
            <Link href="/shop">
              <Button>
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-8 hover:border-cyan/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00C2D6]/10 flex items-center justify-center mb-6">
              <Droplets className="w-7 h-7 text-[#00C2D6]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sneaker Cleaning Service</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Got a pair that needs some love? Our professional cleaning and restoration service
              will bring your kicks back to life. From basic exterior cleans to full-on sole
              restorations and color touch-ups — we do it all.
            </p>
            <ul className="space-y-2 text-sm text-text-secondary mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00C2D6] shrink-0" /> Sneaker Cleaning — $20</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00C2D6] shrink-0" /> Cleaning + Icing — $30</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00C2D6] shrink-0" /> Ship-in or local drop-off</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00C2D6] shrink-0" /> Satisfaction guaranteed</li>
            </ul>
            <Link href="/cleaning">
              <Button variant="outline">
                Learn More <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">What Sets Us Apart</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Not many sneaker shops offer cleaning and restoration alongside sales.
              We&apos;re a one-stop shop for everything sneakers.
            </p>
          </motion.div>
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <p className="text-text-secondary leading-relaxed mb-4">
              Our cleaning service is what truly makes MixzoKickz unique. While other shops just sell you a pair
              and move on, we&apos;re here for the full lifecycle of your sneakers. Bought a used pair that needs
              freshening up? We got you. Favorite Jordans looking beat? Send them in and we&apos;ll make them look
              brand new.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Whether you&apos;re buying, selling, or restoring — MixzoKickz is your go-to. We&apos;re not just a store,
              we&apos;re a sneaker service built around trust, quality, and the Denver sneaker community.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
          >
            Why Shop With Us
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-pink/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink/10 flex items-center justify-center mx-auto mb-4">
                  <badge.icon className="w-6 h-6 text-pink" />
                </div>
                <h3 className="font-bold mb-2">{badge.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-16 pb-24 pb-mobile-nav">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Have questions? Want to sell your kicks or schedule a cleaning? Reach out — we&apos;d love to hear from you.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-5 h-5 text-pink" />
                <span className="text-sm text-text-secondary">{BUSINESS_LOCATION}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-5 h-5 text-pink" />
                <a href={`tel:${BUSINESS_PHONE}`} className="text-sm text-text-secondary hover:text-pink transition-colors">{BUSINESS_PHONE}</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-5 h-5 text-pink" />
                <a href={`mailto:${BUSINESS_EMAIL}`} className="text-sm text-text-secondary hover:text-pink transition-colors">{BUSINESS_EMAIL}</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Instagram className="w-5 h-5 text-pink" />
                <a href="https://instagram.com/mixzo.kickz" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-pink transition-colors">{BUSINESS_INSTAGRAM}</a>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop"><Button size="lg">Shop Now <ArrowRight className="w-4 h-4" /></Button></Link>
              <Link href="/cleaning"><Button variant="outline" size="lg">Cleaning Service</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
