import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MapPin, MessageCircle, Clock, Tag, ThumbsDown, Share2 } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { Button, Badge, Spinner } from '@/components/ui'
import { formatarPreco, formatarDataRelativa, formatarWhatsApp } from '@/lib/utils'
import { useState } from 'react'
import { dispararToast } from '@/components/ui'

export function DetalheOferta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [votando, setVotando] = useState(false)
  const [votou, setVotou] = useState(false)

  const { data: oferta, isLoading, isError } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.buscarPorId(Number(id)),
    enabled: !!id,
  })

  async function handleVotar() {
    if (votou || votando || !id) return
    setVotando(true)
    try {
      await ofertasService.votarAcabou(Number(id))
      setVotou(true)
      queryClient.invalidateQueries({ queryKey: ['oferta', id] })
      dispararToast('Voto registrado! Obrigado pela contribuição.', 'success')
    } catch {
      dispararToast('Não foi possível registrar o voto.', 'error')
    } finally {
      setVotando(false)
    }
  }

  function handleCompartilhar() {
    navigator.share?.({ title: oferta?.produtoNome, url: window.location.href })
      ?? navigator.clipboard.writeText(window.location.href)
        .then(() => dispararToast('Link copiado!', 'success'))
  }

  if (isLoading) return (
    <div className="container-app py-20 flex justify-center"><Spinner size={32} /></div>
  )

  if (isError || !oferta) return (
    <div className="container-app py-20 text-center">
      <p style={{ color: 'var(--color-text-secondary)' }}>Oferta não encontrada.</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Voltar ao feed</Button>
    </div>
  )

  const whatsappUrl = formatarWhatsApp(oferta.loja.whatsapp)

  return (
    <div className="container-app py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:opacity-70"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagem */}
        <div className="rounded-[20px] overflow-hidden aspect-square border" style={{ borderColor: 'var(--color-border)' }}>
          <img src={oferta.imagemUrl} alt={oferta.produtoNome} className="w-full h-full object-cover" />
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-2">
            <Badge variant="primary">{oferta.categoria.nome}</Badge>
            {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
            {oferta.status === 'EXPIRADA' && <Badge variant="warning">Expirada</Badge>}
            {oferta.status === 'REMOVIDA' && <Badge variant="danger">Removida</Badge>}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {oferta.produtoNome}
            </h1>
            {oferta.descricao && (
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {oferta.descricao}
              </p>
            )}
          </div>

          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatarPreco(oferta.preco)}
          </p>

          {/* Info loja */}
          <Link
            to={`/loja/${oferta.loja.id}`}
            className="flex flex-col gap-1 p-4 rounded-[12px] border transition-all hover:border-[var(--color-primary)]"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Vendido por</span>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{oferta.loja.nome}</span>
            {oferta.loja.endereco && (
              <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <MapPin size={13} /> {oferta.loja.endereco}
              </span>
            )}
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-1"><Clock size={13} /> {formatarDataRelativa(oferta.dataPostagem)}</span>
            <span className="flex items-center gap-1"><Tag size={13} /> {oferta.categoria.nome}</span>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-[10px] font-medium text-base transition-all hover:opacity-90"
                style={{ background: '#25D366', color: '#fff' }}
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
              </a>
            )}
            <div className="flex gap-2">
              <Button
                variant={votou ? 'danger' : 'outline'}
                className="flex-1"
                onClick={handleVotar}
                loading={votando}
                disabled={votou}
              >
                <ThumbsDown size={16} />
                {votou ? 'Voto registrado' : `Acabou (${oferta.votosAcabou})`}
              </Button>
              <Button variant="ghost" onClick={handleCompartilhar}>
                <Share2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}