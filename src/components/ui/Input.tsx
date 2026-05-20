import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  textarea?: boolean
}

type CombinedProps = InputProps & Partial<TextareaProps>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[8px] border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all duration-200',
            'focus:border-accent-green focus:shadow-[0_0_0_2px_rgba(110,197,110,0.15)]',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_2px_rgba(232,91,75,0.15)]'
              : 'border-border-subtle',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-text-muted">{helperText}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-[8px] border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all duration-200 resize-y min-h-[80px]',
            'focus:border-accent-green focus:shadow-[0_0_0_2px_rgba(110,197,110,0.15)]',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_2px_rgba(232,91,75,0.15)]'
              : 'border-border-subtle',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-text-muted">{helperText}</span>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
export type { InputProps, TextareaProps, CombinedProps }
