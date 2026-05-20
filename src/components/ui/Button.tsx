import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-accent-green text-bg-primary hover:brightness-110 shadow-[0_4px_14px_rgba(110,197,110,0.25)] active:scale-[0.98]',
          variant === 'secondary' && 'bg-bg-elevated text-text-primary border border-border-accent hover:bg-border-accent',
          variant === 'ghost' && 'bg-transparent text-text-secondary border border-border-subtle hover:bg-bg-elevated hover:text-text-primary',
          variant === 'danger' && 'bg-danger text-white hover:brightness-110',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-[18px] py-[9px] text-xs',
          size === 'lg' && 'px-7 py-3.5 text-sm',
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button, type ButtonProps }
