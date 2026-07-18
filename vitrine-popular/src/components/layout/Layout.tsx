import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { OfflineBanner } from './OfflineBanner'
import { cn } from '@/lib/utils'

// Layout base: Navbar no topo + conteúdo da página abaixo + bottom nav no
// mobile. O <Outlet /> é onde o React Router renderiza a página atual.
export function Layout() {
  const location = useLocation()
  // A Home é o feed vertical full-bleed — a TabBar fica por cima dela
  // (full-bleed já reserva a própria margem visual via scrim), então essa
  // rota não precisa do espaço de respiro extra que as outras telas usam.
  const isFeedVertical = location.pathname === '/'
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <OfflineBanner />
      <main className={cn('flex-1', !isFeedVertical && 'pb-24 md:pb-0')}>
        {/* key força o re-mount por rota, retriggando a transição suave */}
        <div key={location.pathname} className="motion-safe:animate-surgir">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
