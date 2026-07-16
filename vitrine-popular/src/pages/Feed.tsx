import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { FiltroCategoria } from '@/components/ofertas/FiltroCategoria'
import { Button, EmptyState, Select } from '@/components/ui'
import type { OrdenacaoOferta } from '@/types'

const PAGE_SIZE = 12

const OPCOES_ORDENACAO: { value: OrdenacaoOferta; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'preco', label: 'Menor preço' },
  { value: 'interacao', label: 'Mais sinalizadas' },
]

export function Feed() {
  const [pagina, setPagina] = useState(0)
  const [categoria, setCategoria] = useState<number | null>(null)
  const [sort, setSort] = useState<OrdenacaoOferta>('recentes')
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const queryClient = useQueryClient()

  const precoMinNum = precoMin.trim() ? Number(precoMin) : undefined
  const precoMaxNum = precoMax.trim() ? Number(precoMax) : undefined

  const queryKey = ['ofertas', 'feed', pagina, categoria, sort, precoMinNum, precoMaxNum]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => ofertasService.listar({
      page: pagina,
      size: PAGE_SIZE,
      sort,
      precoMin: precoMinNum,
      precoMax: precoMaxNum,
      categoriaId: categoria ?? undefined,
    }),
    placeholderData: prev => prev,
  })

  function handleCategoriaChange(id: number | null) {
    setCategoria(id)
    setPagina(0)
  }

  function handleSortChange(value: string) {
    setSort(value as OrdenacaoOferta)
    setPagina(0)
  }

  function handlePrecoMinChange(value: string) {
    setPrecoMin(value)
    setPagina(0)
  }

  function handlePrecoMaxChange(value: string) {
    setPrecoMax(value)
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

      {/* Ordenação e faixa de preço */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <Select
            label="Ordenar por"
            value={sort}
            onChange={e => handleSortChange(e.target.value)}
          >
            {OPCOES_ORDENACAO.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Preço de</label>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="R$ mín."
              value={precoMin}
              onChange={e => handlePrecoMinChange(e.target.value)}
              className="w-28 h-10 rounded-[10px] border text-sm px-3 outline-none"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>até</label>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="R$ máx."
              value={precoMax}
              onChange={e => handlePrecoMaxChange(e.target.value)}
              className="w-28 h-10 rounded-[10px] border text-sm px-3 outline-none"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </div>

      {isLoading ? <OfertaGridSkeleton quantidade={PAGE_SIZE} />
       : isError ? <EmptyState icon={<ShoppingBag size={28} />} titulo="Erro ao carregar ofertas" descricao="Tente novamente." acao={<Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['ofertas'] })}>Tentar novamente</Button>} />
       : !data?.content?.length ? <EmptyState icon={<ShoppingBag size={28} />} titulo="Nenhuma oferta encontrada" descricao="Tente outra categoria, faixa de preço ou volte mais tarde." />
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
