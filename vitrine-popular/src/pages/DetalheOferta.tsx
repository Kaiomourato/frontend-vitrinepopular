import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, MapPin, MessageCircle, Clock, Tag, ThumbsUp, ThumbsDown, Share2, Heart } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { useFavoritos, useToggleFavorito } from '@/hooks/useFavoritos'
import { Button, Badge, Spinner } from '@/components/ui'
import { formatarPreco, formatarDataRelativa, formatarWhatsApp } from '@/lib/utils'
import { useState } from 'react'
import { dispararToast } from '@/components/ui'

type TipoVoto = 'ainda-tem' | 'acabou'

export function DetalheOferta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAutenticado = useAuthStore(s => s.isAutenticado)
  const { idsFavoritos } = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const [votando, setVotando] = useState<TipoVoto | null>(null)
  const [votou, setVotou] = useState(false)

  const { data: oferta, isLoading, isError } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.buscarPorId(Number(id)),
    enabled: !!id,
  })

  const favoritado = oferta ? idsFavoritos.has(oferta.id) : false

  function handleFavoritar() {
    if (!oferta) return
    toggleFavorito.mutate({ oferta, favoritado })
  }

  async function handleVotar(tipo: TipoVoto) {
    if (!isAutenticado) {
      dispararToast('Faça login para sinalizar', 'info')
      navigate('/login')
      return
    }
    if (votou || votando || !id) return
    setVotando(tipo)
    try {
      if (tipo === 'ainda-tem') await ofertasService.votarAindaTem(Number(id))
      else await ofertasService.votarAcabou(Number(id))
      setVotou(true)
      queryClient.invalidateQueries({ queryKey: ['oferta', id] })
      dispararToast('Sinalização registrada! Obrigado pela contribuição.', 'success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        dispararToast('Você já sinalizou esta oferta.', 'error')
        setVotou(true)
      } else {
        dispararToast('Não foi possível registrar sua sinalização.', 'error')
      }
    } finally {
      setVotando(null)
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
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge variant="primary">{oferta.categoria.nome}</Badge>
              {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
              {oferta.status === 'EXPIRADA' && <Badge variant="warning">Expirada</Badge>}
              {oferta.status === 'REMOVIDA' && <Badge variant="danger">Removida</Badge>}
            </div>
            {isAutenticado && (
              <button
                onClick={handleFavoritar}
                disabled={toggleFavorito.isPending}
                className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0 transition-all"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart
                  size={16}
                  fill={favoritado ? 'var(--color-danger)' : 'none'}
                  stroke={favoritado ? 'var(--color-danger)' : 'var(--color-text-secondary)'}
                />
              </button>
            )}
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
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Essa oferta ainda está disponível?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleVotar('ainda-tem')}
                  loading={votando === 'ainda-tem'}
                  disabled={votou}
                >
                  <ThumbsUp size={16} />
                  Ainda tem ({oferta.votosAindaTem})
                </Button>
                <Button
                  variant={votou ? 'danger' : 'outline'}
                  className="flex-1"
                  onClick={() => handleVotar('acabou')}
                  loading={votando === 'acabou'}
                  disabled={votou}
                >
                  <ThumbsDown size={16} />
                  Acabou ({oferta.votosAcabou})
                </Button>
                <Button variant="ghost" onClick={handleCompartilhar}>
                  <Share2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}