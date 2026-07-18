import { NavLink } from 'react-router-dom'
import { Home, Compass, Search, PlusCircle, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITENS: { to: string; label: string; icon: LucideIcon; end: boolean; destaque?: boolean }[] = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/descobrir', label: 'Descobrir', icon: Compass, end: false },
  { to: '/busca', label: 'Buscar', icon: Search, end: false },
  { to: '/oferta/nova', label: 'Sugerir', icon: PlusCircle, end: false, destaque: true },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
]

/**
 * Navegação principal no mobile — pill flutuante (não barra full-width).
 * Item ativo ganha um glow âmbar/terracota (nunca azul/roxo — é a cor da
 * marca). "Sugerir" carrega um leve destaque visual próprio: é o diferencial
 * colaborativo do produto, não só mais um item de navegação.
 */
export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed inset-x-3 z-50"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-sm items-stretch justify-between gap-0.5 rounded-full border border-sand-200/80 bg-white/90 backdrop-blur-md shadow-lg px-1.5 py-1.5">
        {ITENS.map(({ to, label, icon: Icon, end, destaque }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[44px] rounded-full py-1.5 text-[10px] font-medium transition-colors duration-200',
                isActive
                  ? 'text-terracota-700 bg-terracota-50 shadow-[0_0_14px_rgba(177,79,38,0.35)]'
                  : 'text-ink-500 hover:text-terracota-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={destaque ? 24 : 21}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={destaque && !isActive ? 'text-terracota-500' : undefined}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
