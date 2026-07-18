import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapPin, ThumbsDown, Clock, Heart, Share2 } from 'lucide-react'
import { cn, formatarPreco, formatarDataRelativa } from '@/lib/utils'
import { compartilharOferta } from '@/lib/compartilhar'
import { ehAchadoDeOuro } from '@/lib/ofertas'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { useFavoritos, useToggleFavorito } from '@/hooks/useFavoritos'
import { Badge, dispararToast } from '@/components/ui'
import { PlaceholderFavo } from '@/components/ui/PlaceholderFavo'
import { CardOuro, SeloOuro } from '@/components/ofertas/CardOuro'
import type { OfertaResponse } from '@/types'

interface OfertaCardProps {
  oferta: OfertaResponse
  onVotoAcabou?: () => void
  /** Posição na lista — só para escalonar a animação de entrada (capada). */
  index?: number
}

export function OfertaCard({ oferta, onVotoAcabou, index = 0 }: OfertaCardProps) {
  const navigate = useNavigate()
  const isAutenticado = useAuthStore(s => s.isAutenticado)
  const { idsFavoritos } = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const favoritado = idsFavoritos.has(oferta.id)
  const [votando, setVotando] = useState(false)
  const [votou, setVotou] = useState(false)
  const [imgErro, setImgErro] = useState(false)

  function handleFavoritar(e: React.MouseEvent) {
    e.stopPropagation()
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

  const ouro = ehAchadoDeOuro(oferta)

  return (
    <CardOuro ativo={ouro}>
    <article
      onClick={() => navigate(`/oferta/${oferta.id}`)}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className="group cursor-pointer rounded-xl border border-sand-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[3px] motion-safe:animate-surgir"
    >
      {/* Imagem — proporção fixa para domar fotos de qualidade variável */}
      <div className="relative aspect-square overflow-hidden bg-mel-50">
        {oferta.imagemUrl && !imgErro ? (
          <img
            src={oferta.imagemUrl}
            alt={oferta.produtoNome}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setImgErro(true)}
          />
        ) : (
          <PlaceholderFavo />
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-2">
          {ouro && <SeloOuro />}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white backdrop-blur-sm bg-ink-900/55">
              {oferta.categoria.nome}
            </span>
            {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center">
          {isAutenticado && (
            <button
              onClick={handleFavoritar}
              disabled={toggleFavorito.isPending}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/92 backdrop-blur-sm shadow-sm transition-transform active:scale-90"
              title={favoritado ? 'Remover dos salvos' : 'Salvar'}
            >
              <Heart
                size={16}
                fill={favoritado ? 'var(--color-terracota-500)' : 'none'}
                stroke={favoritado ? 'var(--color-terracota-500)' : 'var(--color-ink-500)'}
                className={favoritado ? 'motion-safe:animate-pulsar' : ''}
              />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="font-bold text-[15px] leading-tight line-clamp-2 text-ink-900">
            {oferta.produtoNome}
          </p>
          {oferta.descricao && (
            <p className="text-xs mt-0.5 line-clamp-1 text-ink-500">
              {oferta.descricao}
            </p>
          )}
        </div>

        {/* Preço em destaque — número grande na fonte arredondada, sem badge/gradiente */}
        <p className="font-rounded font-bold text-[19px] leading-none text-terracota-700">
          {formatarPreco(oferta.preco)}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/loja/${oferta.loja.id}`) }}
          className="flex items-center gap-1 text-[11.5px] font-bold transition-colors hover:underline text-left text-terracota-600"
        >
          <MapPin size={11} className="shrink-0" />
          <span className="truncate min-w-0 flex-1">{oferta.loja.nome}</span>
          {oferta.loja.endereco && (
            <span className="truncate min-w-0 hidden sm:inline text-ink-500 font-normal">• {oferta.loja.endereco}</span>
          )}
        </button>

        {/* Rodapé: frescor do dado + ações */}
        <div className="flex flex-col gap-2 pt-1 border-t border-sand-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Visto {formatarDataRelativa(oferta.dataPostagem)}
            </span>
            {oferta.interessados > 0 && (
              <span className="flex items-center gap-0.5">
                <Heart size={11} />
                {oferta.interessados}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCompartilhar}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-ink-500 transition-colors hover:bg-sand-200 hover:text-ink-700"
              title="Compartilhar"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleVotarAcabou}
              disabled={votou || votando}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed',
                votou ? 'bg-perigo-50 text-perigo-600' : 'bg-sand-100 text-ink-700 hover:bg-sand-200'
              )}
              title="Sinalizar que acabou"
            >
              <ThumbsDown size={16} />
              Acabou{oferta.votosAcabou > 0 && ` (${oferta.votosAcabou})`}
            </button>
          </div>
        </div>
      </div>
    </article>
    </CardOuro>
  )
}
