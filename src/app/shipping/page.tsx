'use client'

import { motion } from 'framer-motion'
import { Truck, Package, Clock, MapPin, DollarSign, Droplets, Mail } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_EMAIL } from '@/lib/constants'

const SHIPPING_INFO = [
  {
    icon: Clock,
    title: 'Processing Time',
    desc: 'Orders are processed within 1–2 business days. You\'ll receive a confirmation email once your order is placed and another when it ships.',
  },
  {
    icon: Truck,
    title: 'Standard Shipping',
    desc: 'Standard shipping takes 5–7 business days within the United States. All packages are shipped with tracking and signature confirmation for orders over $300.',
  },
  {
    icon: DollarSign,
    title: 'Free Shipping Over $200',
    desc: 'Orders totaling $200 or more qualify for free standard shipping. No code needed — the discount is applied automatically at checkout.',
  },
  {
    icon: Mail,
    title: 'Tracking Provided',
    desc: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status on our Order Lookup page anytime.',
  },
  {
    icon: MapPin,
    title: 'Shipping Area',
    desc: 'We currently ship to all 50 US states. International shipping is not available at this time. Follow us on Instagram for updates on expansion.',
  },
  {
    icon: Package,
    title: 'Packaging',
    desc: 'All sneakers are carefully packaged to prevent damage during transit. Original boxes are included when available. We use protective materials to keep your kicks safe.',
  },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Shipping Information</h1>
            <p className="text-text-muted">Everything you need to know about how we get your kicks to you.</p>
          </motion.div>

          <div className="space-y-4 mb-10">
            {SHIPPING_INFO.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-border-light transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-pink/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-pink" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cleaning Service Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-[#00C2D6]/20 rounded-2xl p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00C2D6]/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-[#00C2D6]" />
              </div>
              <h2 className="text-lg font-bold">Cleaning Service Shipping</h2>
            </div>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                For our sneaker cleaning and restoration service, shipping works a little differently:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">Outbound (you → us):</strong> Customer pays shipping to send sneakers to our Denver facility. We&apos;ll provide our shipping address after you submit a cleaning request.</li>
                <li><strong className="text-white">Return (us → you):</strong> We cover the return shipping cost. Your freshly cleaned kicks come back to you free of charge.</li>
              </ul>
              <p className="text-text-muted">
                We recommend using a tracked shipping method when sending your sneakers to us. Mixzo Kickz is not responsible for packages lost in transit to our facility.
              </p>
            </div>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-elevated border border-border rounded-2xl p-6 text-center"
          >
            <h3 className="font-semibold mb-2">Shipping Questions?</h3>
            <p className="text-sm text-text-secondary">
              Email us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-pink hover:underline">{BUSINESS_EMAIL}</a> and we&apos;ll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
