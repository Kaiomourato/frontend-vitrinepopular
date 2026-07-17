import api from './api'
import type { OfertaResponse, PageResponse, RankingColaborador, RankingLoja } from '@/types'

// Rankings públicos de gamificação (RF gamificação)
export const rankingService = {
  colaboradores: (page = 0, size = 10) =>
    api.get<PageResponse<RankingColaborador>>('/api/ranking/colaboradores', {
      params: { page, size },
    }).then(r => r.data),

  lojas: (page = 0, size = 10) =>
    api.get<PageResponse<RankingLoja>>('/api/ranking/lojas', {
      params: { page, size },
    }).then(r => r.data),

  ofertas: (page = 0, size = 10) =>
    api.get<PageResponse<OfertaResponse>>('/api/ranking/ofertas', {
      params: { page, size },
    }).then(r => r.data),
}
