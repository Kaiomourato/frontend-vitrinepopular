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

// Tom por posição do pódio — mel (ouro), prata (sand), terracota (bronze)
const TOM_PODIO = [
  { hex: 'bg-mel-500', altura: 'h-24 md:h-28', txt: 'text-mel-600' },
  { hex: 'bg-sand-400', altura: 'h-16 md:h-20', txt: 'text-ink-500' },
  { hex: 'bg-terracota-600', altura: 'h-11 md:h-14', txt: 'text-terracota-600' },
] as const

interface PodioItem {
  chave: string | number
  nome: string
  estatistica: string
}

/** Pódio top 3 — 2º à esquerda, 1º no centro (mais alto), 3º à direita. */
function Podio({ itens }: { itens: PodioItem[] }) {
  const ordemVisual = [1, 0, 2]
  return (
    <div className="flex items-end justify-center gap-3 md:gap-6">
      {ordemVisual.map(posicao => {
        const item = itens[posicao]
        const tom = TOM_PODIO[posicao]
        if (!item) return <div key={posicao} className="flex-1 max-w-[140px]" />
        return (
          <div key={item.chave} className="flex flex-col items-center gap-2 flex-1 max-w-[140px] min-w-0">
            <div
              className={cn('w-14 h-14 md:w-16 md:h-16 shrink-0 flex items-center justify-center font-display font-black text-white text-xl shadow-md', tom.hex)}
              style={{ clipPath: 'var(--hex-clip)' }}
            >
              {item.nome[0]?.toUpperCase()}
            </div>
            <p className="text-[13px] font-bold text-ink-900 text-center truncate w-full">{item.nome}</p>
            <p className={cn('font-rounded font-bold text-sm', tom.txt)}>{item.estatistica}</p>
            <div className={cn('w-full rounded-t-xl flex items-start justify-center pt-2 font-display font-black text-white text-xl', tom.hex, tom.altura)}>
              {posicao + 1}º
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 md:py-14 text-center bg-ink-900 shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -bottom-10 w-44 h-44 bg-mel-500/15"
          style={{ clipPath: 'var(--hex-clip)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 w-32 h-32 bg-terracota-500/15"
          style={{ clipPath: 'var(--hex-clip)' }}
        />
        <div className="relative flex justify-center mb-2">
          <Trophy size={30} className="text-mel-400" />
        </div>
        <h1 className="relative font-display text-display-lg font-extrabold mb-2 text-white">
          Ranking da Vitrine
        </h1>
        <p className="relative text-sm md:text-base text-white/75">
          Quem mais contribui, o que mais faz sucesso no comércio de Picos-PI.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {ABAS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setAba(value)}
            className={cn(
              'flex items-center gap-1.5 h-9 px-4 rounded-full font-rounded font-semibold text-[13px] border-[1.5px] transition-all active:scale-95',
              aba === value
                ? 'text-white border-terracota-500 bg-terracota-500 shadow-brand'
                : 'text-ink-700 bg-white border-sand-300 hover:border-sand-400 hover:bg-sand-100'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {aba === 'colaboradores' && (
        loadingColaboradores ? <ListaSkeleton /> : !colaboradores?.content.length ? (
          <EmptyState icon={<Users size={22} />} titulo="Ainda não há contribuições aprovadas" />
        ) : (
          <div className="flex flex-col gap-6">
            <Podio itens={colaboradores.content.slice(0, 3).map(c => ({
              chave: c.usuarioId, nome: c.nome, estatistica: `${c.contribuicoesAprovadas} contrib.`,
            }))} />
            {colaboradores.content.length > 3 && (
              <div className="flex flex-col gap-2">
                {colaboradores.content.slice(3).map((c, i) => (
                  <div key={c.usuarioId} className="flex items-center gap-3 p-3 rounded-xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <PosicaoBadge posicao={i + 3} />
                    <p className="flex-1 min-w-0 font-medium text-sm truncate text-ink-900">{c.nome}</p>
                    <Badge variant="primary">{c.contribuicoesAprovadas} contribuições</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {aba === 'lojas' && (
        loadingLojas ? <ListaSkeleton /> : !lojas?.content.length ? (
          <EmptyState icon={<Store size={22} />} titulo="Ainda não há lojas com favoritos" />
        ) : (
          <div className="flex flex-col gap-6">
            <Podio itens={lojas.content.slice(0, 3).map(l => ({
              chave: l.lojaId, nome: l.nome, estatistica: `${l.popularidade} ♥`,
            }))} />
            {lojas.content.length > 3 && (
              <div className="flex flex-col gap-2">
                {lojas.content.slice(3).map((l, i) => (
                  <div key={l.lojaId} className="flex items-center gap-3 p-3 rounded-xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <PosicaoBadge posicao={i + 3} />
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
            )}
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
