import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapPin, ThumbsDown, Clock, Heart } from 'lucide-react'
import { formatarPreco, formatarDataRelativa } from '@/lib/utils'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { useFavoritos, useToggleFavorito } from '@/hooks/useFavoritos'
import { Badge, dispararToast } from '@/components/ui'
import type { OfertaResponse } from '@/types'

interface OfertaCardProps {
  oferta: OfertaResponse
  onVotoAcabou?: () => void
}

export function OfertaCard({ oferta, onVotoAcabou }: OfertaCardProps) {
  const navigate = useNavigate()
  const isAutenticado = useAuthStore(s => s.isAutenticado)
  const { idsFavoritos } = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const favoritado = idsFavoritos.has(oferta.id)
  const [votando, setVotando] = useState(false)
  const [votou, setVotou] = useState(false)

  function handleFavoritar(e: React.MouseEvent) {
    e.stopPropagation()
    toggleFavorito.mutate({ oferta, favoritado })
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
      className="group cursor-pointer rounded-[14px] border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={oferta.imagemUrl}
          alt={oferta.produtoNome}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge categoria */}
        <div className="absolute top-2 left-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            {oferta.categoria.nome}
          </span>
        </div>
        {/* Badge oficial + favorito */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {oferta.status === 'ATIVA' && <Badge variant="success">Disponível</Badge>}
          {isAutenticado && (
            <button
              onClick={handleFavoritar}
              disabled={toggleFavorito.isPending}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
              title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart size={14} fill={favoritado ? '#fff' : 'none'} stroke="#fff" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
            {oferta.produtoNome}
          </p>
          {oferta.descricao && (
            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
              {oferta.descricao}
            </p>
          )}
        </div>

        {/* Preço */}
        <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          {formatarPreco(oferta.preco)}
        </p>

        {/* Loja */}
        <button
          onClick={e => { e.stopPropagation(); navigate(`/loja/${oferta.loja.id}`) }}
          className="flex items-center gap-1 text-xs transition-colors hover:underline text-left"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{oferta.loja.nome}</span>
          {oferta.loja.endereco && (
            <span className="truncate hidden sm:inline">• {oferta.loja.endereco}</span>
          )}
        </button>

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Clock size={11} />
            {formatarDataRelativa(oferta.dataPostagem)}
          </span>
          <button
            onClick={handleVotarAcabou}
            disabled={votou || votando}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all disabled:cursor-not-allowed"
            style={{
              color: votou ? 'var(--color-danger)' : 'var(--color-text-muted)',
              background: votou ? 'var(--color-danger-light)' : 'transparent',
            }}
            title="Votar que o produto acabou"
          >
            <ThumbsDown size={12} />
            <span>Acabou {oferta.votosAcabou > 0 ? `(${oferta.votosAcabou})` : ''}</span>
          </button>
        </div>
      </div>
    </article>
  )
}