import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, MapPin, Hexagon } from 'lucide-react'
import logo from '@/assets/logo.png'
import { useAuthStore } from '@/store/authStore'
import { useOfertasInfinitas } from '@/hooks/useOfertasInfinitas'
import { categoriasService, lojasService } from '@/services/lojas'
import { gamificacaoService } from '@/services/gamificacao'
import { OfertaGridVirtualizado } from '@/components/ofertas/OfertaGridVirtualizado'

const PAGE_SIZE = 12


export function Feed() {
  const queryClient = useQueryClient()
  const {
    ofertas,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useOfertasInfinitas({ sort: 'recentes', size: PAGE_SIZE })

  function invalidar() {
    return queryClient.invalidateQueries({ queryKey: ['ofertas-infinitas'] })
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <HomeHeader />
      <CategoryChips />
      <StoresSection />

      <div className="container-app flex flex-col gap-4">
        <h2 className="font-display text-display-sm font-extrabold text-ink-900">Achados do dia</h2>

        <OfertaGridVirtualizado
          ofertas={ofertas}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onRetry={() => refetch()}
          onVotoAcabou={invalidar}
          quantidadeSkeleton={PAGE_SIZE}
          descricaoVazia="Volte mais tarde pra ver o que apareceu no comércio de Picos-PI."
        />
      </div>
    </div>
  )
}

function HomeHeader() {
  const navigate = useNavigate()
  const { isAutenticado, usuario } = useAuthStore()
  const [busca, setBusca] = useState('')

  const { data: gamificacao } = useQuery({
    queryKey: ['gamificacao', usuario?.id],
    queryFn: () => gamificacaoService.buscarPorUsuario(usuario!.id),
    enabled: !!usuario?.id,
  })

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    if (busca.trim()) navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
  }

  return (
    <div className="relative overflow-hidden bg-ink-900 px-4 pt-5 pb-7 md:rounded-b-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 bg-mel-500/15"
        style={{ clipPath: 'var(--hex-clip)' }}
      />
      <div className="relative container-app !px-0 flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center shrink-0 text-terracota-500">
              <img
                src={logo}
                alt="Vitrine Popular"
                className="h-14 w-auto"
              />
            </Link>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-mel-400">Você está no</p>
              <p className="flex items-center gap-1.5 font-display font-extrabold text-[17px] text-white">
                <MapPin size={16} /> Centro, Picos-PI
              </p>
            </div>
          </div>
        </div>

        {isAutenticado && gamificacao ? (
          <Link
            to="/perfil"
            className="flex items-center gap-1.5 bg-mel-500/15 text-mel-400 font-rounded font-bold text-[13px] px-3 py-1.5 rounded-full shrink-0"
          >
            <Hexagon size={14} className="fill-current" />
            {gamificacao.contribuicoesAprovadas}
          </Link>
        ) : !isAutenticado ? (
          <Link
            to="/login"
            className="md:hidden text-xs font-bold text-white px-3 py-1.5 rounded-full border-[1.5px] border-white/25 shrink-0"
          >
            Entrar
          </Link>
        ) : null}
      </div>

      <form onSubmit={handleBusca} className="relative container-app !px-0 flex items-center gap-2 bg-white rounded-full h-[50px] pl-[18px] pr-1.5 shadow-sm">
        <Search size={20} className="text-terracota-500 shrink-0 ml-3" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="O que você procura hoje?"
          className="flex-1 min-w-0 h-full outline-none border-none bg-transparent text-[15px] font-medium text-ink-900 placeholder:text-ink-500 placeholder:font-normal"
        />
        <button type="submit" className="shrink-0 h-[38px] px-[20px] rounded-full bg-terracota-500 text-white font-bold text-sm transition-colors hover:bg-terracota-100 mr-3">
          Buscar
        </button>
      </form>
    </div>
  )
}

function CategoryChips() {
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  if (!categorias.length) return null

  return (
    <div className="container-app">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
        {categorias.map(cat => (
          <Link
            key={cat.id}
            to={`/busca?categoria=${cat.id}`}
            className="shrink-0 h-[34px] inline-flex items-center font-rounded font-semibold text-[13px] px-3.5 rounded-full border-[1.5px] border-sand-300 bg-white text-ink-700 transition-all hover:border-terracota-400 hover:bg-terracota-50 active:scale-95"
          >
            {cat.nome}
          </Link>
        ))}
      </div>
    </div>
  )
}

function StoresSection() {
  const { data: lojas = [] } = useQuery({
    queryKey: ['lojas'],
    queryFn: lojasService.listar,
    staleTime: 60 * 1000,
  })

  if (!lojas.length) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="container-app font-display text-display-sm font-extrabold text-ink-900">Lojas do centro</h2>
      <div className="container-app">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1 scrollbar-none">
          <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
          {lojas.map(loja => (
            <Link
              key={loja.id}
              to={`/loja/${loja.id}`}
              className="shrink-0 w-32 flex flex-col items-center gap-2 rounded-xl border border-sand-200 bg-white shadow-sm p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="w-12 h-12 flex items-center justify-center font-rounded font-bold text-[15px] text-white bg-gradient-to-br from-terracota-400 to-mel-400"
                style={{ clipPath: 'var(--hex-clip)' }}
              >
                {loja.nome[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[13px] font-bold text-ink-900 truncate">{loja.nome}</p>
                {loja.endereco && <p className="text-[11px] text-ink-500 truncate">{loja.endereco}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
