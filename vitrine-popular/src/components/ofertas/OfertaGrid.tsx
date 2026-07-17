import { OfertaCard } from './OfertaCard'
import type { OfertaResponse } from '@/types'

interface OfertaGridProps {
  ofertas: OfertaResponse[]
  onVotoAcabou?: () => void
}

export function OfertaGrid({ ofertas, onVotoAcabou }: OfertaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {ofertas.map((oferta, i) => (
        <OfertaCard key={oferta.id} oferta={oferta} onVotoAcabou={onVotoAcabou} index={i} />
      ))}
    </div>
  )
}

// Skeleton enquanto carrega
export function OfertaGridSkeleton({ quantidade = 10 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="rounded-lg border border-sand-200 overflow-hidden">
          <div className="aspect-square animate-pulse bg-sand-100" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-4 rounded animate-pulse w-3/4 bg-sand-100" />
            <div className="h-3 rounded animate-pulse w-1/2 bg-sand-100" />
            <div className="h-5 rounded animate-pulse w-1/3 bg-sand-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
