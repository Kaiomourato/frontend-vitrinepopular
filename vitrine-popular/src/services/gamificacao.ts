import api from './api'
import type { UsuarioGamificacao } from '@/types'

// Estatísticas de gamificação do perfil — endpoint público e isolado do UsuarioResponse
export const gamificacaoService = {
  buscarPorUsuario: (usuarioId: number) =>
    api.get<UsuarioGamificacao>(`/api/usuarios/${usuarioId}/gamificacao`).then(r => r.data),
}
