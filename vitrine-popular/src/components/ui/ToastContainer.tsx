import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ToastType } from './index'

interface ToastItem {
  id: number
  mensagem: string
  tipo: ToastType
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    let counter = 0
    const handler = (e: Event) => {
      const { mensagem, tipo } = (e as CustomEvent).detail
      const id = ++counter
      setToasts(prev => [...prev, { id, mensagem, tipo }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    window.addEventListener('vp:toast', handler)
    return () => window.removeEventListener('vp:toast', handler)
  }, [])

  const cores: Record<ToastType, string> = {
    success: 'border-l-4 border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)]',
    error:   'border-l-4 border-[var(--color-danger)] bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    info:    'border-l-4 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'px-4 py-3 rounded-[10px] shadow-lg text-sm font-medium animate-in slide-in-from-right-4 fade-in',
            cores[t.tipo]
          )}
        >
          {t.mensagem}
        </div>
      ))}
    </div>
  )
}