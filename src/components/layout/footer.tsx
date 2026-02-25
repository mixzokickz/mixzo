import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="h-px bg-gradient-to-r from-pink via-cyan to-pink" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black tracking-tight text-text">MIXZO</span>
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              New and preowned sneakers, authenticated and shipped from Denver, Colorado.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop?condition=new', label: 'New Arrivals' },
                { href: '/shop?condition=used', label: 'Preowned' },
                { href: '/drops', label: 'Drops' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted hover:text-text transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-5">Services</h4>
            <ul className="space-y-3">
              {[
                { href: '/cleaning', label: 'Sneaker Cleaning' },
                { href: '/cleaning#pricing', label: 'Cleaning Pricing' },
                { href: '/cleaning#faq', label: 'Cleaning FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted hover:text-text transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-5">Info</h4>
            <ul className="space-y-3">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping' },
                { href: '/returns', label: 'Returns' },
                { href: '/terms', label: 'Terms' },
                { href: '/privacy', label: 'Privacy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted hover:text-text transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <Phone className="w-4 h-4 shrink-0" />
                <a href={`tel:${BUSINESS_PHONE}`} className="hover:text-text transition-colors">{BUSINESS_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <Mail className="w-4 h-4 shrink-0" />
                <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-text transition-colors">{BUSINESS_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{BUSINESS_LOCATION}</span>
              </li>
              <li className="text-sm text-text-muted">
                <a href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink transition-colors">
                  {BUSINESS_INSTAGRAM}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Mixzo Kickz. All rights reserved.</p>
          <p className="text-xs text-text-muted">Denver, Colorado</p>
        </div>
      </div>
    </footer>
  )
}
