import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram } from 'lucide-react'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="gradient-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="gradient-text text-2xl font-black tracking-[-0.04em]">MIXZO</span>
            <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-xs">
              Authenticated new and preowned sneakers, shipped from Denver, Colorado.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shop?condition=new" className="text-sm text-text-muted hover:text-text transition-colors">New Sneakers</Link></li>
              <li><Link href="/shop?condition=used" className="text-sm text-text-muted hover:text-text transition-colors">Preowned</Link></li>
              <li><Link href="/about" className="text-sm text-text-muted hover:text-text transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Info</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shipping" className="text-sm text-text-muted hover:text-text transition-colors">Shipping</Link></li>
              <li><Link href="/returns" className="text-sm text-text-muted hover:text-text transition-colors">Returns</Link></li>
              <li><Link href="/terms" className="text-sm text-text-muted hover:text-text transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="text-sm text-text-muted hover:text-text transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href={`tel:${BUSINESS_PHONE}`} className="hover:text-text transition-colors">{BUSINESS_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-text transition-colors">{BUSINESS_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <Instagram className="w-3.5 h-3.5 shrink-0" />
                <a href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink transition-colors">
                  {BUSINESS_INSTAGRAM}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-muted">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{BUSINESS_LOCATION}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Mixzo Kickz. All rights reserved.</p>
          <p className="text-xs text-text-muted">Denver, Colorado</p>
        </div>
      </div>
    </footer>
  )
}
