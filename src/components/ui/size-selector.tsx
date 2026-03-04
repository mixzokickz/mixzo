'use client'

import { useState } from 'react'
import { SIZE_CATEGORIES, SizeCategory } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SizeSelectorProps {
  value: string
  category: SizeCategory
  onSizeChange: (size: string) => void
  onCategoryChange: (category: SizeCategory) => void
  availableSizes?: string[]
  className?: string
}

const CATEGORY_LABELS: Record<SizeCategory, string> = {
  MEN: 'Men',
  WOMEN: 'Women',
  GS: 'GS',
  PS: 'PS',
  TD: 'TD',
}

export function SizeSelector({ value, category, onSizeChange, onCategoryChange, availableSizes, className }: SizeSelectorProps) {
  const sizes = SIZE_CATEGORIES[category]
  const categories = Object.keys(SIZE_CATEGORIES) as SizeCategory[]

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[10px] font-bold text-[#6A6A80] uppercase tracking-[0.15em]">Size</p>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              onCategoryChange(cat)
              onSizeChange('') // Reset size when category changes
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
              category === cat
                ? 'bg-white text-[#0C0C0C]'
                : 'bg-[#1A1A22] text-[#6A6A80] hover:text-white hover:bg-[#1E1E26] border border-[#1E1E26]'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Size grid */}
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
        {sizes.map(size => {
          const isAvailable = !availableSizes || availableSizes.includes(size)
          const isSelected = value === size
          const prefix = category === 'MEN' ? 'M' : category === 'WOMEN' ? 'W' : category === 'GS' ? 'GS' : category === 'PS' ? 'PS' : 'TD'
          const fullSize = `${prefix} ${size}`

          return (
            <button
              key={size}
              type="button"
              onClick={() => isAvailable && onSizeChange(isSelected ? '' : fullSize)}
              disabled={!isAvailable}
              className={cn(
                'py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-[#FF2E88] text-white ring-1 ring-[#FF2E88]/50'
                  : isAvailable
                    ? 'bg-[#1A1A22] text-[#A0A0B8] hover:text-white hover:bg-[#1E1E26] border border-[#1E1E26]'
                    : 'bg-[#0C0C0C] text-[#2A2A36] border border-[#141418] cursor-not-allowed'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Lightweight size selector for filters (no category prefix in value) */
export function SizeFilterSelector({ value, onSizeChange, className }: { value: string; onSizeChange: (size: string) => void; className?: string }) {
  const [category, setCategory] = useState<SizeCategory>('MEN')
  const sizes = SIZE_CATEGORIES[category]
  const categories = Object.keys(SIZE_CATEGORIES) as SizeCategory[]

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[10px] font-bold text-[#6A6A80] uppercase tracking-[0.15em]">Size</p>
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
              category === cat
                ? 'bg-white text-[#0C0C0C]'
                : 'bg-[#1A1A22] text-[#6A6A80] hover:text-white hover:bg-[#1E1E26] border border-[#1E1E26]'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
        {sizes.map(size => {
          const isSelected = value === size
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(isSelected ? '' : size)}
              className={cn(
                'py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-[#FF2E88] text-white ring-1 ring-[#FF2E88]/50'
                  : 'bg-[#1A1A22] text-[#A0A0B8] hover:text-white hover:bg-[#1E1E26] border border-[#1E1E26]'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
