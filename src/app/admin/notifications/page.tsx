'use client'

import { useEffect, useState } from 'react'
import { Bell, ShoppingCart, AlertTriangle, UserPlus, Package, Sparkles, Star, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'order' | 'stock' | 'signup' | 'cleaning' | 'review'
  title: string
  message: string
  read: boolean
  created_at: string
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  order: { icon: ShoppingCart, color: '#FF2E88', bg: '#FF2E88' },
  stock: { icon: AlertTriangle, color: '#F59E0B', bg: '#F59E0B' },
  signup: { icon: UserPlus, color: '#00C2D6', bg: '#00C2D6' },
  cleaning: { icon: Sparkles, color: '#A855F7', bg: '#A855F7' },
  review: { icon: Star, color: '#10B981', bg: '#10B981' },
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    // Try loading from notifications table; empty state if not yet created
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data || [])
    } catch {
      setNotifications([])
    }
    setLoading(false)
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1">
            {(['all', 'unread'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                  filter === v
                    ? 'bg-[#FF2E88] text-white shadow-md shadow-[#FF2E88]/20'
                    : 'text-[var(--text-muted)] hover:text-white'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category icons */}
      <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
        {Object.entries(typeConfig).map(([type, cfg]) => {
          const Icon = cfg.icon
          return (
            <span key={type} className="flex items-center gap-1.5 capitalize">
              <Icon size={14} style={{ color: cfg.color }} />
              {type === 'stock' ? 'Low Stock' : type}
            </span>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00C2D6]/5 to-[#FF2E88]/5 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-[#00C2D6]/10 border border-[#00C2D6]/20 flex items-center justify-center mx-auto mb-5">
              <Bell size={32} className="text-[#00C2D6]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">All Caught Up!</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              {filter === 'unread' ? 'No unread notifications. Switch to All to see history.' : 'No notifications yet. Activity will show up here as your store grows.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <ShoppingCart size={13} className="text-[#FF2E88]" /> New orders
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <AlertTriangle size={13} className="text-yellow-400" /> Low stock
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <UserPlus size={13} className="text-[#00C2D6]" /> New signups
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <Package size={13} className="text-green-400" /> Shipment updates
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.order
              const Icon = cfg.icon
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 group cursor-pointer',
                    n.read
                      ? 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border)]/80'
                      : 'bg-[var(--bg-card)] border-l-2 border-[var(--border)]'
                  )}
                  style={!n.read ? { borderLeftColor: cfg.color } : undefined}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${cfg.color}12` }}
                  >
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-semibold', n.read ? 'text-[var(--text-secondary)]' : 'text-white')}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF2E88] shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0 flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(n.created_at)}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
