'use client'

import { HelpCircle, BookOpen, MessageSquare, ExternalLink, Zap, Package, ShoppingCart, ScanBarcode, BarChart3, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const GUIDES = [
  { icon: ScanBarcode, title: 'Scanning Products', desc: 'Use the barcode scanner or type UPCs/style IDs to quickly add inventory', href: '/admin/scan', color: '#FF2E88' },
  { icon: Package, title: 'Managing Inventory', desc: 'Add, edit, and track your sneaker inventory with images and pricing', href: '/admin/products', color: '#00C2D6' },
  { icon: ShoppingCart, title: 'Processing Orders', desc: 'View orders, update statuses, print packing slips, and manage fulfillment', href: '/admin/orders', color: '#A855F7' },
  { icon: Users, title: 'Customer Management', desc: 'View customer profiles, order history, and lifetime value', href: '/admin/customers', color: '#10B981' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Track revenue, margins, best sellers, and inventory performance', href: '/admin/analytics', color: '#F59E0B' },
  { icon: Zap, title: 'Quick Actions', desc: 'Create orders, scan products, and manage deals from the dashboard', href: '/admin', color: '#EF4444' },
]

const TIPS = [
  '💡 Use a USB barcode scanner for the fastest inventory workflow',
  '📦 Link barcodes to products once — future scans are instant',
  '💰 Always enter cost price to track margins accurately',
  '📸 Upload photos for preowned items to build buyer confidence',
  '🏷️ Use discount codes for social media promotions',
  '📊 Check analytics weekly to spot trends and slow movers',
]

export default function HelpPage() {
  return (
    <div className="space-y-6 page-enter max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Help Center</h1>
        <p className="text-sm text-[var(--text-muted)]">Quick guides and tips for managing your store</p>
      </div>

      {/* Quick Start Guides */}
      <div>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Quick Start Guides</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((guide, i) => {
            const Icon = guide.icon
            return (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={guide.href}
                  className="block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border)]/80 transition-all duration-300 group h-full"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${guide.color}10` }}
                  >
                    <Icon size={18} style={{ color: guide.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#FF2E88] transition-colors">{guide.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{guide.desc}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
            <BookOpen size={16} className="text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Pro Tips</h2>
            <p className="text-[10px] text-[var(--text-muted)]">Get the most out of your store</p>
          </div>
        </div>
        <div className="space-y-2">
          {TIPS.map(tip => (
            <div key={tip} className="text-sm text-[var(--text-secondary)] py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
              {tip}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[#FF2E88]/5 to-[#00C2D6]/5 border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00C2D6]/10 flex items-center justify-center">
            <MessageSquare size={20} className="text-[#00C2D6]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Need more help?</h3>
            <p className="text-xs text-[var(--text-muted)]">Reach out anytime — we&apos;re here to help</p>
          </div>
        </div>
        <Link
          href="/admin/tickets"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C2D6]/10 border border-[#00C2D6]/20 text-sm text-[#00C2D6] font-bold hover:bg-[#00C2D6]/20 transition-all"
        >
          <ExternalLink size={14} /> Support
        </Link>
      </motion.div>
    </div>
  )
}
