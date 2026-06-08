import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'
import { lojasService } from '@/services/lojas'
import { ofertasService } from '@/services/ofertas'
import { OfertaGrid, OfertaGridSkeleton } from '@/components/ofertas/OfertaGrid'
import { Button, Spinner, EmptyState, Badge } from '@/components/ui'
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

  if (loadingLoja) return (
    <div className="container-app py-20 flex justify-center"><Spinner size={32} /></div>
  )

  if (!loja) return (
    <div className="container-app py-20 text-center">
      <p style={{ color: 'var(--color-text-secondary)' }}>Loja não encontrada.</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Voltar</Button>
    </div>
  )

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Header da loja */}
      <div className="rounded-[20px] border p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-[16px] flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
        >
          {loja.nome[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{loja.nome}</h1>
            {loja.isParceira && <Badge variant="primary">Parceira</Badge>}
          </div>
          {loja.endereco && (
            <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin size={14} /> {loja.endereco}
            </p>
          )}
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-medium text-sm shrink-0"
            style={{ background: '#25D366', color: '#fff' }}
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        )}
      </div>

      {/* Ofertas da loja */}
      <div>
        <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Ofertas ativas
        </h2>
        {loadingOfertas ? (
          <OfertaGridSkeleton quantidade={8} />
        ) : !ofertas?.content?.length ? (
          <EmptyState
            icon={<ShoppingBag size={24} />}
            titulo="Nenhuma oferta ativa"
            descricao="Esta loja ainda não publicou ofertas."
          />
        ) : (
          <>
            <OfertaGrid ofertas={ofertas.content} />
            {ofertas.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button variant="outline" size="sm" disabled={ofertas.first} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
                <span className="text-sm px-3" style={{ color: 'var(--color-text-secondary)' }}>{ofertas.number + 1} / {ofertas.totalPages}</span>
                <Button variant="outline" size="sm" disabled={ofertas.last} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
