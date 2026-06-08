import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { FiltroCategoria } from '@/components/ofertas/FiltroCategoria'
import { Button, EmptyState } from '@/components/ui'

const PAGE_SIZE = 12

export function Feed() {
  const [pagina, setPagina] = useState(0)
  const [categoria, setCategoria] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const queryKey = categoria
    ? ['ofertas', 'categoria', categoria, pagina]
    : ['ofertas', 'feed', pagina]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => categoria
      ? ofertasService.porCategoria(categoria, pagina, PAGE_SIZE)
      : ofertasService.listar(pagina, PAGE_SIZE),
    placeholderData: prev => prev,
  })

  function handleCategoriaChange(id: number | null) {
    setCategoria(id)
    setPagina(0)
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div className="rounded-[20px] px-6 py-8 md:py-12 text-center" style={{ background: 'var(--color-primary-light)' }}>
        <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          A vitrine da sua cidade
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Ofertas e promoções do comércio local em um só lugar
        </p>
      </div>
      <FiltroCategoria categoriaSelecionada={categoria} onChange={handleCategoriaChange} />
      {isLoading ? <OfertaGridSkeleton quantidade={PAGE_SIZE} />
       : isError ? <EmptyState icon={<ShoppingBag size={28} />} titulo="Erro ao carregar ofertas" descricao="Tente novamente." acao={<Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['ofertas'] })}>Tentar novamente</Button>} />
       : !data?.content?.length ? <EmptyState icon={<ShoppingBag size={28} />} titulo="Nenhuma oferta encontrada" descricao="Tente outra categoria ou volte mais tarde." />
       : <OfertaGrid ofertas={data.content} onVotoAcabou={() => queryClient.invalidateQueries({ queryKey: ['ofertas'] })} />
      }
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
          <span className="text-sm px-3" style={{ color: 'var(--color-text-secondary)' }}>{data.number + 1} / {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  )
}