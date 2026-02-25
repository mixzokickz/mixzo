'use client'

import { cn } from '@/lib/utils'

interface FilterTab {
  value: string
  label: string
}

interface FilterTabsProps {
  tabs: FilterTab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function FilterTabs({ tabs, value, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border',
            value === tab.value
              ? 'bg-gradient-to-r from-pink to-cyan text-white border-transparent shadow-lg shadow-pink/15'
              : 'bg-card text-text-muted border-border hover:border-text-muted hover:text-text'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
