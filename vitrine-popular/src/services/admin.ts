import api from './api'
import type { LojaResponse, OfertaResponse, StatusOferta } from '@/types'

export interface EditarLojaDados {
  nome?: string
  endereco?: string
  whatsapp?: string
  isParceira?: boolean
}

// Painel administrativo (RF12) — restrito a usuários com perfil ADMIN
export const adminService = {
  listarOfertas: (status?: StatusOferta) =>
    api.get<OfertaResponse[]>('/api/admin/ofertas', { params: { status } }).then(r => r.data),

  removerOferta: (id: number) =>
    api.delete(`/api/admin/ofertas/${id}`).then(r => r.data),

  editarLoja: (id: number, dados: EditarLojaDados) =>
    api.patch<LojaResponse>(`/api/admin/lojas/${id}`, dados).then(r => r.data),

  removerLoja: (id: number) =>
    api.delete(`/api/admin/lojas/${id}`).then(r => r.data),
}
