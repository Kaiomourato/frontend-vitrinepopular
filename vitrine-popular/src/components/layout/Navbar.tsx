import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag, Plus, Compass, LayoutDashboard, LogOut, Heart, ShieldAlert, Trophy } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// No mobile a navegação principal é a BottomNav — este topo fica só com a
// marca. No tablet/desktop ele carrega busca, links e a conta do usuário.
export function Navbar() {
  const { isAutenticado, usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [busca, setBusca] = useState(searchParams.get('q') ?? '')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    if (busca.trim()) navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
  }

  function handleLogout() {
    logout()
    setDropdownAberto(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-white">
      <div className="container-app flex items-center gap-4 h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0 font-display font-extrabold text-lg tracking-tight text-terracota-600">
          <ShoppingBag size={22} />
          <span className="hidden sm:block uppercase tracking-wide">Vitrine Popular</span>
          <span className="sm:hidden">VP</span>
        </Link>

        <NavLink
          to="/descobrir"
          className={({ isActive }) =>
            cn(
              'hidden md:flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors',
              isActive ? 'text-terracota-600' : 'text-ink-700 hover:text-terracota-600'
            )
          }
        >
          <Compass size={16} />
          Descobrir
        </NavLink>

        <NavLink
          to="/ranking"
          className={({ isActive }) =>
            cn(
              'hidden md:flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors',
              isActive ? 'text-terracota-600' : 'text-ink-700 hover:text-terracota-600'
            )
          }
        >
          <Trophy size={16} />
          Ranking
        </NavLink>

        <form onSubmit={handleBusca} className="hidden md:flex flex-1 max-w-xl mx-auto relative">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="O que você procura hoje?"
              className="w-full h-11 pl-10 pr-4 rounded-full text-[15px] border-[1.5px] border-sand-200 bg-cream-50 outline-none transition-colors focus:border-terracota-500 focus:ring-[3px] focus:ring-terracota-500/25"
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        <div className="hidden md:flex items-center gap-2">
          {isAutenticado ? (
            <>
              {usuario?.perfil === 'LOJISTA' && (
                <Link
                  to="/oferta/nova"
                  className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full bg-terracota-500 text-white shadow-brand transition-colors hover:bg-terracota-600"
                >
                  <Plus size={16} />
                  Nova oferta
                </Link>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownAberto(v => !v)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full transition-colors text-sm font-medium border-[1.5px] border-sand-200 text-ink-900',
                    dropdownAberto && 'bg-sand-100'
                  )}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-terracota-50 text-terracota-700">
                    {usuario?.nome?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{usuario?.nome}</span>
                </button>
                {dropdownAberto && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-sand-200 bg-white shadow-lg py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-sand-200">
                      <p className="text-sm font-medium text-ink-900">{usuario?.nome}</p>
                      <p className="text-xs text-ink-500">{usuario?.email}</p>
                    </div>
                    <Link
                      to="/favoritos"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-900 transition-colors hover:bg-sand-100"
                    >
                      <Heart size={15} />
                      Favoritos
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-900 transition-colors hover:bg-sand-100"
                    >
                      <LayoutDashboard size={15} />
                      Meu painel
                    </Link>
                    {usuario?.perfil === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-900 transition-colors hover:bg-sand-100"
                      >
                        <ShieldAlert size={15} />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-perigo-600 transition-colors hover:bg-perigo-50"
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold px-4 py-2 rounded-full border-[1.5px] border-sand-200 text-ink-900 transition-colors hover:bg-sand-100">
                Entrar
              </Link>
              <Link to="/registro" className="text-sm font-bold px-4 py-2 rounded-full bg-terracota-500 text-white shadow-brand transition-colors hover:bg-terracota-600">
                Anunciar grátis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
