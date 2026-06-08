import api from './api'
import type { LojaResponse, CategoriaResponse } from '@/types'

export const lojasService = {
  listar: () =>
    api.get<LojaResponse[]>('/api/lojas').then(r => r.data),

  buscarPorId: (id: number) =>
    api.get<LojaResponse>(`/api/lojas/${id}`).then(r => r.data),

  criar: (nome: string, endereco: string, whatsapp?: string) =>
    api.post<LojaResponse>('/api/lojas', { nome, endereco, whatsapp })
      .then(r => r.data),
}

export const categoriasService = {
  listar: () =>
    api.get<CategoriaResponse[]>('/api/categorias').then(r => r.data),
}