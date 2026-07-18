import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapPin, ThumbsDown, ThumbsUp, Heart, Share2, ChevronRight, ChevronDown } from 'lucide-react'
import { cn, formatarPreco } from '@/lib/utils'
import { compartilharOferta } from '@/lib/compartilhar'
import { ehAchadoDeOuro } from '@/lib/ofertas'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { useFavoritos, useToggleFavorito } from '@/hooks/useFavoritos'
import { dispararToast } from '@/components/ui'
import { PlaceholderFavo } from '@/components/ui/PlaceholderFavo'
import { SeloOuro } from '@/components/ofertas/CardOuro'
import type { OfertaResponse } from '@/types'

type TipoVoto = 'ainda-tem' | 'acabou'

interface CardFeedVerticalProps {
  oferta: OfertaResponse
  onVoto?: () => void
  /** Primeiro card do feed — mostra a dica de "deslize" uma única vez. */
  primeiro?: boolean
}

/**
 * Card do feed vertical (descoberta estilo "rolar e ver o que apareceu
 * hoje") — uma oferta por tela, só no mobile (a Home usa grade em telas
 * maiores — ver Feed.tsx). Full-bleed de propósito, sem breakpoints.
 */
export function CardFeedVertical({ oferta, onVoto, primeiro }: CardFeedVerticalProps) {
  const navigate = useNavigate()
  const isAutenticado = useAuthStore(s => s.isAutenticado)
  const { idsFavoritos } = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const favoritado = idsFavoritos.has(oferta.id)
  const [votando, setVotando] = useState<TipoVoto | null>(null)
  const [votou, setVotou] = useState(false)
  const [imgErro, setImgErro] = useState(false)
  const ouro = ehAchadoDeOuro(oferta)

  function handleFavoritar(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAutenticado) {
      dispararToast('Faça login para salvar achados', 'info')
      navigate('/login')
      return
    }
    toggleFavorito.mutate({ oferta, favoritado })
  }

  function handleCompartilhar(e: React.MouseEvent) {
    e.stopPropagation()
    compartilharOferta(oferta)
  }

  async function handleVotar(tipo: TipoVoto, e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAutenticado) {
      dispararToast('Faça login para sinalizar', 'info')
      navigate('/login')
      return
    }
    if (votou || votando) return
    setVotando(tipo)
    try {
      if (tipo === 'ainda-tem') await ofertasService.votarAindaTem(oferta.id)
      else await ofertasService.votarAcabou(oferta.id)
      setVotou(true)
      dispararToast('Sinalização registrada! Obrigado pela contribuição.', 'success')
      onVoto?.()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        dispararToast('Você já sinalizou esta oferta.', 'error')
        setVotou(true)
      }
    } finally {
      setVotando(null)
    }
  }

  return (
    <article
      onClick={() => navigate(`/oferta/${oferta.id}`)}
      className={cn(
        'relative w-full h-full overflow-hidden cursor-pointer bg-ink-900',
        ouro && 'ring-4 ring-inset ring-mel-400/80'
      )}
    >
      {oferta.imagemUrl && !imgErro ? (
        <img
          src={oferta.imagemUrl}
          alt={oferta.produtoNome}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgErro(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-mel-50">
          <PlaceholderFavo />
        </div>
      )}

      {/* Scrim superior — legibilidade do selo/categoria sobre fotos claras */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      {/* Scrim inferior — legibilidade do conteúdo principal */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      {primeiro && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center gap-1 z-10 motion-safe:animate-bounce">
          <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            Deslize para ver mais achados
            <ChevronDown size={14} />
          </span>
        </div>
      )}

      {/* Trilho de ações — lado direito */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3 z-10">
        <button
          onClick={handleFavoritar}
          disabled={toggleFavorito.isPending}
          className={cn(
            'w-12 h-12 rounded-full flex flex-col items-center justify-center text-white backdrop-blur-sm transition-all active:scale-90',
            favoritado ? 'bg-perigo-500 shadow-lg shadow-perigo-500/50' : 'bg-white/15 hover:bg-white/25'
          )}
          title={favoritado ? 'Remover dos salvos' : 'Salvar'}
        >
          <Heart
            size={22}
            fill={favoritado ? '#fff' : 'none'}
            className={favoritado ? 'motion-safe:animate-pulsar' : ''}
          />
        </button>
        <button
          onClick={handleCompartilhar}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white transition-all hover:bg-white/25 active:scale-90"
          title="Compartilhar"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={e => handleVotar('ainda-tem', e)}
          disabled={votou || votando !== null}
          className={cn(
            'w-12 h-12 rounded-full flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm text-white text-[11px] font-bold transition-all active:scale-90 disabled:opacity-70',
            votou ? 'bg-mandacaru-600 shadow-lg shadow-mandacaru-600/50' : 'bg-white/15 hover:bg-white/25'
          )}
          title="Sinalizar que ainda tem"
        >
          <ThumbsUp size={18} />
          {oferta.votosAindaTem > 0 && oferta.votosAindaTem}
        </button>
        <button
          onClick={e => handleVotar('acabou', e)}
          disabled={votou || votando !== null}
          className={cn(
            'w-12 h-12 rounded-full flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm text-white text-[11px] font-bold transition-all active:scale-90 disabled:opacity-70',
            votou ? 'bg-perigo-600 shadow-lg shadow-perigo-600/50' : 'bg-white/15 hover:bg-white/25'
          )}
          title="Sinalizar que acabou"
        >
          <ThumbsDown size={18} />
          {oferta.votosAcabou > 0 && oferta.votosAcabou}
        </button>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/oferta/${oferta.id}`) }}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white transition-all hover:bg-white/25 active:scale-90"
          title="Ver detalhes"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Conteúdo — canto inferior esquerdo */}
      <div className="absolute inset-x-0 bottom-0 pr-24 p-5 flex flex-col gap-2.5 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {ouro && <SeloOuro />}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-white/20 backdrop-blur-sm">
            {oferta.categoria.nome}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold leading-tight text-white line-clamp-2 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
          {oferta.produtoNome}
        </h2>

        <p className="inline-flex w-fit items-center font-display text-display-md font-bold text-white px-4 py-1.5 rounded-xl bg-gradient-to-r from-terracota-500 to-queimado-500 ring-2 ring-white/20 shadow-lg shadow-terracota-600/50">
          {formatarPreco(oferta.preco)}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/loja/${oferta.loja.id}`) }}
          className="flex items-center gap-1 max-w-full text-sm font-bold text-mel-300 text-left hover:underline"
        >
          <MapPin size={13} className="shrink-0" />
          <span className="truncate min-w-0">{oferta.loja.nome}</span>
        </button>

        {oferta.votosAindaTem > 0 && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-mandacaru-300">
            <ThumbsUp size={13} />
            {oferta.votosAindaTem} pessoa{oferta.votosAindaTem > 1 ? 's' : ''} confirmam que ainda tem
          </p>
        )}
      </div>
    </article>
  )
}
