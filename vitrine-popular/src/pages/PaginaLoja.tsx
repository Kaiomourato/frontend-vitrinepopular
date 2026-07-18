import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { lojasService } from '@/services/lojas'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { StoreHeader } from '@/components/lojas/StoreHeader'
import { Button, EmptyState } from '@/components/ui'
import { useState } from 'react'

export function PaginaLoja() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pagina, setPagina] = useState(0)

  const { data: loja, isLoading: loadingLoja } = useQuery({
    queryKey: ['loja', id],
    queryFn: () => lojasService.buscarPorId(Number(id)),
    enabled: !!id,
  })

  const { data: ofertas, isLoading: loadingOfertas } = useQuery({
    queryKey: ['ofertas', 'loja', id, pagina],
    queryFn: () => ofertasService.porLoja(Number(id), pagina, 12),
    enabled: !!id,
  })

  if (loadingLoja) return <PaginaLojaSkeleton />

  if (!loja) return (
    <div className="container-app py-20">
      <EmptyState
        icon={<Search size={28} />}
        titulo="Essa loja não existe mais"
        descricao="Pode ter sido removida ou o link estar errado."
        acao={<Button variant="outline" onClick={() => navigate('/')}>Voltar aos achados</Button>}
      />
    </div>
  )

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <StoreHeader loja={loja} onVoltar={() => navigate(-1)} />

      <div>
        <h2 className="font-display text-display-sm font-extrabold mb-4 text-ink-900">
          Achados dessa loja
        </h2>
        {loadingOfertas ? (
          <OfertaGridSkeleton quantidade={8} />
        ) : !ofertas?.content?.length ? (
          <EmptyState
            icon={<Search size={24} />}
            titulo="Nenhum achado por aqui ainda"
            descricao="Esta loja ainda não publicou nada."
          />
        ) : (
          <>
            <OfertaGrid ofertas={ofertas.content} />
            {ofertas.page.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button variant="outline" size="sm" disabled={ofertas.page.number === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
                <span className="text-sm px-3 text-ink-700">{ofertas.page.number + 1} / {ofertas.page.totalPages}</span>
                <Button variant="outline" size="sm" disabled={ofertas.page.number + 1 >= ofertas.page.totalPages} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PaginaLojaSkeleton() {
  return (
    <div className="container-app py-6 flex flex-col gap-6 animate-pulse">
      <div className="rounded-2xl h-52 md:h-56 bg-sand-100" />
      <div className="h-6 w-40 rounded bg-sand-100" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-sand-100" />
        ))}
      </div>
    </div>
  )
}
