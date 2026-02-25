import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'new' | 'preowned' | 'default'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
        {
          'bg-cyan/15 text-cyan border border-cyan/25': variant === 'new',
          'bg-pink/15 text-pink border border-pink/25': variant === 'preowned',
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
  const isNew = condition === 'new'
  return (
    <Badge variant={isNew ? 'new' : 'preowned'}>
      {isNew ? 'New' : 'Preowned'}
    </Badge>
  )
}
