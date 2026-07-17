import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, MessageCircle, Search } from 'lucide-react'
import { lojasService } from '@/services/lojas'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { Button, EmptyState, Badge } from '@/components/ui'
import { formatarWhatsApp } from '@/lib/utils'
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

  const whatsappUrl = formatarWhatsApp(loja?.whatsapp ?? null)

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
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 text-ink-700">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="rounded-xl border border-sand-200 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 bg-terracota-50 text-terracota-700">
          {loja.nome[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-display-sm font-semibold text-ink-900">{loja.nome}</h1>
            {loja.isParceira && <Badge variant="primary">Parceira</Badge>}
          </div>
          {loja.endereco && (
            <p className="flex items-center gap-1.5 text-sm mt-1 text-ink-700">
              <MapPin size={14} /> {loja.endereco}
            </p>
          )}
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shrink-0 text-white bg-whatsapp transition-opacity hover:opacity-90"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        )}
      </div>

      <div>
        <h2 className="font-display text-display-sm font-semibold mb-4 text-ink-900">
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
      <div className="h-4 w-16 rounded bg-sand-100" />
      <div className="rounded-xl h-32 md:h-28 bg-sand-100" />
      <div className="h-6 w-40 rounded bg-sand-100" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-sand-100" />
        ))}
      </div>
    </div>
  )
}
