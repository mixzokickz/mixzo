import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { BUSINESS_EMAIL } from '@/lib/constants'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-mobile-nav">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-text-muted mb-8">Last updated: February 2025</p>

          <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Information We Collect</h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-text">Personal Information:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
                <li><strong className="text-text">Payment Information:</strong> Payment details are processed securely by our third-party payment processor. We do not store your full credit card number.</li>
                <li><strong className="text-text">Browsing Data:</strong> We collect anonymized browsing data through cookies and analytics tools to improve your shopping experience.</li>
                <li><strong className="text-text">Communications:</strong> Any messages you send us via email, Instagram, or our contact form.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping notifications</li>
                <li>Communicate about your purchases or cleaning service requests</li>
                <li>Improve our website and services</li>
                <li>Respond to your questions and support requests</li>
                <li>Send promotional communications (only with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
                <li><strong className="text-text">Service Providers:</strong> With trusted partners who help us operate our business (payment processing, shipping carriers, analytics).</li>
                <li><strong className="text-text">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information,
                including SSL encryption, secure payment processing, and regular security audits.
                However, no method of transmission over the Internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Cookies</h2>
              <p>
                We use cookies and similar technologies to maintain your shopping cart, remember your
                preferences, and analyze site traffic. You can disable cookies in your browser settings,
                though this may affect certain site functionality such as your shopping cart and account login.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt out of promotional communications at any time</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{' '}
                <a href={`mailto:${BUSINESS_EMAIL}`} className="text-pink hover:underline">{BUSINESS_EMAIL}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Third-Party Services</h2>
              <p>
                We use third-party services for payment processing (Stripe), analytics (Google Analytics),
                and email communications. These services have their own privacy policies governing how
                they use your information. We encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 13. We do not knowingly
                collect personal information from children. If we become aware that a child under 13
                has provided us with personal information, we will take steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this
                page with an updated &quot;Last updated&quot; date. Your continued use of our services after
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Contact Us</h2>
              <p>
                For privacy-related inquiries or concerns, contact us at{' '}
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
