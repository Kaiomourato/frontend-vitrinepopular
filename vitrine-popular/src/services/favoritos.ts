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

  // TODO: a API não expõe uma contagem agregada de favoritos por oferta
  // (nem em OfertaResponse, nem aqui). O OfertaCard não mostra "N
  // interessados" por isso — não fabricar esse número no front. Se o
  // back-end passar a expor esse campo, plugar aqui.
}
