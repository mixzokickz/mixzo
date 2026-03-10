'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Ticket, Trophy, X, Mail, User, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { RaffleCard } from '@/components/raffle/raffle-card'

interface Raffle {
  id: string
  title: string
  entry_price: number
  end_date: string
  status: string
  product_image?: string | null
  product_name?: string | null
  product_size?: string | null
  entry_count?: number
  max_entries?: number | null
  winner_id?: string | null
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [entryModal, setEntryModal] = useState<Raffle | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('entered') === 'true') {
      toast.success('You\'re in! Check your email for confirmation.')
    }
  }, [searchParams])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/raffles')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setRaffles(data)
      } catch {
        // Silent
      }
      setLoading(false)
    }
    load()
  }, [])

  // Focus email input when modal opens
  useEffect(() => {
    if (entryModal) {
      setTimeout(() => emailRef.current?.focus(), 100)
    }
  }, [entryModal])

  function openEntryModal(raffleId: string) {
    const raffle = raffles.find((r) => r.id === raffleId)
    if (raffle) {
      setEntryModal(raffle)
      setEmail('')
      setName('')
    }
  }

  async function handleSubmitEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!entryModal || !email || !name) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/raffles/${entryModal.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: email.trim(), customer_name: name.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to enter raffle')
        setSubmitting(false)
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const activeRaffles = raffles.filter((r) => r.status === 'active' && new Date(r.end_date) > new Date())
  const pastRaffles = raffles.filter((r) => r.status === 'completed' || (r.status === 'active' && new Date(r.end_date) <= new Date()))

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-12 lg:px-16 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF2E88]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00C2D6]/[0.03] blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141418] border border-[#1E1E26] text-xs text-[#6A6A80] mb-6">
              <Ticket className="w-3.5 h-3.5 text-[#FF2E88]" />
              Win Premium Sneakers
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] mb-4">
              <span className="text-gradient">Raffles</span>
            </h1>
            <p className="text-lg text-[#A0A0B8] max-w-lg mx-auto">
              Enter for a chance to win authenticated sneakers at a fraction of the price. New raffles drop regularly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Active Raffles */}
      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-[#141418] border border-[#1E1E26] animate-pulse" />
              ))}
            </div>
          ) : activeRaffles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-[#141418] border border-[#1E1E26] flex items-center justify-center mb-6">
                <Ticket className="w-8 h-8 text-[#6A6A80]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Raffles</h3>
              <p className="text-sm text-[#6A6A80] max-w-xs">
                Check back soon — we drop new raffles regularly. Follow us on Instagram to get notified.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2E88] mb-1">Enter Now</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Active Raffles</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeRaffles.map((raffle, i) => (
                  <motion.div
                    key={raffle.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: easeOutExpo }}
                  >
                    <RaffleCard raffle={raffle} onEnter={openEntryModal} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Past Raffles */}
      {pastRaffles.length > 0 && (
        <section className="px-6 md:px-12 lg:px-16 pb-28 pb-mobile-nav">
          <div className="max-w-7xl mx-auto">
            <div className="glow-line mb-10" />
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-5 h-5 text-[#6A6A80]" />
              <h2 className="text-xl font-bold text-[#6A6A80]">Past Raffles</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastRaffles.map((raffle, i) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: easeOutExpo }}
                >
                  <RaffleCard raffle={raffle} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Entry Modal ─── */}
      <AnimatePresence>
        {entryModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setEntryModal(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-md rounded-2xl bg-[#141418] border border-[#1E1E26] shadow-2xl shadow-black/40 overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF2E88]/[0.06] rounded-full blur-[60px] pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={() => !submitting && setEntryModal(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0C0C0C] border border-[#1E1E26] flex items-center justify-center text-[#6A6A80] hover:text-white transition-colors z-10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header with product */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-center gap-4">
                    {entryModal.product_image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0F0F13] border border-[#1E1E26] shrink-0">
                        <img
                          src={entryModal.product_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF2E88]/10 text-[#FF2E88] text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Ticket className="w-3 h-3" />
                        Raffle Entry
                      </div>
                      <h3 className="text-lg font-bold text-[#F4F4F4] truncate">
                        {entryModal.product_name || entryModal.title}
                      </h3>
                      {entryModal.product_size && (
                        <p className="text-xs text-[#6A6A80]">Size {entryModal.product_size}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitEntry} className="px-6 pb-6">
                  <div className="space-y-3">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A80]" />
                        <input
                          ref={emailRef}
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0C0C0C] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#4A4A5A] focus:border-[#FF2E88]/40 focus:outline-none focus:ring-1 focus:ring-[#FF2E88]/20 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A80]" />
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0C0C0C] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#4A4A5A] focus:border-[#FF2E88]/40 focus:outline-none focus:ring-1 focus:ring-[#FF2E88]/20 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !email || !name}
                    className="w-full mt-5 py-3.5 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 disabled:bg-[#FF2E88]/50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-[#FF2E88]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        Enter for ${entryModal.entry_price}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#6A6A80] text-center mt-3">
                    You&apos;ll be redirected to secure checkout. One entry per person. Terms apply.
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
