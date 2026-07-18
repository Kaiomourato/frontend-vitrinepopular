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
      className="group cursor-pointer rounded-lg border border-sand-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 motion-safe:animate-surgir"
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

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {ouro && <SeloOuro />}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white backdrop-blur-sm bg-ink-900/55">
            {oferta.categoria.nome}
          </span>
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
          {isAutenticado && (
            <button
              onClick={handleFavoritar}
              disabled={toggleFavorito.isPending}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-ink-900/45 transition-transform active:scale-90"
              title={favoritado ? 'Remover dos salvos' : 'Salvar'}
            >
              <Heart
                size={15}
                fill={favoritado ? '#fff' : 'none'}
                stroke="#fff"
                className={favoritado ? 'motion-safe:animate-pulsar' : ''}
              />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-2.5">
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

        {/* Preço em destaque — tag de oferta, não texto corrido */}
        <p className="inline-flex w-fit items-center font-display text-display-sm font-bold text-white px-3 py-1 rounded-lg bg-gradient-to-r from-terracota-500 to-queimado-500 shadow-sm shadow-terracota-500/30">
          {formatarPreco(oferta.preco)}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/loja/${oferta.loja.id}`) }}
          className="flex items-center gap-1 text-xs font-semibold transition-colors hover:underline text-left text-terracota-700"
        >
          <MapPin size={11} className="shrink-0" />
          <span className="truncate min-w-0 flex-1">{oferta.loja.nome}</span>
          {oferta.loja.endereco && (
            <span className="truncate min-w-0 hidden sm:inline text-ink-500 font-normal">• {oferta.loja.endereco}</span>
          )}
        </button>

        {/* Rodapé: frescor do dado + ações */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-sand-200">
          <span className="flex items-center gap-2 text-xs text-ink-500">
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
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleCompartilhar}
              className="w-7 h-7 rounded-full flex items-center justify-center text-ink-500 transition-colors hover:bg-sand-100 hover:text-ink-700"
              title="Compartilhar"
            >
              <Share2 size={13} />
            </button>
            <button
              onClick={handleVotarAcabou}
              disabled={votou || votando}
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors disabled:cursor-not-allowed',
                votou ? 'text-perigo-600 bg-perigo-50' : 'text-ink-500 hover:bg-sand-100'
              )}
              title="Sinalizar que acabou"
            >
              <ThumbsDown size={12} />
              {oferta.votosAcabou > 0 && <span>{oferta.votosAcabou}</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
    </CardOuro>
  )
}
