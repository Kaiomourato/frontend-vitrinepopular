import { Heart } from 'lucide-react'
import { useFavoritos } from '@/hooks/useFavoritos'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { EmptyState } from '@/components/ui'

export function Favoritos() {
  const { favoritos, isLoading } = useFavoritos()

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Meus favoritos</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Ofertas que você salvou para acompanhar
        </p>
      </div>

      {isLoading ? (
        <OfertaGridSkeleton quantidade={8} />
      ) : !favoritos.length ? (
        <EmptyState
          icon={<Heart size={24} />}
          titulo="Nenhum favorito ainda"
          descricao="Toque no coração de uma oferta para salvá-la aqui."
        />
      ) : (
        <OfertaGrid ofertas={favoritos} />
      )}
    </div>
  )
}
