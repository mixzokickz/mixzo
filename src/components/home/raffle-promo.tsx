'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { CountdownTimer } from '@/components/raffle/countdown-timer'

interface FeaturedRaffle {
  id: string
  title: string
  entry_price: number
  end_date: string
  product_image?: string | null
  product_name?: string | null
  product_size?: string | null
  entry_count?: number
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const

export function RafflePromo() {
  const [raffle, setRaffle] = useState<FeaturedRaffle | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('raffles')
        .select('id, title, entry_price, end_date, product_image, product_name, product_size')
        .eq('status', 'active')
        .eq('featured', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const { count } = await supabase
          .from('raffle_entries')
          .select('*', { count: 'exact', head: true })
          .eq('raffle_id', data.id)
          .eq('status', 'confirmed')
        setRaffle({ ...data, entry_count: count || 0 } as FeaturedRaffle)
      }
    }
    load()
  }, [])

  if (!raffle) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.5 }}
      className="w-full"
    >
      <div className="relative rounded-2xl overflow-hidden border border-[#FF2E88]/20 bg-[#141418]/80 backdrop-blur-xl shadow-2xl shadow-[#FF2E88]/[0.08]">
        {/* Subtle glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF2E88]/[0.06] rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#00C2D6]/[0.04] rounded-full blur-[50px] pointer-events-none" />

        {/* Raffle badge */}
        <div className="relative px-3 pt-3 pb-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF2E88]/10 border border-[#FF2E88]/20 text-[#FF2E88] text-[9px] font-bold uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2E88] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF2E88]" />
            </span>
            Live Raffle
          </div>
        </div>

        {/* Product image */}
        <div className="relative px-3 pt-2.5 pb-0">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#0F0F13] border border-[#1E1E26]/50">
            {raffle.product_image ? (
              <img
                src={raffle.product_image}
                alt={raffle.product_name || raffle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Ticket className="w-16 h-16 text-[#1E1E26]" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="relative px-3 pt-2.5 pb-3.5">
          <h3 className="text-sm font-bold text-[#F4F4F4] leading-snug truncate">
            {raffle.product_name || raffle.title}
          </h3>
          {raffle.product_size && (
            <p className="text-[10px] text-[#6A6A80] mt-0.5">Size {raffle.product_size}</p>
          )}

          <div className="mt-2">
            <CountdownTimer endDate={raffle.end_date} size="sm" />
          </div>

          <div className="mt-3">
            <Link href="/raffles" className="block">
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white transition-all shadow-lg shadow-[#FF2E88]/25 cursor-pointer group">
                ${raffle.entry_price} to Enter
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] text-[#6A6A80]">
              {raffle.entry_count || 0} entries
            </span>
            <span className="text-[9px] text-[#6A6A80]">
              Terms apply
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
