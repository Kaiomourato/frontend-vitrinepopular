import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Search } from 'lucide-react'
import { OfertaCard } from './OfertaCard'
import { OfertaGridSkeleton } from './OfertaGrid'
import { EmptyState, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useColunasGrid } from '@/hooks/useColunasGrid'
import type { OfertaResponse } from '@/types'

const ALTURA_LINHA_ESTIMADA = 340

function agruparEmLinhas<T>(itens: T[], colunas: number): T[][] {
  const linhas: T[][] = []
  for (let i = 0; i < itens.length; i += colunas) {
    linhas.push(itens.slice(i, i + colunas))
  }
  return linhas
}

interface OfertaGridVirtualizadoProps {
  ofertas: OfertaResponse[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  onRetry: () => void
  onVotoAcabou?: () => void
  quantidadeSkeleton?: number
  tituloVazio?: string
  descricaoVazia?: string
}

/**
 * Grade densa e virtualizada com scroll infinito — extraída da Home original
 * (a Home agora é o feed vertical) pra ser reaproveitada em qualquer tela
 * que precise da mesma grade (Busca, categorias vindas de Descobrir).
 */
export function OfertaGridVirtualizado({
  ofertas,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onRetry,
  onVotoAcabou,
  quantidadeSkeleton = 12,
  tituloVazio = 'Nenhum achado por aqui ainda',
  descricaoVazia = 'Tente outra categoria, faixa de preço ou volte mais tarde.',
}: OfertaGridVirtualizadoProps) {
  const colunas = useColunasGrid()
  const parentRef = useRef<HTMLDivElement>(null)

  const linhas = useMemo(() => agruparEmLinhas(ofertas, colunas), [ofertas, colunas])

  const [scrollMargin, setScrollMargin] = useState(0)
  useLayoutEffect(() => {
    setScrollMargin(parentRef.current?.offsetTop ?? 0)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: linhas.length,
    estimateSize: () => ALTURA_LINHA_ESTIMADA,
    overscan: 3,
    scrollMargin,
  })
  const itensVirtuais = virtualizer.getVirtualItems()

  useEffect(() => {
    const ultimo = itensVirtuais[itensVirtuais.length - 1]
    if (!ultimo) return
    if (ultimo.index >= linhas.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [itensVirtuais, linhas.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  const gridColsClass = cn(
    colunas === 5 && 'grid-cols-5',
    colunas === 4 && 'grid-cols-4',
    colunas === 3 && 'grid-cols-3',
    colunas === 2 && 'grid-cols-2'
  )

  if (isLoading) return <OfertaGridSkeleton quantidade={quantidadeSkeleton} />

  if (isError) {
    return (
      <EmptyState
        icon={<Search size={28} />}
        titulo="Não deu pra carregar os achados agora"
        descricao="Confira sua conexão e tente de novo."
        acao={<Button variant="outline" onClick={onRetry}>Tentar novamente</Button>}
      />
    )
  }

  if (!ofertas.length) {
    return <EmptyState icon={<Search size={28} />} titulo={tituloVazio} descricao={descricaoVazia} />
  }

  return (
    <div ref={parentRef}>
      <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
        {itensVirtuais.map(virtualRow => {
          const linha = linhas[virtualRow.index]
          if (!linha) return null
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              <div className={cn('grid gap-3 md:gap-4 pb-3 md:pb-4', gridColsClass)}>
                {linha.map((oferta, i) => (
                  <OfertaCard
                    key={oferta.id}
                    oferta={oferta}
                    index={virtualRow.index * colunas + i}
                    onVotoAcabou={onVotoAcabou}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Carregar mais achados
          </Button>
        </div>
      )}
    </div>
  )
}
