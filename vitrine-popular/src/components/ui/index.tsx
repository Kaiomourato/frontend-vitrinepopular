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
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 rounded-[10px] border text-sm px-3 transition-all outline-none appearance-none cursor-pointer',
            error
              ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15',
            className
          )}
          style={{ color: 'var(--color-text-primary)' }}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
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
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    danger:  'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  }
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size, color: 'var(--color-primary)' }}
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
        'rounded-[14px] border bg-[var(--color-surface)] transition-all',
        'border-[var(--color-border)]',
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
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-lg" style={{ color: 'var(--color-text-primary)' }}>{titulo}</p>
        {descricao && <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{descricao}</p>}
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