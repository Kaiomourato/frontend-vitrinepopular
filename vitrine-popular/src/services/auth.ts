import api from './api'
import type { LoginResponse, UsuarioResponse } from '@/types'

export const authService = {
  login: (email: string, senha: string) =>
    api.post<LoginResponse>('/api/usuarios/login', { email, senha })
      .then(r => r.data),

  registrar: (nome: string, email: string, senha: string) =>
    api.post<UsuarioResponse>('/api/usuarios/registrar', { nome, email, senha })
      .then(r => r.data),

  // Busca o perfil do usuário autenticado pelo token
  me: () =>
    api.get<UsuarioResponse>('/api/usuarios/me').then(r => r.data),
}