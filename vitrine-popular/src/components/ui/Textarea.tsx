import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[10px] border text-sm px-4 py-3 transition-all outline-none resize-none',
            'placeholder:text-[var(--color-text-muted)]',
            error
              ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)] focus:ring-2 focus:ring-[var(--color-danger)]/20'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15',
            className
          )}
          style={{ color: 'var(--color-text-primary)' }}
          {...props}
        />
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'