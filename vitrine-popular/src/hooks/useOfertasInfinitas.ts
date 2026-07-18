import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ofertasService } from '@/services/ofertas'
import type { OrdenacaoOferta, OfertaResponse } from '@/types'

interface UseOfertasInfinitasParams {
  /** Busca textual — quando presente, ignora categoria/ordenação/preço (o endpoint de busca não os aceita). */
  q?: string
  categoriaId?: number | null
  sort?: OrdenacaoOferta
  precoMin?: number
  precoMax?: number
  size?: number
  enabled?: boolean
}

/**
 * Grade infinita de ofertas — extraído da Home original (Fase 2 trocou a Home
 * por um feed vertical) pra ser reaproveitado em qualquer tela que precise da
 * mesma grade densa e paginada (Busca, categorias de Descobrir).
 */
export function useOfertasInfinitas({
  q,
  categoriaId,
  sort,
  precoMin,
  precoMax,
  size = 12,
  enabled = true,
}: UseOfertasInfinitasParams) {
  const query = useInfiniteQuery({
    queryKey: ['ofertas-infinitas', q, categoriaId, sort, precoMin, precoMax, size],
    queryFn: ({ pageParam }) =>
      q
        ? ofertasService.buscar(q, pageParam, size)
        : ofertasService.listar({
            page: pageParam,
            size,
            sort,
            precoMin,
            precoMax,
            categoriaId: categoriaId ?? undefined,
          }),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page.number + 1 < lastPage.page.totalPages ? lastPage.page.number + 1 : undefined,
    enabled,
  })

  const ofertas: OfertaResponse[] = useMemo(
    () => query.data?.pages.flatMap(p => p.content) ?? [],
    [query.data]
  )
  const total = query.data?.pages[0]?.page.totalElements ?? 0

  return { ...query, ofertas, total }
}
