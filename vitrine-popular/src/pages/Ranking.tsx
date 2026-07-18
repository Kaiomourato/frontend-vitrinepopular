import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Users, Store, Heart, Medal } from 'lucide-react'
import { rankingService } from '@/services/ranking'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { EmptyState, Badge } from '@/components/ui'
import { MedalBadge } from '@/components/ui/MedalBadge'
import { posicaoParaMedalha } from '@/lib/ranking'
import { cn } from '@/lib/utils'

type Aba = 'colaboradores' | 'lojas' | 'ofertas'

const ABAS: { value: Aba; label: string; icon: typeof Users }[] = [
  { value: 'colaboradores', label: 'Colaboradores', icon: Users },
  { value: 'lojas', label: 'Lojas', icon: Store },
  { value: 'ofertas', label: 'Ofertas', icon: Heart },
]

function ListaSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-sand-100" />
      ))}
    </div>
  )
}

function PosicaoBadge({ posicao }: { posicao: number }) {
  const medalha = posicaoParaMedalha(posicao)
  if (medalha) return <MedalBadge medalha={medalha} />
  return (
    <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-sand-100 text-ink-700">
      {posicao + 1}
    </span>
  )
}

export function Ranking() {
  const [aba, setAba] = useState<Aba>('colaboradores')

  const { data: colaboradores, isLoading: loadingColaboradores } = useQuery({
    queryKey: ['ranking', 'colaboradores'],
    queryFn: () => rankingService.colaboradores(0, 20),
    enabled: aba === 'colaboradores',
  })

  const { data: lojas, isLoading: loadingLojas } = useQuery({
    queryKey: ['ranking', 'lojas'],
    queryFn: () => rankingService.lojas(0, 20),
    enabled: aba === 'lojas',
  })

  const { data: ofertas, isLoading: loadingOfertas } = useQuery({
    queryKey: ['ranking', 'ofertas'],
    queryFn: () => rankingService.ofertas(0, 20),
    enabled: aba === 'ofertas',
  })

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl px-6 py-8 md:py-12 text-center bg-ink-900 shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -bottom-10 w-44 h-44 bg-mel-500/15"
          style={{ clipPath: 'var(--hex-clip)' }}
        />
        <div className="relative flex justify-center mb-2">
          <Trophy size={28} className="text-mel-400" />
        </div>
        <h1 className="relative font-display text-display-lg font-extrabold mb-2 text-white">
          Ranking da Vitrine
        </h1>
        <p className="relative text-sm md:text-base text-white/75">
          Quem mais contribui, o que mais faz sucesso no comércio de Picos-PI.
        </p>
      </div>

      <div className="flex gap-2 border-b border-sand-200">
        {ABAS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setAba(value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors',
              aba === value ? 'border-terracota-500 text-terracota-700' : 'border-transparent text-ink-500 hover:text-ink-700'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {aba === 'colaboradores' && (
        loadingColaboradores ? <ListaSkeleton /> : !colaboradores?.content.length ? (
          <EmptyState icon={<Users size={22} />} titulo="Ainda não há contribuições aprovadas" />
        ) : (
          <div className="flex flex-col gap-2">
            {colaboradores.content.map((c, i) => (
              <div key={c.usuarioId} className="flex items-center gap-3 p-3 rounded-xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <PosicaoBadge posicao={i} />
                <p className="flex-1 min-w-0 font-medium text-sm truncate text-ink-900">{c.nome}</p>
                <Badge variant="primary">{c.contribuicoesAprovadas} contribuições</Badge>
              </div>
            ))}
          </div>
        )
      )}

      {aba === 'lojas' && (
        loadingLojas ? <ListaSkeleton /> : !lojas?.content.length ? (
          <EmptyState icon={<Store size={22} />} titulo="Ainda não há lojas com favoritos" />
        ) : (
          <div className="flex flex-col gap-2">
            {lojas.content.map((l, i) => (
              <div key={l.lojaId} className="flex items-center gap-3 p-3 rounded-xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <PosicaoBadge posicao={i} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-ink-900">{l.nome}</p>
                  {l.endereco && <p className="text-xs truncate text-ink-500">{l.endereco}</p>}
                </div>
                <Badge variant="primary">
                  <Heart size={11} className="mr-1 inline" />{l.popularidade}
                </Badge>
              </div>
            ))}
          </div>
        )
      )}

      {aba === 'ofertas' && (
        loadingOfertas ? <OfertaGridSkeleton quantidade={8} /> : !ofertas?.content.length ? (
          <EmptyState icon={<Medal size={22} />} titulo="Ainda não há ofertas favoritadas" />
        ) : (
          <OfertaGrid ofertas={ofertas.content} />
        )
      )}
    </div>
  )
}
