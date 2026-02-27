'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BrandFilterProps {
  brands: string[]
  selected: string[]
  onChange: (brands: string[]) => void
  className?: string
}

export function BrandFilter({ brands, selected, onChange, className }: BrandFilterProps) {
  const toggle = (brand: string) => {
    if (selected.includes(brand)) {
      onChange(selected.filter(b => b !== brand))
    } else {
      onChange([...selected, brand])
    }
  }

  if (brands.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text">Brand</span>
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
        {brands.map((brand) => {
          const isSelected = selected.includes(brand)
          return (
            <motion.button
              key={brand}
              onClick={() => toggle(brand)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                'h-9 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border',
                isSelected
                  ? 'bg-gradient-to-r from-pink to-cyan text-white border-transparent shadow-md shadow-pink/20'
                  : 'bg-card text-text-muted border-border hover:border-text-muted hover:text-text'
              )}
            >
              {brand}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
