'use client'

import Image from 'next/image'
import { Users, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import { CountdownTimer } from './countdown-timer'

interface RaffleCardProps {
  raffle: {
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
  onEnter?: (id: string) => void
}

export function RaffleCard({ raffle, onEnter }: RaffleCardProps) {
  const isActive = raffle.status === 'active' && new Date(raffle.end_date) > new Date()
  const isCompleted = raffle.status === 'completed'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden group hover:border-[#FF2E88]/20 transition-colors duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#0F0F13] overflow-hidden">
        {raffle.product_image ? (
          <Image
            src={raffle.product_image}
            alt={raffle.product_name || raffle.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Ticket className="w-16 h-16 text-[#1E1E26]" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sm font-bold text-white bg-[#FF2E88] px-4 py-2 rounded-full">
              Winner Drawn
            </span>
          </div>
        )}
        {isActive && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0C0C0C]/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[#00C2D6] border border-[#00C2D6]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C2D6] animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-[#F4F4F4] text-sm mb-1 line-clamp-2">{raffle.title}</h3>
        {raffle.product_size && (
          <p className="text-xs text-[#6A6A80] mb-3">Size {raffle.product_size}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0B8]">
            <Users className="w-3.5 h-3.5" />
            <span>{raffle.entry_count || 0} entries</span>
            {raffle.max_entries && (
              <span className="text-[#6A6A80]">/ {raffle.max_entries}</span>
            )}
          </div>
          <span className="text-sm font-bold text-[#FF2E88]">
            ${raffle.entry_price}
          </span>
        </div>

        {isActive ? (
          <>
            <CountdownTimer endDate={raffle.end_date} size="sm" className="mb-3" />
            <button
              onClick={() => onEnter?.(raffle.id)}
              className="w-full py-2.5 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Enter Now - ${raffle.entry_price}
            </button>
          </>
        ) : (
          <div className="py-2 text-center text-xs font-medium text-[#6A6A80]">
            Raffle ended
          </div>
        )}
      </div>
    </motion.div>
  )
}
