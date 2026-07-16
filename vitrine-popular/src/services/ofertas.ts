import api from './api'
import type { ListarOfertasParams, OfertaResponse, PageResponse } from '@/types'

// ── Queries públicas (sem token) ──────────────────────────────────────────────

export const ofertasService = {
  // Feed principal paginado — aceita ordenação e filtros combináveis (RF06/RF07)
  listar: ({ page = 0, size = 12, sort, precoMin, precoMax, categoriaId }: ListarOfertasParams = {}) =>
    api.get<PageResponse<OfertaResponse>>('/api/ofertas', {
      params: { page, size, sort, precoMin, precoMax, categoriaId },
    }).then(r => r.data),

  // Detalhes de uma oferta
  buscarPorId: (id: number) =>
    api.get<OfertaResponse>(`/api/ofertas/${id}`).then(r => r.data),

  // Ofertas de uma categoria
  porCategoria: (categoriaId: number, page = 0, size = 12) =>
    api.get<PageResponse<OfertaResponse>>(`/api/ofertas/categoria/${categoriaId}`, {
      params: { page, size },
    }).then(r => r.data),

  // Ofertas de uma loja
  porLoja: (lojaId: number, page = 0, size = 12) =>
    api.get<PageResponse<OfertaResponse>>(`/api/ofertas/loja/${lojaId}`, {
      params: { page, size },
    }).then(r => r.data),

  // Busca por texto
  buscar: (q: string, page = 0, size = 12) =>
    api.get<PageResponse<OfertaResponse>>('/api/ofertas/busca', {
      params: { q, page, size },
    }).then(r => r.data),

  // Sinalização colaborativa (RF10) — agora exigem token e bloqueiam voto duplicado
  votarAcabou: (id: number) =>
    api.patch(`/api/ofertas/${id}/votar-acabou`).then(r => r.data),

  votarAindaTem: (id: number) =>
    api.patch(`/api/ofertas/${id}/votar-ainda-tem`).then(r => r.data),

  // ── Mutations autenticadas ──────────────────────────────────────────────────

  // Criar oferta (multipart/form-data — imagem + JSON)
  criar: (dadosJson: string, imagem: File) => {
    const form = new FormData()
    form.append('dados', dadosJson)
    form.append('imagem', imagem)
    return api.post<OfertaResponse>('/api/ofertas', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  // Editar oferta (imagem opcional)
  editar: (id: number, dadosJson: string, imagem?: File) => {
    const form = new FormData()
    form.append('dados', dadosJson)
    if (imagem) form.append('imagem', imagem)
    return api.patch<OfertaResponse>(`/api/ofertas/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  // Deletar oferta
  deletar: (id: number) =>
    api.delete(`/api/ofertas/${id}`),
}