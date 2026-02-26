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
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap',
          'active:scale-[0.97] active:transition-transform active:duration-100',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          {
            'bg-[#FF2E88] text-white hover:bg-[#FF5C9A] shadow-lg shadow-[#FF2E88]/20 hover:shadow-[#FF2E88]/30 hover:shadow-xl': variant === 'primary',
            'bg-[#141418] border border-[#1E1E26] text-white hover:bg-[#1A1A22] hover:border-[#2A2A36]': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20': variant === 'destructive',
            'bg-transparent text-[#A0A0B8] hover:text-white hover:bg-white/[0.04]': variant === 'ghost',
            'bg-transparent border border-[#1E1E26] text-white hover:border-[#FF2E88]/40 hover:text-[#FF2E88] hover:shadow-lg hover:shadow-[#FF2E88]/5': variant === 'outline',
          },
          {
            'h-8 px-3.5 text-xs gap-1.5': size === 'sm',
            'h-10 px-5 text-sm gap-2': size === 'md',
            'h-12 px-7 text-[15px] gap-2.5': size === 'lg',
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
