import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function RotaAdmin() {
  const { isAutenticado, usuario } = useAuthStore()

  if (!isAutenticado || usuario?.perfil !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
