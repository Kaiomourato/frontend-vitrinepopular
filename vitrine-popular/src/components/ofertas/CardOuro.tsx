import { useRef, useState } from 'react'
import { Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardOuroProps {
  /** Quando falso, repassa os children sem nenhum custo extra. */
  ativo: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper de destaque dourado pra "Achado de Ouro". Em ponteiro fino com
 * hover (mouse/trackpad), inclina o card e segue um brilho radial no
 * ponteiro — escrito direto no DOM via ref (sem re-render por movimento).
 * Em touch fica só o brilho estático. Sob prefers-reduced-motion, nenhum
 * transform roda — sobra só a borda/selo dourado.
 */
export function CardOuro({ ativo, children, className }: CardOuroProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Capacidade do dispositivo não muda durante a sessão — lida uma vez, sem efeito.
  const [podeInclinar] = useState(
    () =>
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  if (!ativo) return <>{children}</>

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!podeInclinar) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`)
    el.style.setProperty('--tilt-y', `${(x - 0.5) * 8}deg`)
    el.style.setProperty('--sheen-x', `${x * 100}%`)
    el.style.setProperty('--sheen-y', `${y * 100}%`)
    el.style.setProperty('--sheen-opacity', '1')
  }

  function handlePointerLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--sheen-opacity', '0')
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'relative rounded-lg ring-2 ring-mel-400 [perspective:800px] motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out',
        className
      )}
      style={{
        boxShadow: '0 8px 22px -6px rgba(224, 163, 16, 0.35)',
        transform: podeInclinar ? 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' : undefined,
      }}
    >
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden"
        style={{
          opacity: podeInclinar ? 'var(--sheen-opacity, 0)' : 0.35,
          background: podeInclinar
            ? 'radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 50%), rgba(255,255,255,0.55), transparent 55%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.45), transparent 45%)',
          transition: podeInclinar ? 'opacity 150ms ease-out' : undefined,
        }}
      />
    </div>
  )
}

/** Selo compacto de "Achado de Ouro" — o card usa CardOuro, o layout de cada tela decide onde encaixar o selo. */
export function SeloOuro({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-mel-500 px-2 py-0.5 text-[10px] font-semibold text-mel-900 shadow-sm',
        className
      )}
    >
      <Hexagon size={11} strokeWidth={2.2} fill="currentColor" className="text-mel-900/25" />
      Achado de Ouro
    </span>
  )
}
