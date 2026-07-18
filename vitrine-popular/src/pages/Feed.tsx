import { useQueryClient } from '@tanstack/react-query'
import { useEhMobile } from '@/hooks/useEhMobile'
import { useOfertasInfinitas } from '@/hooks/useOfertasInfinitas'
import { FeedVertical } from '@/components/ofertas/FeedVertical'
import { OfertaGridVirtualizado } from '@/components/ofertas/OfertaGridVirtualizado'

const PAGE_SIZE = 12

// Home: no mobile é o feed vertical de descoberta ("rolar e ver o que
// apareceu hoje"); em telas maiores vira a grade densa — o mesmo padrão de
// Busca/Descobrir — porque um card em formato de celular esticado numa tela
// larga não funciona bem em nenhum navegador. A troca acontece no mesmo
// breakpoint (`md`, 768px) usado pela BottomNav/Navbar no resto do app.
export function Feed() {
  const ehMobile = useEhMobile()
  return ehMobile ? <FeedVertical /> : <FeedGrade />
}

function FeedGrade() {
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
    <div className="container-app py-6 flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 md:py-14 text-center bg-ink-900 shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 bg-mel-500/15"
          style={{ clipPath: 'var(--hex-clip)' }}
        />
        <h1 className="relative font-display text-display-lg font-extrabold mb-2 text-white">
          Achados do dia
        </h1>
        <p className="relative text-sm md:text-base text-white/75">
          O que apareceu no comércio de Picos-PI para você conferir agora.
        </p>
      </div>

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
  )
}
