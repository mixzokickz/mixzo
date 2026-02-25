import { Truck, Package, Clock, MapPin } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

const INFO = [
  { icon: Clock, title: 'Processing Time', desc: 'Orders are processed within 1-2 business days. You will receive a confirmation email once your order is placed.' },
  { icon: Truck, title: 'Shipping Speed', desc: 'Standard shipping takes 3-7 business days within the United States. Expedited options may be available at checkout.' },
  { icon: Package, title: 'Free Shipping', desc: 'Orders over $200 qualify for free standard shipping. No code needed — the discount is applied automatically at checkout.' },
  { icon: MapPin, title: 'Shipping Area', desc: 'We currently ship to all 50 US states. International shipping is not available at this time.' },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-2">Shipping Information</h1>
          <p className="text-text-muted mb-8">Everything you need to know about how we get your kicks to you.</p>
          <div className="space-y-4">
            {INFO.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-pink" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
