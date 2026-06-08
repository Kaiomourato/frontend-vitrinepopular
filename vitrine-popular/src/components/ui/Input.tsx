import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-[10px] border text-sm transition-all outline-none',
              'placeholder:text-[var(--color-text-muted)]',
              leftIcon ? 'pl-10 pr-4' : 'px-4',
              error
                ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)] focus:ring-2 focus:ring-[var(--color-danger)]/20'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15',
              className
            )}
            style={{ color: 'var(--color-text-primary)' }}
            {...props}
          />
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'