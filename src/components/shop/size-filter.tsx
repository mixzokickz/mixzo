'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const ALL_SIZES = [
  '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
  '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
  '12', '12.5', '13', '14', '15', '16'
]

interface SizeFilterProps {
  selected: string[]
  onChange: (sizes: string[]) => void
  availableSizes?: string[]
  className?: string
}

export function SizeFilter({ selected, onChange, availableSizes, className }: SizeFilterProps) {
  const sizes = availableSizes && availableSizes.length > 0 ? ALL_SIZES.filter(s => availableSizes.includes(s)) : ALL_SIZES

  const toggle = (size: string) => {
    if (selected.includes(size)) {
      onChange(selected.filter(s => s !== size))
    } else {
      onChange([...selected, size])
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text">Size</span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-pink hover:text-pink/80 transition-colors cursor-pointer"
          >
            Clear ({selected.length})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selected.includes(size)
          return (
            <motion.button
              key={size}
              onClick={() => toggle(size)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                'h-10 min-w-[52px] px-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border',
                isSelected
                  ? 'bg-gradient-to-r from-pink to-cyan text-white border-transparent shadow-md shadow-pink/20'
                  : 'bg-card text-text-muted border-border hover:border-text-muted hover:text-text'
              )}
            >
              {size}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
