import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-0 active:scale-[0.98]'

    const variants = {
      primary:   'bg-terracota-500 text-white shadow-brand hover:bg-terracota-600 active:bg-terracota-700 focus-visible:ring-terracota-500/35',
      secondary: 'bg-terracota-100 text-terracota-700 hover:bg-terracota-200 focus-visible:ring-terracota-500/35',
      ghost:     'bg-transparent text-terracota-600 hover:bg-terracota-50 focus-visible:ring-terracota-500/35',
      danger:    'bg-perigo-600 text-white shadow-md shadow-perigo-600/30 hover:bg-perigo-700 focus-visible:ring-perigo-600/35',
      outline:   'border-[1.5px] border-sand-300 bg-white text-ink-900 shadow-sm hover:bg-sand-100 hover:border-sand-400 focus-visible:ring-sand-300',
    }

    const sizes = {
      sm: 'text-[13px] px-4 h-9',
      md: 'text-[15px] px-[22px] h-11',
      lg: 'text-[17px] px-[30px] h-14',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'