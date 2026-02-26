import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from 'lucide-react'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-[#1E1E26] mt-auto relative overflow-hidden">
      {/* Gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FF2E88]/40 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#FF2E88]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black tracking-[-0.04em] text-white">MIXZO</span>
            <p className="mt-4 text-sm text-[#6A6A80] leading-relaxed">
              New and preowned sneakers, authenticated and shipped from Denver, Colorado.
            </p>
            <a
              href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-[#6A6A80] hover:text-[#FF2E88] transition-colors group"
            >
              <Instagram className="w-4 h-4" />
              {BUSINESS_INSTAGRAM}
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-bold text-[#4A4A5A] uppercase tracking-[0.15em] mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop?condition=new', label: 'New Arrivals' },
                { href: '/shop?condition=used', label: 'Preowned' },
                { href: '/deals', label: 'Deals' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6A6A80] hover:text-white transition-colors duration-300">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[11px] font-bold text-[#4A4A5A] uppercase tracking-[0.15em] mb-5">Services</h4>
            <ul className="space-y-3">
              {[
                { href: '/cleaning', label: 'Sneaker Cleaning' },
                { href: '/cleaning#pricing', label: 'Cleaning Pricing' },
                { href: '/cleaning#faq', label: 'Cleaning FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6A6A80] hover:text-white transition-colors duration-300">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-[11px] font-bold text-[#4A4A5A] uppercase tracking-[0.15em] mb-5">Info</h4>
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
                  <Link href={link.href} className="text-sm text-[#6A6A80] hover:text-white transition-colors duration-300">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-[#4A4A5A] uppercase tracking-[0.15em] mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-[#6A6A80] group">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A22] flex items-center justify-center shrink-0 group-hover:bg-[#FF2E88]/10 transition-colors duration-300">
                  <Phone className="w-3.5 h-3.5 group-hover:text-[#FF2E88] transition-colors" />
                </div>
                <a href={`tel:${BUSINESS_PHONE}`} className="hover:text-white transition-colors">{BUSINESS_PHONE}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#6A6A80] group">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A22] flex items-center justify-center shrink-0 group-hover:bg-[#FF2E88]/10 transition-colors duration-300">
                  <Mail className="w-3.5 h-3.5 group-hover:text-[#FF2E88] transition-colors" />
                </div>
                <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-white transition-colors">{BUSINESS_EMAIL}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#6A6A80] group">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A22] flex items-center justify-center shrink-0 group-hover:bg-[#FF2E88]/10 transition-colors duration-300">
                  <MapPin className="w-3.5 h-3.5 group-hover:text-[#FF2E88] transition-colors" />
                </div>
                <span>{BUSINESS_LOCATION}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#1E1E26] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4A4A5A]">&copy; {new Date().getFullYear()} Mixzo Kickz. All rights reserved.</p>
          <p className="text-xs text-[#4A4A5A]">Denver, Colorado</p>
        </div>
      </div>
    </footer>
  )
}
