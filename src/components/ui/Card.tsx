import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'stats'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[16px] border border-border-subtle bg-bg-card p-[18px] transition-all duration-200',
          variant === 'interactive' && 'hover:border-border-accent hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer',
          variant === 'stats' && 'relative overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-[14px] flex items-center gap-1.5', className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardTitle }
