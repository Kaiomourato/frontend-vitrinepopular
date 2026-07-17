import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingBag, Sparkles } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { FiltroCategoria } from '@/components/ofertas/FiltroCategoria'
import { EmptyState, Button } from '@/components/ui'
import { Input } from '@/components/ui/Input'

export function Busca() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(q)
  const [pagina, setPagina] = useState(0)

  // Reseta o campo/página quando a busca muda (ex.: voltar pelo histórico)
  // ajustando o estado durante o render, sem efeito — evita o
  // encadeamento extra de renders de um setState dentro de useEffect.
  const [qAnterior, setQAnterior] = useState(q)
  if (q !== qAnterior) {
    setQAnterior(q)
    setInputValue(q)
    setPagina(0)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['busca', q, pagina],
    queryFn: () => ofertasService.buscar(q, pagina, 12),
    enabled: q.length > 0,
  })

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() })
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md font-semibold mb-4 text-ink-900">
          {q ? `Resultados para "${q}"` : 'Buscar'}
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

      {!q ? (
        <div className="flex flex-col gap-4">
          <FiltroCategoria categoriaSelecionada={null} onChange={id => {
            navigate(id ? `/?categoria=${id}` : '/')
          }} />
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
        </div>
      ) : isLoading ? (
        <OfertaGridSkeleton quantidade={12} />
      ) : !data?.content?.length ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          titulo={`Nenhum achado para "${q}"`}
          descricao="Tente palavras diferentes ou termos mais simples."
        />
      ) : (
        <>
          <p className="text-sm text-ink-700">
            {data.page.totalElements} achado{data.page.totalElements !== 1 ? 's' : ''} encontrado{data.page.totalElements !== 1 ? 's' : ''}
          </p>
          <OfertaGrid ofertas={data.content} />
          {data.page.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={data.page.number === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
              <span className="text-sm px-3 text-ink-700">{data.page.number + 1} / {data.page.totalPages}</span>
              <Button variant="outline" size="sm" disabled={data.page.number + 1 >= data.page.totalPages} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
