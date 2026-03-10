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
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.5 }}
    >
      {/* Mobile: horizontal compact card */}
      <div className="block md:hidden">
        <Link href="/raffles">
          <div className="relative flex items-center gap-3 p-3 rounded-xl border border-[#FF2E88]/20 bg-[#141418]/80 backdrop-blur-xl">
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#FF2E88]/[0.05] rounded-full blur-[30px] pointer-events-none" />
            
            {/* Small image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0F0F13] border border-[#1E1E26]/50 shrink-0">
              {raffle.product_image ? (
                <img src={raffle.product_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-[#1E1E26]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2E88] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF2E88]" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF2E88]">Live Raffle</span>
              </div>
              <p className="text-xs font-bold text-[#F4F4F4] truncate">{raffle.product_name || raffle.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#6A6A80]">{raffle.entry_count || 0} entries</span>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#FF2E88] text-white">
                ${raffle.entry_price}
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Desktop/Tablet: vertical compact card */}
      <div className="hidden md:block max-w-[260px]">
        <div className="relative rounded-xl overflow-hidden border border-[#FF2E88]/15 bg-[#141418]/80 backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF2E88]/[0.05] rounded-full blur-[40px] pointer-events-none" />

          {/* Badge */}
          <div className="relative px-2.5 pt-2.5 pb-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF2E88]/10 border border-[#FF2E88]/20 text-[#FF2E88] text-[8px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2E88] opacity-75" />
                <span className="relative inline-flex rounded-full h-1 w-1 bg-[#FF2E88]" />
              </span>
              Live Raffle
            </div>
          </div>

          {/* Image */}
          <div className="relative px-2.5 pt-2 pb-0">
            <div className="relative w-full rounded-lg overflow-hidden bg-[#0F0F13] border border-[#1E1E26]/40" style={{ aspectRatio: '4/3', maxHeight: '160px' }}>
              {raffle.product_image ? (
                <img src={raffle.product_image} alt={raffle.product_name || raffle.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-[#1E1E26]" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="relative px-2.5 pt-2 pb-3">
            <h3 className="text-[11px] lg:text-xs font-bold text-[#F4F4F4] leading-snug truncate">
              {raffle.product_name || raffle.title}
            </h3>
            {raffle.product_size && (
              <p className="text-[9px] text-[#6A6A80] mt-0.5">Size {raffle.product_size}</p>
            )}

            <div className="mt-1.5">
              <CountdownTimer endDate={raffle.end_date} size="sm" />
            </div>

            <Link href="/raffles" className="block mt-2">
              <button className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white transition-all shadow-md shadow-[#FF2E88]/20 cursor-pointer group">
                ${raffle.entry_price} to Enter
                <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>

            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[8px] text-[#6A6A80]">{raffle.entry_count || 0} entries</span>
              <span className="text-[8px] text-[#6A6A80]">Terms apply</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
