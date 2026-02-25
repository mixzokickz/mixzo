import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">Information We Collect</h2>
              <p>When you make a purchase, we collect your name, email address, phone number, and shipping address. We also collect browsing data through cookies to improve your experience.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">How We Use Your Information</h2>
              <p>Your information is used to process orders, communicate about your purchases, and improve our services. We do not sell your personal information to third parties.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is completely secure.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">Cookies</h2>
              <p>We use cookies to maintain your shopping cart and preferences. You can disable cookies in your browser settings, though this may affect site functionality.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">Third-Party Services</h2>
              <p>We use third-party services for payment processing and analytics. These services have their own privacy policies governing the use of your information.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-text mb-2">Contact</h2>
              <p>For privacy-related inquiries, contact us at Mixzo.kickz@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
