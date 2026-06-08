import { create } from 'zustand'
import type { UsuarioResponse } from '@/types'

interface AuthState {
  token: string | null
  usuario: UsuarioResponse | null
  isAutenticado: boolean

  // Actions
  login: (token: string, usuario: UsuarioResponse) => void
  logout: () => void
  setUsuario: (usuario: UsuarioResponse) => void
}

// Zustand com persistência manual no localStorage.
// Não usamos o middleware persist do Zustand para ter controle
// explícito sobre o que vai pro storage (token + dados básicos).
export const useAuthStore = create<AuthState>((set) => ({
  // Inicializa lendo o localStorage — mantém sessão após recarregar a página
  token: localStorage.getItem('vp_token'),
  usuario: (() => {
    try {
      const raw = localStorage.getItem('vp_usuario')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })(),
  isAutenticado: !!localStorage.getItem('vp_token'),

  login: (token, usuario) => {
    localStorage.setItem('vp_token', token)
    localStorage.setItem('vp_usuario', JSON.stringify(usuario))
    set({ token, usuario, isAutenticado: true })
  },

  logout: () => {
    localStorage.removeItem('vp_token')
    localStorage.removeItem('vp_usuario')
    set({ token: null, usuario: null, isAutenticado: false })
  },

  setUsuario: (usuario) => {
    localStorage.setItem('vp_usuario', JSON.stringify(usuario))
    set({ usuario })
  },
}))