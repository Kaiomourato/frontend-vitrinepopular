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
          <label htmlFor={inputId} className="text-[13px] font-bold text-ink-900">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 rounded-lg border-[1.5px] text-[15px] transition-all outline-none text-ink-900',
              'placeholder:text-ink-500',
              leftIcon ? 'pl-11 pr-4' : 'px-4',
              error
                ? 'border-perigo-600 bg-perigo-50 focus:ring-[3px] focus:ring-perigo-600/25'
                : 'border-sand-300 bg-white hover:border-sand-400 focus:border-terracota-500 focus:ring-[3px] focus:ring-terracota-500/35',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-perigo-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'