'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, Mail } from 'lucide-react'

const FAQS = [
  { q: 'How do I scan a product?', a: 'Go to Dashboard → Scan Product. Use your device camera to scan the barcode or UPC. The system will look up the product in our database and StockX for pricing.' },
  { q: 'How do I create a new order?', a: 'Navigate to Orders → Create Order. Search for a customer, add products, select sizes, and choose a payment method. You can also create walk-in orders without a customer account.' },
  { q: 'How do I add a new product?', a: 'Go to Products → Add Product. Fill in the name, brand, SKU, price, condition, and upload images. You can also add StockX ID for automatic price syncing.' },
  { q: 'How do I manage inventory?', a: 'The Inventory page shows all products with their stock levels. You can adjust quantities, set low-stock alerts, and run inventory reconciliation from the Reconciliation page.' },
  { q: 'How do Daily Deals work?', a: 'Daily Deals are time-limited discounts shown on the storefront. Go to Marketing → Daily Deals to create, schedule, and manage featured deals.' },
  { q: 'How do I create a discount code?', a: 'Go to Marketing → Discounts. Click "Create Discount" and set the code, type (percentage or fixed), value, and optional expiry date.' },
  { q: 'How do I issue a gift card?', a: 'Navigate to Marketing → Gift Cards. Click "Create Gift Card", enter a code, value, and optional expiry. Gift cards can be toggled active/inactive.' },
  { q: 'How do I track shipping?', a: 'Go to Orders → Shipping. You can look up tracking numbers and view shipment statuses. Connect a shipping provider for automatic label generation.' },
  { q: 'How do I generate reports?', a: 'Go to Finance → Reports. Choose from Sales, Inventory, or Customer reports. Set a date range and click Generate to download.' },
  { q: 'How do I add team members?', a: 'Go to Team → Staff. Click "Add Staff" to invite new team members. You can assign roles: owner, manager, or staff with different permission levels.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Help Center</h1>
        <p className="text-sm text-[var(--text-muted)]">Frequently asked questions and support</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
              <span className="text-sm font-medium text-white">{faq.q}</span>
              {open === i ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 text-center">
        <HelpCircle size={32} className="text-[var(--cyan)] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">Need more help?</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Contact us for personalized support</p>
        <a href="mailto:support@mixzo.store" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--cyan)] text-white text-sm font-medium hover:opacity-90 transition">
          <Mail size={16} /> Contact Support
        </a>
      </div>
    </div>
  )
}
