import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function RotaProtegida() {
  const isAutenticado = useAuthStore(s => s.isAutenticado)

  if (!isAutenticado) {
    // Redireciona para login preservando a rota que o usuário tentou acessar
    return <Navigate to="/login" replace />
  }

  // Renderiza a rota filha normalmente
  return <Outlet />
}