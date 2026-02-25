'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          {
            'bg-gradient-to-r from-pink to-cyan text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-pink/20': variant === 'primary',
            'bg-elevated text-text border border-border hover:bg-card hover:border-text-muted': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
            'bg-transparent text-text-secondary hover:text-text hover:bg-elevated': variant === 'ghost',
            'bg-transparent border border-border text-text hover:border-pink hover:text-pink': variant === 'outline',
          },
          {
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-5 text-sm gap-2': size === 'md',
            'h-12 px-7 text-base gap-2.5': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
export type { ButtonProps }
