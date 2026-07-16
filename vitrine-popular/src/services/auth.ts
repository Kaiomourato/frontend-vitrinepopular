import api from './api'
import type { LoginResponse, UsuarioResponse } from '@/types'

interface RegistrarParams {
  nome:     string
  email:    string
  senha:    string
  perfil:   'COLABORADOR' | 'LOJISTA'
  lojaId?:  number
  pinLoja?: string
}

export const authService = {
  login: (email: string, senha: string) =>
    api.post<LoginResponse>('/api/usuarios/login', { email, senha })
      .then(r => r.data),

  registrar: (params: RegistrarParams) =>
    api.post<UsuarioResponse>('/api/usuarios/registrar', params)
      .then(r => r.data),

  vincularLoja: (lojaId: number, pinLoja: string) =>
    api.patch<UsuarioResponse>('/api/usuarios/vincular-loja', { lojaId, pinLoja })
      .then(r => r.data),

  me: () =>
    api.get<UsuarioResponse>('/api/usuarios/me').then(r => r.data),
}