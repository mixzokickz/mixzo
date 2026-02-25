'use client'

import { Bell, ShoppingCart, AlertTriangle, UserPlus, Package } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-[var(--text-muted)]">Activity and alerts</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
        <Bell size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-white mb-1">All caught up!</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">No new notifications right now</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><ShoppingCart size={14} /> New orders</span>
          <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> Low stock</span>
          <span className="flex items-center gap-1.5"><UserPlus size={14} /> New signups</span>
          <span className="flex items-center gap-1.5"><Package size={14} /> Shipment updates</span>
        </div>
      </div>
    </div>
  )
}
