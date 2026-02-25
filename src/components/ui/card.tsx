import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
}

export function Card({ className, hover, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        glass
          ? 'bg-[#141418]/80 backdrop-blur-xl border border-white/[0.06]'
          : 'bg-[#141418] border border-[#1E1E26]',
        hover && 'hover-lift cursor-pointer hover:border-pink/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
