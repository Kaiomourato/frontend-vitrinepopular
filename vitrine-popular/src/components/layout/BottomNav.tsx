import { NavLink } from 'react-router-dom'
import { Home, Compass, Search, Plus, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITENS_ESQUERDA: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/descobrir', label: 'Descobrir', icon: Compass, end: false },
]

const ITENS_DIREITA: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/busca', label: 'Buscar', icon: Search, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
]

function Tab({ to, label, icon: Icon, end }: { to: string; label: string; icon: LucideIcon; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 min-h-11 rounded-lg py-1.5"
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.3 : 1.9} className={isActive ? 'text-terracota-500' : 'text-ink-500'} />
          <span className={cn('text-[10.5px]', isActive ? 'font-bold text-terracota-500' : 'font-semibold text-ink-500')}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

/**
 * Navegação inferior mobile — barra full-width com o item "Sugerir" como
 * FAB hexagonal (motivo do mel da marca), saltado acima da barra. Único
 * diferencial colaborativo do produto, por isso ganha destaque próprio em
 * vez de ser só mais um item de navegação.
 */
export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around gap-0.5 bg-white border-t border-sand-200 px-2 pt-1.5"
      style={{
        boxShadow: '0 -6px 20px -12px rgb(26 44 56 / 0.28)',
        paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom))',
      }}
    >
      {ITENS_ESQUERDA.map(item => <Tab key={item.to} {...item} />)}

      <NavLink
        to="/oferta/nova"
        aria-label="Sugerir um achado"
        className="flex flex-none -mt-[22px] flex-col items-center justify-center"
      >
        {({ isActive }) => (
          <span
            className={cn(
              'flex items-center justify-center w-[52px] h-[52px] text-white shadow-brand transition-transform active:scale-90',
              isActive ? 'bg-terracota-600' : 'bg-terracota-500'
            )}
            style={{ clipPath: 'var(--hex-clip)' }}
          >
            <Plus size={26} strokeWidth={2.4} />
          </span>
        )}
      </NavLink>

      {ITENS_DIREITA.map(item => <Tab key={item.to} {...item} />)}
    </nav>
  )
}
