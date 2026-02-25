'use client'

import Link from 'next/link'
import { ShopHeader } from '@/components/layout/shop-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { SITE_NAME, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION, BUSINESS_PHONE } from '@/lib/constants'
import { MapPin, Mail, Phone, Instagram, Shield, Heart, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <ShopHeader />
      <main className="min-h-screen bg-[var(--bg)] pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-[var(--pink)] font-medium uppercase tracking-wider mb-4">About Mixzo Kickz</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
              Denver&apos;s Premier<br />
              <span className="gradient-text">Sneaker Destination</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Connecting sneakerheads with authentic kicks since day one. New releases, preowned heat, 
              and professional cleaning — all under one roof.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Shield, title: 'Authenticated', desc: 'Every pair is verified for authenticity before it reaches you.' },
              { icon: Heart, title: 'Community First', desc: 'Built by sneakerheads, for sneakerheads. Fair prices, always.' },
              { icon: Sparkles, title: 'Full Service', desc: 'From sales to cleaning to restoration — we do it all.' },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 text-center">
                <item.icon className="w-8 h-8 text-[var(--pink)] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Our Services</h2>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">✅ Authenticated new & preowned sneakers</li>
                <li className="flex items-start gap-2">✅ <Link href="/cleaning" className="text-[var(--pink)] hover:underline">Professional sneaker cleaning & restoration</Link></li>
                <li className="flex items-start gap-2">✅ <Link href="/drops" className="text-[var(--pink)] hover:underline">Exclusive drops & restocks</Link></li>
                <li className="flex items-start gap-2">✅ Free shipping on orders over $200</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Get In Touch</h2>
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <p className="flex items-center gap-3"><MapPin size={16} className="text-[var(--pink)] shrink-0" /> {BUSINESS_LOCATION}</p>
                <p className="flex items-center gap-3"><Phone size={16} className="text-[var(--pink)] shrink-0" /> {BUSINESS_PHONE}</p>
                <p className="flex items-center gap-3"><Mail size={16} className="text-[var(--pink)] shrink-0" /> {BUSINESS_EMAIL}</p>
                <p className="flex items-center gap-3"><Instagram size={16} className="text-[var(--pink)] shrink-0" /> {BUSINESS_INSTAGRAM}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[var(--pink)] hover:bg-[var(--pink)]/80 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  )
}
