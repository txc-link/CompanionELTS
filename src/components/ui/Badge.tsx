import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

const badgeVariants = {
  default: 'bg-bg-elevated text-text-secondary border border-border-subtle',
  success: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
  warning: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/25',
  danger: 'bg-danger/15 text-danger border border-danger/25',
  info: 'bg-info/15 text-info border border-info/25',
  new: 'bg-accent-green/20 text-accent-green border border-accent-green/30 animate-pulse',
  hot: 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30',
}

const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'px-3 py-1.5 text-xs',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
  size?: keyof typeof badgeSizes
  dot?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'default' && 'bg-text-muted',
              variant === 'success' && 'bg-accent-green',
              variant === 'warning' && 'bg-accent-gold',
              variant === 'danger' && 'bg-danger',
              variant === 'info' && 'bg-info',
              variant === 'new' && 'bg-accent-green',
              variant === 'hot' && 'bg-accent-amber'
            )}
          />
        )}
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, type BadgeProps }
