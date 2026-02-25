import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto py-6 prose-custom">
          <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">1. Agreement to Terms</h2>
              <p>By accessing or using the Mixzo Kickz website and services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">2. Products</h2>
              <p>All products listed on Mixzo Kickz are either new or preowned sneakers. We make every effort to accurately describe the condition and authenticity of each item. Product images are representative of the actual item you will receive.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">3. Pricing and Payment</h2>
              <p>All prices are listed in US Dollars. Prices are subject to change without notice. Payment is required at the time of purchase. We reserve the right to refuse or cancel any order.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">4. All Sales Are Final</h2>
              <p>All sales are final. We do not offer refunds or exchanges unless the item received is significantly different from the listing description. Claims must be made within 48 hours of delivery with photographic evidence.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">5. Shipping</h2>
              <p>We ship within the United States. Orders are processed within 1-2 business days. Shipping times vary by location. Free shipping is available on orders over $200.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">6. Limitation of Liability</h2>
              <p>Mixzo Kickz is not liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">7. Contact</h2>
              <p>For questions about these terms, contact us at Mixzo.kickz@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
