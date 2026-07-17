import { NavLink } from 'react-router-dom'
import { Home, Compass, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITENS = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/descobrir', label: 'Descobrir', icon: Compass, end: false },
  { to: '/busca', label: 'Buscar', icon: Search, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
]

/**
 * Navegação principal no mobile. Substitui o hambúrguer do Navbar — telas
 * pequenas navegam por aqui, o topo fica só com a marca.
 * Áreas de toque ≥44px e respeita a safe-area do iOS em modo standalone.
 */
export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-sand-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {ITENS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs font-medium transition-colors',
                isActive ? 'text-terracota-600' : 'text-ink-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
