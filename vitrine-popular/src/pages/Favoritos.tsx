import { Heart } from 'lucide-react'
import { useFavoritos } from '@/hooks/useFavoritos'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { EmptyState } from '@/components/ui'

export function Favoritos() {
  const { favoritos, isLoading } = useFavoritos()

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md font-semibold text-ink-900">Meus favoritos</h1>
        <p className="text-sm mt-0.5 text-ink-700">
          Achados que você salvou para acompanhar
        </p>
      </div>

      {isLoading ? (
        <OfertaGridSkeleton quantidade={8} />
      ) : !favoritos.length ? (
        <EmptyState
          icon={<Heart size={24} />}
          titulo="Nenhum favorito ainda"
          descricao="Toque no coração de um achado para salvá-lo aqui."
        />
      ) : (
        <OfertaGrid ofertas={favoritos} />
      )}
    </div>
  )
}
