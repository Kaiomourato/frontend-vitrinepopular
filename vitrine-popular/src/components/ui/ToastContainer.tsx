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
    success: 'border-l-4 border-mandacaru-600 bg-mandacaru-50 text-mandacaru-700',
    error:   'border-l-4 border-perigo-600 bg-perigo-50 text-perigo-700',
    info:    'border-l-4 border-terracota-500 bg-terracota-50 text-terracota-700',
  }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium motion-safe:animate-toast-in',
            cores[t.tipo]
          )}
        >
          {t.mensagem}
        </div>
      ))}
    </div>
  )
}