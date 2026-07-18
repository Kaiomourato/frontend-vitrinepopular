import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { OfflineBanner } from './OfflineBanner'
import { cn } from '@/lib/utils'

// Layout base: Navbar no topo + conteúdo da página abaixo + bottom nav no
// mobile. O <Outlet /> é onde o React Router renderiza a página atual.
export function Layout() {
  const location = useLocation()
  // A Home é o feed vertical full-bleed — a pill de navegação flutua por
  // cima dela (é uma pill com margem, não uma barra full-width), então essa
  // rota não reserva o espaço de respiro que as outras telas precisam.
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
