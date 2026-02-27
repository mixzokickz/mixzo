'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CleaningImage {
  before: string
  after: string
  label: string
}

const CLEANING_IMAGES: CleaningImage[] = [
  { before: '/cleaning/before-1.jpg', after: '/cleaning/after-1.jpg', label: 'Jordan 4 Restoration' },
  { before: '/cleaning/before-2.jpg', after: '/cleaning/after-2.jpg', label: 'Yeezy Deep Clean' },
  { before: '/cleaning/before-3.jpg', after: '/cleaning/after-3.jpg', label: 'Air Force 1 Revival' },
]

function BeforeAfterCard({ item, index }: { item: CleaningImage; index: number }) {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div
        className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-elevated cursor-pointer"
        onClick={() => setShowAfter(!showAfter)}
      >
        {/* Before image */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          showAfter ? 'opacity-0' : 'opacity-100'
        )}>
          <Image
            src={item.before}
            alt={`${item.label} - Before`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>

        {/* After image */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          showAfter ? 'opacity-100' : 'opacity-0'
        )}>
          <Image
            src={item.after}
            alt={`${item.label} - After`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>

        {/* Label overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            showAfter
              ? 'bg-cyan/90 text-white'
              : 'bg-pink/90 text-white'
          )}>
            {showAfter ? 'After' : 'Before'}
          </span>
        </div>

        {/* Tap hint */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/70 font-medium">
            Tap to {showAfter ? 'see before' : 'reveal'}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <p className="mt-3 text-sm font-medium text-text-secondary text-center">{item.label}</p>
    </motion.div>
  )
}

export function CleaningShowcase() {
  return (
    <section className="px-4 py-20 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan/[0.03] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span className="text-xs font-semibold text-cyan uppercase tracking-wider">Sneaker Cleaning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-text">
            Fresh Out The <span className="gradient-text">Box</span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            Every preowned pair gets a professional deep clean before it hits the shelf. Tap to see the transformation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CLEANING_IMAGES.map((item, i) => (
            <BeforeAfterCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
