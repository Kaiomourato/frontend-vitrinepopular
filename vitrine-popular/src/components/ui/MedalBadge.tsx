import { Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Medalha } from '@/types'

const TIER: Record<Medalha, { bg: string; text: string; label: string }> = {
  OURO:   { bg: 'bg-mel-500',      text: 'text-mel-900',      label: 'Ouro' },
  PRATA:  { bg: 'bg-sand-300',     text: 'text-ink-900',      label: 'Prata' },
  BRONZE: { bg: 'bg-queimado-400', text: 'text-queimado-900', label: 'Bronze' },
}

interface MedalBadgeProps {
  medalha: Medalha
  tamanho?: 'sm' | 'md'
  comLabel?: boolean
  className?: string
}

/** Selo hexagonal de medalha — mesma linguagem geométrica do favo de mel da marca. */
export function MedalBadge({ medalha, tamanho = 'sm', comLabel = false, className }: MedalBadgeProps) {
  const tier = TIER[medalha]
  const dimensao = tamanho === 'sm' ? 28 : 36
  const iconSize = tamanho === 'sm' ? 13 : 17

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn('shrink-0 flex items-center justify-center', tier.bg, tier.text)}
        style={{
          width: dimensao,
          height: dimensao,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
        title={tier.label}
      >
        <Medal size={iconSize} strokeWidth={2} />
      </span>
      {comLabel && <span className="text-xs font-semibold text-ink-900">{tier.label}</span>}
    </span>
  )
}
