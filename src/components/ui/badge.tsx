import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'new' | 'preowned' | 'like-new' | 'default'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full',
        {
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': variant === 'new',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20': variant === 'preowned',
          'bg-sky-500/10 text-sky-400 border border-sky-500/20': variant === 'like-new',
          'bg-elevated text-text-secondary border border-border': variant === 'default',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function ConditionBadge({ condition }: { condition: string }) {
  const normalized = condition.toLowerCase().trim()
  let variant: BadgeProps['variant'] = 'preowned'
  let label = 'Preowned'

  if (normalized === 'new') {
    variant = 'new'
    label = 'New'
  } else if (normalized === 'like new' || normalized === 'like-new') {
    variant = 'like-new'
    label = 'Like New'
  }

  return <Badge variant={variant}>{label}</Badge>
}
