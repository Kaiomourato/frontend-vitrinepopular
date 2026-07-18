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
          <label htmlFor={inputId} className="text-sm font-medium text-ink-900">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[10px] border text-sm px-4 py-3 transition-all outline-none resize-none text-ink-900',
            'placeholder:text-ink-500',
            error
              ? 'border-perigo-600 bg-perigo-50 focus:ring-2 focus:ring-perigo-600/20'
              : 'border-sand-200 bg-white focus:border-terracota-500 focus:ring-2 focus:ring-terracota-500/15',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-perigo-600">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'