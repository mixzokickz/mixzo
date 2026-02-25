'use client'

import { cn } from '@/lib/utils'

interface Tab {
  value: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-xl bg-card border border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            value === tab.value
              ? 'bg-gradient-to-r from-pink to-cyan text-white shadow-md'
              : 'text-text-muted hover:text-text'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
