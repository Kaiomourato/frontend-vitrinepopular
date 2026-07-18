import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Sparkles } from 'lucide-react'
import { useOfertasInfinitas } from '@/hooks/useOfertasInfinitas'
import { OfertaGridVirtualizado } from '@/components/ofertas/OfertaGridVirtualizado'
import { FiltroCategoria } from '@/components/ofertas/FiltroCategoria'
import { EmptyState, Button, Select } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import type { OrdenacaoOferta } from '@/types'

const OPCOES_ORDENACAO: { value: OrdenacaoOferta; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'preco', label: 'Menor preço' },
  { value: 'interacao', label: 'Mais sinalizadas' },
]

// Grade densa e filtrável — é aqui que quem já sabe o que quer resolve
// (a Home é o feed vertical de descoberta, sem filtro nenhum).
export function Busca() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoriaParam = searchParams.get('categoria')
  const categoriaId = categoriaParam ? Number(categoriaParam) : null
  const [inputValue, setInputValue] = useState(q)
  const [sort, setSort] = useState<OrdenacaoOferta>('recentes')
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')

  // Reseta o campo/estado quando a busca muda por fora (ex.: voltar pelo
  // histórico) ajustando o estado durante o render, sem efeito.
  const [qAnterior, setQAnterior] = useState(q)
  if (q !== qAnterior) {
    setQAnterior(q)
    setInputValue(q)
  }

  const precoMinNum = precoMin.trim() ? Number(precoMin) : undefined
  const precoMaxNum = precoMax.trim() ? Number(precoMax) : undefined
  const temFiltro = !!q || categoriaId !== null

  const {
    ofertas,
    total,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useOfertasInfinitas({
    q: q || undefined,
    categoriaId,
    sort,
    precoMin: precoMinNum,
    precoMax: precoMaxNum,
    enabled: temFiltro,
  })

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() })
  }

  function handleCategoria(id: number | null) {
    setSearchParams(id ? { categoria: String(id) } : {})
  }

  function invalidar() {
    return queryClient.invalidateQueries({ queryKey: ['ofertas-infinitas'] })
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md font-semibold mb-4 text-ink-900">
          {q ? `Resultados para "${q}"` : temFiltro ? 'Explorar categoria' : 'Buscar'}
        </h1>
        <form onSubmit={handleBusca} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="O que você procura hoje?"
              leftIcon={<Search size={16} />}
              className="h-11"
              autoFocus
            />
          </div>
          <Button type="submit" className="h-11">Buscar</Button>
        </form>
      </div>

      <FiltroCategoria categoriaSelecionada={q ? null : categoriaId} onChange={handleCategoria} />

      {!temFiltro ? (
        <EmptyState
          icon={<Search size={24} />}
          titulo="Digite algo ou explore por categoria"
          descricao="Encontre um achado específico do comércio local."
          acao={
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-terracota-600 hover:underline"
            >
              <Sparkles size={14} />
              Não sei o que procurar — ver achados do dia
            </Link>
          }
        />
      ) : (
        <>
          {!q && (
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
          )}

          {!isLoading && !isError && (
            <p className="text-sm text-ink-700">
              {total} achado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
          )}

          <OfertaGridVirtualizado
            ofertas={ofertas}
            isLoading={isLoading}
            isError={isError}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            onRetry={() => refetch()}
            onVotoAcabou={invalidar}
            tituloVazio={q ? `Nenhum achado para "${q}"` : 'Nenhum achado por aqui ainda'}
            descricaoVazia={q ? 'Tente palavras diferentes ou termos mais simples.' : 'Tente outra categoria ou volte mais tarde.'}
          />
        </>
      )}
    </div>
  )
}
