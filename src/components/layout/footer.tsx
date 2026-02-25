import Link from 'next/link'
import { Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { SITE_NAME, BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'

export function Footer() {
  const igHandle = BUSINESS_INSTAGRAM.replace('@', '')

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-3">{SITE_NAME}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              New and preowned sneakers. Authenticated and shipped from Denver, CO.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link href="/shop" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">All Sneakers</Link>
              <Link href="/shop?condition=new" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">New Arrivals</Link>
              <Link href="/shop?condition=used" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">Preowned</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Info</h4>
            <div className="flex flex-col gap-2">
              <Link href="/returns" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">Return Policy</Link>
              <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">Account</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href={`tel:${BUSINESS_PHONE}`} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> {BUSINESS_PHONE}
              </a>
              <a href={`mailto:${BUSINESS_EMAIL}`} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> {BUSINESS_EMAIL}
              </a>
              <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                <Instagram className="w-4 h-4" /> {BUSINESS_INSTAGRAM}
              </a>
              <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <MapPin className="w-4 h-4" /> {BUSINESS_LOCATION}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
