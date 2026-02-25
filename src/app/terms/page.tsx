import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_EMAIL } from '@/lib/constants'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-text-muted mb-8">Last updated: February 2025</p>

          <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using the Mixzo Kickz website (&quot;Site&quot;) and services, you agree to be
                bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must
                not use our Site or services. These Terms apply to all visitors, users, and customers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">2. Products & Descriptions</h2>
              <p>
                All products listed on Mixzo Kickz are either new or preowned sneakers. We make every
                effort to accurately describe the condition and authenticity of each item. Product images
                are of the actual item you will receive unless otherwise noted. Colors may appear slightly
                different depending on your screen settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">3. Pricing & Payment</h2>
              <p>
                All prices are listed in US Dollars (USD). Prices are subject to change without notice.
                We reserve the right to modify prices, refuse, or cancel any order at our discretion.
                Payment is required in full at the time of purchase. We accept major credit cards, debit
                cards, and digital wallets through our secure payment processor.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">4. All Sales Are Final</h2>
              <p>
                All sales are final. We do not offer refunds or exchanges. If you receive an item that
                is significantly different from the listing description or arrives damaged in transit,
                you must contact us within 48 hours of delivery with photographic evidence. We will
                review the claim and work with you to find a resolution. Claims made after 48 hours
                may not be honored.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">5. Authenticity Guarantee</h2>
              <p>
                We guarantee the authenticity of every product sold on Mixzo Kickz. Each item is
                inspected and verified before listing. In the rare event that a product is determined
                to be inauthentic after purchase, we will issue a full refund upon return of the item.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">6. Shipping</h2>
              <p>
                We ship within the United States only. Orders are processed within 1–2 business days.
                Standard shipping takes 5–7 business days. Free shipping is available on orders over
                $200. Tracking information is provided via email once your order ships. We are not
                responsible for delays caused by shipping carriers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">7. Cleaning & Restoration Service</h2>
              <p>
                Our sneaker cleaning and restoration service is provided on an as-is basis. While we
                strive for excellent results, outcomes may vary depending on the condition, material,
                and age of the sneakers. Our satisfaction guarantee allows you to contact us within
                7 days of receiving your cleaned sneakers if you are not satisfied. Pre-existing damage
                and material limitations are not covered.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">8. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials.
                You agree to accept responsibility for all activities that occur under your account.
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">9. Intellectual Property</h2>
              <p>
                All content on this Site, including text, graphics, logos, and images, is the property
                of Mixzo Kickz or its content suppliers and is protected by applicable intellectual
                property laws. You may not reproduce, distribute, or create derivative works without
                our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Mixzo Kickz shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from
                your use of our Site or services, including but not limited to loss of profits,
                data, or goodwill.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                State of Colorado, without regard to its conflict of law provisions. Any disputes
                arising under these Terms shall be resolved in the courts of Denver County, Colorado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to update these Terms at any time. Changes will be posted on
                this page with an updated &quot;Last updated&quot; date. Continued use of the Site after
                changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">13. Contact</h2>
              <p>
                For questions about these Terms of Service, contact us at{' '}
                <a href={`mailto:${BUSINESS_EMAIL}`} className="text-pink hover:underline">{BUSINESS_EMAIL}</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
