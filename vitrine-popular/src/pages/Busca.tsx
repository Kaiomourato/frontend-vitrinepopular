import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingBag } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { EmptyState, Button } from '@/components/ui'

export function Busca() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(q)
  const [pagina, setPagina] = useState(0)

  useEffect(() => { setInputValue(q); setPagina(0) }, [q])

  const { data, isLoading } = useQuery({
    queryKey: ['busca', q, pagina],
    queryFn: () => ofertasService.buscar(q, pagina, 12),
    enabled: q.length > 0,
  })

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    }
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      {/* Campo de busca */}
      <div>
        <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {q ? `Resultados para "${q}"` : 'Buscar ofertas'}
        </h1>
        <form onSubmit={handleBusca} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Nome do produto ou promoção..."
              className="w-full h-11 pl-10 pr-4 rounded-[10px] border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              autoFocus
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </div>

      {/* Resultados */}
      {!q ? (
        <EmptyState
          icon={<Search size={24} />}
          titulo="Digite algo para buscar"
          descricao="Encontre produtos e promoções do comércio local."
        />
      ) : isLoading ? (
        <OfertaGridSkeleton quantidade={12} />
      ) : !data?.content?.length ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          titulo={`Nenhum resultado para "${q}"`}
          descricao="Tente palavras diferentes ou termos mais simples."
        />
      ) : (
        <>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {data.totalElements} oferta{data.totalElements !== 1 ? 's' : ''} encontrada{data.totalElements !== 1 ? 's' : ''}
          </p>
          <OfertaGrid ofertas={data.content} />
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
              <span className="text-sm px-3" style={{ color: 'var(--color-text-secondary)' }}>{data.number + 1} / {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}