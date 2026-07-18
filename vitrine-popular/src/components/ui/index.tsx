import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
export { Button } from './Button'

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-bold text-ink-900">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-12 rounded-lg border-[1.5px] text-[15px] px-3.5 transition-all outline-none appearance-none cursor-pointer text-ink-900',
            error
              ? 'border-perigo-600 bg-perigo-50'
              : 'border-sand-300 bg-white hover:border-sand-400 focus:border-terracota-500 focus:ring-[3px] focus:ring-terracota-500/35',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-perigo-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-sand-200 text-ink-900',
    primary: 'bg-terracota-500 text-white',
    success: 'bg-mandacaru-600 text-white',
    warning: 'bg-mel-500 text-mel-900',
    danger:  'bg-perigo-600 text-white',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11.5px] font-bold tracking-wide px-2.5 py-1 rounded-full shadow-sm', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-terracota-500"
      style={{ width: size, height: size }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border bg-white shadow-sm transition-all border-sand-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  titulo: string
  descricao?: string
  acao?: React.ReactNode
}

export function EmptyState({ icon, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-sand-100 text-ink-500">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display font-bold text-lg text-ink-900">{titulo}</p>
        {descricao && <p className="text-sm mt-1 text-ink-700">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}

// ── Toast (notificação simples) ───────────────────────────────────────────────
// Sistema de toast via evento customizado — sem dependências externas
export type ToastType = 'success' | 'error' | 'info'

export function dispararToast(mensagem: string, tipo: ToastType = 'info') {
  window.dispatchEvent(new CustomEvent('vp:toast', { detail: { mensagem, tipo } }))
}