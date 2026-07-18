import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapPin, ThumbsDown, ThumbsUp, Heart, Share2, ChevronRight } from 'lucide-react'
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

interface CardFeedVerticalProps {
  oferta: OfertaResponse
  onVotoAcabou?: () => void
}

/**
 * Card full-bleed do feed vertical (descoberta estilo "rolar e ver o que
 * apareceu hoje") — uma oferta por tela. Ações vivem num trilho lateral,
 * o toque no corpo do card abre o detalhe.
 */
export function CardFeedVertical({ oferta, onVotoAcabou }: CardFeedVerticalProps) {
  const navigate = useNavigate()
  const isAutenticado = useAuthStore(s => s.isAutenticado)
  const { idsFavoritos } = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const favoritado = idsFavoritos.has(oferta.id)
  const [votando, setVotando] = useState(false)
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

  async function handleVotarAcabou(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAutenticado) {
      dispararToast('Faça login para sinalizar', 'info')
      navigate('/login')
      return
    }
    if (votou || votando) return
    setVotando(true)
    try {
      await ofertasService.votarAcabou(oferta.id)
      setVotou(true)
      onVotoAcabou?.()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        dispararToast('Você já sinalizou esta oferta.', 'error')
        setVotou(true)
      }
    } finally {
      setVotando(false)
    }
  }

  return (
    <article
      onClick={() => navigate(`/oferta/${oferta.id}`)}
      className={cn(
        'relative w-full h-full overflow-hidden cursor-pointer bg-ink-900',
        ouro && 'ring-4 ring-inset ring-mel-400/70'
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

      {/* Scrim inferior — legibilidade do conteúdo sobre a foto */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Trilho de ações — lado direito */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3 z-10">
        <button
          onClick={handleFavoritar}
          disabled={toggleFavorito.isPending}
          className="w-12 h-12 rounded-full flex flex-col items-center justify-center bg-white/15 backdrop-blur-sm text-white transition-transform active:scale-90"
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
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white transition-transform active:scale-90"
          title="Compartilhar"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={handleVotarAcabou}
          disabled={votou || votando}
          className={cn(
            'w-12 h-12 rounded-full flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm text-white text-[10px] font-semibold transition-transform active:scale-90 disabled:opacity-70',
            votou ? 'bg-perigo-600/80' : 'bg-white/15'
          )}
          title="Sinalizar que acabou"
        >
          <ThumbsDown size={18} />
          {oferta.votosAcabou > 0 && oferta.votosAcabou}
        </button>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/oferta/${oferta.id}`) }}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white transition-transform active:scale-90"
          title="Ver detalhes"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Conteúdo — canto inferior esquerdo */}
      <div className="absolute inset-x-0 bottom-0 pr-20 p-5 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {ouro && <SeloOuro />}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white/90 bg-white/15 backdrop-blur-sm">
            {oferta.categoria.nome}
          </span>
        </div>

        <h2 className="font-display text-xl font-semibold leading-tight text-white line-clamp-2">
          {oferta.produtoNome}
        </h2>

        <p className="font-display text-display-md font-semibold text-mel-300">
          {formatarPreco(oferta.preco)}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/loja/${oferta.loja.id}`) }}
          className="flex items-center gap-1 text-sm text-white/85 text-left hover:underline w-fit"
        >
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{oferta.loja.nome}</span>
        </button>

        {oferta.votosAindaTem > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-mandacaru-300">
            <ThumbsUp size={13} />
            {oferta.votosAindaTem} pessoa{oferta.votosAindaTem > 1 ? 's' : ''} confirmam que ainda tem
          </p>
        )}
      </div>
    </article>
  )
}
