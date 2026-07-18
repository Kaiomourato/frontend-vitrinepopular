import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, MapPin, MessageCircle, Clock, Tag, ThumbsUp, ThumbsDown, Share2, Heart, Search } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { useFavoritos, useToggleFavorito } from '@/hooks/useFavoritos'
import { Button, Badge, EmptyState } from '@/components/ui'
import { formatarPreco, formatarDataRelativa, formatarWhatsApp } from '@/lib/utils'
import { ehAchadoDeOuro } from '@/lib/ofertas'
import { compartilharOferta } from '@/lib/compartilhar'
import { SeloOuro } from '@/components/ofertas/CardOuro'
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
    if (oferta) compartilharOferta(oferta)
  }

  if (isLoading) return <DetalheOfertaSkeleton />

  if (isError || !oferta) return (
    <div className="container-app py-20">
      <EmptyState
        icon={<Search size={28} />}
        titulo="Esse achado não existe mais"
        descricao="Pode ter sido removido ou o link estar errado."
        acao={<Button variant="outline" onClick={() => navigate('/')}>Voltar aos achados</Button>}
      />
    </div>
  )

  const whatsappUrl = formatarWhatsApp(oferta.loja.whatsapp)
  const ouro = ehAchadoDeOuro(oferta)

  return (
    <div className="container-app py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70 text-ink-700"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="rounded-xl overflow-hidden aspect-square border border-sand-200 bg-mel-50">
          {oferta.imagemUrl && (
            <img src={oferta.imagemUrl} alt={oferta.produtoNome} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-wrap">
              {ouro && <SeloOuro />}
              <Badge variant="primary">{oferta.categoria.nome}</Badge>
              {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
              {oferta.status === 'EXPIRADA' && <Badge variant="warning">Expirada</Badge>}
              {oferta.status === 'REMOVIDA' && <Badge variant="danger">Removida</Badge>}
            </div>
            {isAutenticado && (
              <button
                onClick={handleFavoritar}
                disabled={toggleFavorito.isPending}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-sand-200 bg-white shrink-0 transition-transform active:scale-90"
                title={favoritado ? 'Remover dos salvos' : 'Salvar'}
              >
                <Heart
                  size={16}
                  className={favoritado ? 'motion-safe:animate-pulsar' : ''}
                  fill={favoritado ? 'var(--color-perigo-600)' : 'none'}
                  stroke={favoritado ? 'var(--color-perigo-600)' : 'var(--color-ink-700)'}
                />
              </button>
            )}
          </div>

          <div>
            <h1 className="font-display text-display-md font-bold leading-tight text-ink-900">
              {oferta.produtoNome}
            </h1>
            {oferta.descricao && (
              <p className="mt-3 text-base leading-relaxed text-ink-700">
                {oferta.descricao}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <p className="inline-flex w-fit items-center font-display text-display-lg font-bold text-white px-4 py-1.5 rounded-xl bg-gradient-to-r from-terracota-500 to-queimado-500 shadow-md shadow-terracota-500/30">
              {formatarPreco(oferta.preco)}
            </p>
            {oferta.votosAindaTem > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-mandacaru-600">
                <ThumbsUp size={14} />
                {oferta.votosAindaTem} confirmam que ainda tem
              </span>
            )}
          </div>

          <Link
            to={`/loja/${oferta.loja.id}`}
            className="flex flex-col gap-1 p-4 rounded-lg border-2 border-terracota-100 bg-terracota-50 transition-colors hover:border-terracota-400"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-terracota-600">Vendido por</span>
            <span className="font-bold text-ink-900">{oferta.loja.nome}</span>
            {oferta.loja.endereco && (
              <span className="flex items-center gap-1 text-sm text-ink-700">
                <MapPin size={13} /> {oferta.loja.endereco}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3 text-sm text-ink-500 flex-wrap">
            <span className="flex items-center gap-1"><Clock size={13} /> Visto {formatarDataRelativa(oferta.dataPostagem)}</span>
            <span className="flex items-center gap-1"><Tag size={13} /> {oferta.categoria.nome}</span>
            {oferta.interessados > 0 && (
              <span className="flex items-center gap-1">
                <Heart size={13} /> {oferta.interessados} interessado{oferta.interessados > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-lg font-medium text-base text-white bg-whatsapp transition-opacity hover:opacity-90"
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
              </a>
            )}
            <div>
              <p className="text-xs font-medium mb-2 text-ink-500">
                Esse achado ainda está disponível?
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

function DetalheOfertaSkeleton() {
  return (
    <div className="container-app py-6 animate-pulse">
      <div className="h-4 w-16 rounded mb-6 bg-sand-100" />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="rounded-xl aspect-square bg-sand-100" />
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-sand-100" />
            <div className="h-6 w-24 rounded-full bg-sand-100" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-7 w-3/4 rounded bg-sand-100" />
            <div className="h-4 w-full rounded bg-sand-100" />
          </div>
          <div className="h-9 w-40 rounded bg-sand-100" />
          <div className="h-20 rounded-lg bg-sand-100" />
          <div className="h-12 rounded-lg bg-sand-100" />
        </div>
      </div>
    </div>
  )
}
