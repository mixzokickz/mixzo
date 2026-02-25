'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { cn } from '@/lib/utils'

const FAQS = [
  { q: 'Are your sneakers authentic?', a: 'Every pair is verified for authenticity before listing. We stand behind every product we sell with our authenticity guarantee.' },
  { q: 'What does "Preowned" mean?', a: 'Preowned sneakers have been previously worn but are still in great condition. Each listing includes detailed photos and an honest condition description so you know exactly what you are getting.' },
  { q: 'What is your return policy?', a: 'All sales are final. We provide detailed photos and descriptions so you can make an informed purchase. If you receive an item that is significantly different from the listing, contact us within 48 hours.' },
  { q: 'How long does shipping take?', a: 'Orders are processed within 1-2 business days. Standard shipping typically takes 3-7 business days. Free shipping on orders over $200.' },
  { q: 'Do you ship internationally?', a: 'Currently we only ship within the United States. International shipping may be available in the future.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking number via email. You can also check your order status on our Order Lookup page.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 1 hour of placement if they have not been processed. Contact us immediately if you need to cancel.' },
  { q: 'Do you offer payment plans?', a: 'We accept all major credit cards, debit cards, and digital wallets through our secure payment system.' },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-text-muted mb-8">Everything you need to know about shopping with Mixzo Kickz.</p>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold pr-4">{faq.q}</span>
                  <ChevronDown className={cn('w-4 h-4 text-text-muted shrink-0 transition-transform', open === i && 'rotate-180')} />
                </button>
                {open === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
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
