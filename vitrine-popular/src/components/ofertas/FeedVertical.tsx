import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { RefreshCw, Search } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { CardFeedVertical } from '@/components/ofertas/CardFeedVertical'
import { EmptyState, Button } from '@/components/ui'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { cn } from '@/lib/utils'
import type { OfertaResponse } from '@/types'

const PAGE_SIZE = 8
// Altura do Navbar (h-16, constante em qualquer breakpoint) — os cards
// preenchem o resto do viewport pra fechar o "uma tela = um achado".
const ALTURA_NAVBAR = 64

/**
 * Feed vertical estilo "rolar e ver o que apareceu hoje" — só pro mobile
 * (ver Feed.tsx: telas maiores usam a grade densa, igual Busca/Descobrir).
 */
export function FeedVertical() {
  const queryClient = useQueryClient()
  const parentRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ofertas', 'feed-vertical'],
    queryFn: ({ pageParam }) =>
      ofertasService.listar({ page: pageParam, size: PAGE_SIZE, sort: 'recentes' }),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page.number + 1 < lastPage.page.totalPages ? lastPage.page.number + 1 : undefined,
  })

  const ofertas: OfertaResponse[] = useMemo(
    () => data?.pages.flatMap(p => p.content) ?? [],
    [data]
  )

  const [scrollMargin, setScrollMargin] = useState(0)
  useLayoutEffect(() => {
    setScrollMargin(parentRef.current?.offsetTop ?? 0)
  }, [])

  // Scroll-snap escopado a esta tela — liga ao montar, desliga ao sair.
  useEffect(() => {
    document.documentElement.classList.add('feed-vertical-scroll')
    return () => document.documentElement.classList.remove('feed-vertical-scroll')
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: ofertas.length,
    estimateSize: () => window.innerHeight - ALTURA_NAVBAR,
    overscan: 2,
    scrollMargin,
  })
  const itensVirtuais = virtualizer.getVirtualItems()

  // Carrega a próxima página quando o card virtualizado atual está perto do fim
  useEffect(() => {
    const ultimo = itensVirtuais[itensVirtuais.length - 1]
    if (!ultimo) return
    if (ultimo.index >= ofertas.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [itensVirtuais, ofertas.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  function invalidarFeed() {
    return queryClient.invalidateQueries({ queryKey: ['ofertas'] })
  }

  const { puxao, atualizando, limiar } = usePullToRefresh(async () => {
    await refetch()
  })

  if (isLoading) {
    return <div style={{ height: `calc(100dvh - ${ALTURA_NAVBAR}px)` }} className="w-full animate-pulse bg-sand-100" />
  }

  if (isError) {
    return (
      <div style={{ height: `calc(100dvh - ${ALTURA_NAVBAR}px)` }} className="container-app flex items-center justify-center">
        <EmptyState
          icon={<Search size={28} />}
          titulo="Não deu pra carregar os achados agora"
          descricao="Confira sua conexão e tente de novo."
          acao={<Button variant="outline" onClick={() => invalidarFeed()}>Tentar novamente</Button>}
        />
      </div>
    )
  }

  if (!ofertas.length) {
    return (
      <div style={{ height: `calc(100dvh - ${ALTURA_NAVBAR}px)` }} className="container-app flex items-center justify-center">
        <EmptyState
          icon={<Search size={28} />}
          titulo="Nenhum achado por aqui ainda"
          descricao="Volte mais tarde pra ver o que apareceu no comércio de Picos-PI."
        />
      </div>
    )
  }

  return (
    <div ref={parentRef}>
      {/* Indicador de puxar-para-atualizar */}
      <div
        aria-hidden="true"
        className="fixed top-16 inset-x-0 z-40 flex items-center justify-center overflow-hidden transition-[height] motion-reduce:transition-none"
        style={{ height: atualizando ? 48 : puxao }}
      >
        <RefreshCw
          size={20}
          className={cn('text-white drop-shadow', atualizando && 'motion-safe:animate-spin')}
          style={{ transform: atualizando ? undefined : `rotate(${(puxao / limiar) * 180}deg)` }}
        />
      </div>

      <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
        {itensVirtuais.map(virtualRow => {
          const oferta = ofertas[virtualRow.index]
          if (!oferta) return null
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full snap-start snap-always"
              style={{
                height: `calc(100dvh - ${ALTURA_NAVBAR}px)`,
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              <CardFeedVertical
                oferta={oferta}
                onVoto={invalidarFeed}
                primeiro={virtualRow.index === 0}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
