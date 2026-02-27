'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SizeFilter } from './size-filter'
import { BrandFilter } from './brand-filter'
import { FilterTabs } from './filter-tabs'

interface FilterPanelProps {
  condition: string
  onConditionChange: (v: string) => void
  selectedSizes: string[]
  onSizesChange: (sizes: string[]) => void
  selectedBrands: string[]
  onBrandsChange: (brands: string[]) => void
  availableBrands: string[]
  availableSizes?: string[]
  sort: string
  onSortChange: (v: string) => void
  totalCount: number
  className?: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
]

export function FilterPanel({
  condition, onConditionChange,
  selectedSizes, onSizesChange,
  selectedBrands, onBrandsChange,
  availableBrands, availableSizes,
  sort, onSortChange,
  totalCount, className,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const activeFilterCount = selectedSizes.length + selectedBrands.length + (condition !== 'all' ? 1 : 0)

  const clearAll = () => {
    onConditionChange('all')
    onSizesChange([])
    onBrandsChange([])
    onSortChange('newest')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top row: condition tabs + filter toggle + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FilterTabs
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'new', label: 'New' },
            { value: 'used', label: 'Preowned' },
          ]}
          value={condition}
          onChange={onConditionChange}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer border',
              expanded || activeFilterCount > 0
                ? 'bg-pink/10 text-pink border-pink/30'
                : 'bg-card text-text-secondary border-border hover:border-text-muted'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
          </motion.button>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 px-3 rounded-xl bg-card border border-border text-sm text-text-secondary focus:outline-none focus:border-pink/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable filter panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5">
              <SizeFilter
                selected={selectedSizes}
                onChange={onSizesChange}
                availableSizes={availableSizes}
              />
              <BrandFilter
                brands={availableBrands}
                selected={selectedBrands}
                onChange={onBrandsChange}
              />
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm text-text-muted">{totalCount} results</p>
                  <button
                    onClick={clearAll}
                    className="text-sm text-pink hover:text-pink/80 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
