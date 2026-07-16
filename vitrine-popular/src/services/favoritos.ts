import api from './api'
import type { OfertaResponse } from '@/types'

// Favoritos (RF11) — todas as ações exigem token
export const favoritosService = {
  favoritar: (ofertaId: number) =>
    api.post(`/api/favoritos/${ofertaId}`).then(r => r.data),

  desfavoritar: (ofertaId: number) =>
    api.delete(`/api/favoritos/${ofertaId}`).then(r => r.data),

  // Retorna a lista de ofertas favoritas do usuário logado (sem flag por oferta)
  listar: () =>
    api.get<OfertaResponse[]>('/api/favoritos').then(r => r.data),
}
