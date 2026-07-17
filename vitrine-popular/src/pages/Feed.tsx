import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { RefreshCw, Search, Sparkles } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { OfertaCard } from '@/components/ofertas/OfertaCard'
import { OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { FiltroCategoria } from '@/components/ofertas/FiltroCategoria'
import { Button, EmptyState, Select } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useColunasGrid } from '@/hooks/useColunasGrid'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import type { OrdenacaoOferta, OfertaResponse } from '@/types'

const PAGE_SIZE = 12
const ALTURA_LINHA_ESTIMADA = 340

const OPCOES_ORDENACAO: { value: OrdenacaoOferta; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'preco', label: 'Menor preço' },
  { value: 'interacao', label: 'Mais sinalizadas' },
]

function agruparEmLinhas<T>(itens: T[], colunas: number): T[][] {
  const linhas: T[][] = []
  for (let i = 0; i < itens.length; i += colunas) {
    linhas.push(itens.slice(i, i + colunas))
  }
  return linhas
}

export function Feed() {
  const [categoria, setCategoria] = useState<number | null>(null)
  const [sort, setSort] = useState<OrdenacaoOferta>('recentes')
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const queryClient = useQueryClient()
  const colunas = useColunasGrid()
  const parentRef = useRef<HTMLDivElement>(null)

  const precoMinNum = precoMin.trim() ? Number(precoMin) : undefined
  const precoMaxNum = precoMax.trim() ? Number(precoMax) : undefined

  const queryKey = ['ofertas', 'feed', categoria, sort, precoMinNum, precoMaxNum]

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      ofertasService.listar({
        page: pageParam,
        size: PAGE_SIZE,
        sort,
        precoMin: precoMinNum,
        precoMax: precoMaxNum,
        categoriaId: categoria ?? undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page.number + 1 < lastPage.page.totalPages ? lastPage.page.number + 1 : undefined,
  })

  const ofertas: OfertaResponse[] = useMemo(
    () => data?.pages.flatMap(p => p.content) ?? [],
    [data]
  )
  const linhas = useMemo(() => agruparEmLinhas(ofertas, colunas), [ofertas, colunas])

  // offsetTop só é conhecido depois de montar — medir em vez de ler
  // parentRef.current durante o render (evita acesso a ref em render).
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

  // Carrega a próxima página quando a última linha renderizada está perto do fim
  useEffect(() => {
    const ultimo = itensVirtuais[itensVirtuais.length - 1]
    if (!ultimo) return
    if (ultimo.index >= linhas.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [itensVirtuais, linhas.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  function invalidarFeed() {
    return queryClient.invalidateQueries({ queryKey: ['ofertas'] })
  }

  const { puxao, atualizando, limiar } = usePullToRefresh(async () => {
    await refetch()
  })

  const gridColsClass = cn(
    colunas === 5 && 'grid-cols-5',
    colunas === 4 && 'grid-cols-4',
    colunas === 3 && 'grid-cols-3',
    colunas === 2 && 'grid-cols-2'
  )

  return (
    <div className="container-app py-6 flex flex-col gap-6" ref={parentRef}>
      {/* Indicador de puxar-para-atualizar */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center overflow-hidden transition-[height] motion-reduce:transition-none"
        style={{ height: atualizando ? 48 : puxao }}
      >
        <RefreshCw
          size={20}
          className={cn(
            'text-terracota-600',
            atualizando && 'motion-safe:animate-spin'
          )}
          style={{ transform: atualizando ? undefined : `rotate(${(puxao / limiar) * 180}deg)` }}
        />
      </div>

      <div className="rounded-xl px-6 py-8 md:py-12 text-center bg-terracota-50">
        <h1 className="font-display text-display-lg font-semibold mb-2 text-terracota-700">
          Achados do dia
        </h1>
        <p className="text-sm md:text-base text-ink-700">
          O que apareceu no comércio de Picos-PI para você conferir agora.
        </p>
      </div>

      <FiltroCategoria categoriaSelecionada={categoria} onChange={setCategoria} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <Select label="Ordenar por" value={sort} onChange={e => setSort(e.target.value as OrdenacaoOferta)}>
            {OPCOES_ORDENACAO.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Input
            label="Preço de"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="R$ mín."
            value={precoMin}
            onChange={e => setPrecoMin(e.target.value)}
            className="w-28"
          />
          <Input
            label="até"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="R$ máx."
            value={precoMax}
            onChange={e => setPrecoMax(e.target.value)}
            className="w-28"
          />
        </div>
      </div>

      {isLoading ? (
        <OfertaGridSkeleton quantidade={PAGE_SIZE} />
      ) : isError ? (
        <EmptyState
          icon={<Search size={28} />}
          titulo="Não deu pra carregar os achados agora"
          descricao="Confira sua conexão e tente de novo."
          acao={<Button variant="outline" onClick={() => invalidarFeed()}>Tentar novamente</Button>}
        />
      ) : !ofertas.length ? (
        <EmptyState
          icon={<Search size={28} />}
          titulo="Nenhum achado por aqui ainda"
          descricao="Tente outra categoria, faixa de preço ou volte mais tarde."
        />
      ) : (
        <>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
            <Sparkles size={13} className="text-mel-600" />
            Acabou de aparecer
          </p>

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
                        onVotoAcabou={invalidarFeed}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fallback manual — cobre quando o auto-scroll não dispara (teclado, leitor de tela, etc.) */}
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                Carregar mais achados
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
