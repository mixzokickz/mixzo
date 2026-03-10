'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
    <section className="px-6 md:px-12 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border border-[#1E1E26] noise"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#141418] via-[#0F0F13] to-[#0C0C0C]" />
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#FF2E88]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#00C2D6]/[0.04] rounded-full blur-[100px]" />

          <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-[#0F0F13] border border-[#1E1E26]">
                {raffle.product_image ? (
                  <Image
                    src={raffle.product_image}
                    alt={raffle.product_name || raffle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ticket className="w-20 h-20 text-[#1E1E26]" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF2E88]/10 border border-[#FF2E88]/20 text-[#FF2E88] text-xs font-medium mb-4">
                <Ticket className="w-3.5 h-3.5" />
                Active Raffle
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#F4F4F4] mb-2">
                {raffle.product_name || raffle.title}
              </h2>
              {raffle.product_size && (
                <p className="text-sm text-[#A0A0B8] mb-4">Size {raffle.product_size}</p>
              )}

              <CountdownTimer endDate={raffle.end_date} size="md" className="mb-6" />

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Link href={`/raffles`}>
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white transition-all shadow-lg shadow-[#FF2E88]/25 cursor-pointer group">
                    ${raffle.entry_price} to Enter
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <span className="text-xs text-[#6A6A80]">
                  {raffle.entry_count || 0} entries so far
                </span>
              </div>

              <p className="text-[11px] text-[#6A6A80]">
                Terms apply. One entry per person. Winner drawn after countdown ends.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
