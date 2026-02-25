'use client'

import { cn } from '@/lib/utils'

interface FilterTabsProps {
  label: string
  options: { value: string; label: string }[]
  selected: string
  onChange: (value: string) => void
}

export function FilterTabs({ label, options, selected, onChange }: FilterTabsProps) {
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              selected === opt.value
                ? 'btn-gradient text-white'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
