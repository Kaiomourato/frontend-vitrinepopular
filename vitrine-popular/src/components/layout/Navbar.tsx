import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag, User, Plus, LayoutDashboard, LogOut, Menu, X, Heart, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function Navbar() {
  const { isAutenticado, usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [busca, setBusca] = useState(searchParams.get('q') ?? '')
  const [menuAberto, setMenuAberto] = useState(false)
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
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
      setMenuAberto(false)
    }
  }

  function handleLogout() {
    logout()
    setDropdownAberto(false)
    navigate('/')
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="container-app flex items-center gap-3 h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 font-bold text-lg tracking-tight"
          style={{ color: 'var(--color-primary)' }}
        >
          <ShoppingBag size={22} />
          <span className="hidden sm:block">Vitrine Popular</span>
          <span className="sm:hidden">VP</span>
        </Link>

        {/* Busca desktop */}
        <form onSubmit={handleBusca} className="hidden md:flex flex-1 max-w-xl mx-auto relative">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produtos e promoções..."
              className="w-full h-10 pl-10 pr-4 rounded-full text-sm border outline-none transition-all"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAutenticado ? (
            <>
              {usuario?.perfil === 'LOJISTA' && (
                <Link
                  to="/oferta/nova"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-[10px] transition-all"
                  style={{ background: 'var(--color-primary)', color: '#fff' }}
                >
                  <Plus size={16} />
                  Nova oferta
                </Link>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownAberto(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[10px] transition-all text-sm font-medium border"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: dropdownAberto ? 'var(--color-surface-hover)' : 'transparent',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    {usuario?.nome?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{usuario?.nome}</span>
                </button>
                {dropdownAberto && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-[12px] border shadow-lg py-1 z-50"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{usuario?.nome}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{usuario?.email}</p>
                    </div>
                    <Link
                      to="/favoritos"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-[var(--color-surface-hover)]"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Heart size={15} />
                      Favoritos
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-[var(--color-surface-hover)]"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <LayoutDashboard size={15} />
                      Meu painel
                    </Link>
                    {usuario?.perfil === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-[var(--color-surface-hover)]"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        <ShieldAlert size={15} />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-[var(--color-danger-light)]"
                      style={{ color: 'var(--color-danger)' }}
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
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-[10px] transition-all border"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className="text-sm font-medium px-4 py-2 rounded-[10px] transition-all"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                Anunciar grátis
              </Link>
            </>
          )}
        </div>

        {/* Hamburguer mobile */}
        <button
          onClick={() => setMenuAberto(v => !v)}
          className="md:hidden p-2 rounded-[10px] transition-all"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Menu"
        >
          {menuAberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <form onSubmit={handleBusca} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full h-10 pl-10 pr-4 rounded-full text-sm border outline-none"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </form>
          {isAutenticado ? (
            <>
              <div className="flex items-center gap-2 py-1" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <User size={16} />
                {usuario?.nome}
              </div>
              <Link to="/favoritos" onClick={() => setMenuAberto(false)} className="flex items-center gap-2 text-sm py-1" style={{ color: 'var(--color-text-primary)' }}>
                <Heart size={16} /> Favoritos
              </Link>
              <Link to="/dashboard" onClick={() => setMenuAberto(false)} className="flex items-center gap-2 text-sm py-1" style={{ color: 'var(--color-text-primary)' }}>
                <LayoutDashboard size={16} /> Meu painel
              </Link>
              {usuario?.perfil === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMenuAberto(false)} className="flex items-center gap-2 text-sm py-1" style={{ color: 'var(--color-text-primary)' }}>
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}
              {usuario?.perfil === 'LOJISTA' && (
                <Link to="/oferta/nova" onClick={() => setMenuAberto(false)}
                  className="flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-[10px]"
                  style={{ background: 'var(--color-primary)', color: '#fff' }}>
                  <Plus size={16} /> Nova oferta
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm py-1" style={{ color: 'var(--color-danger)' }}>
                <LogOut size={16} /> Sair
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuAberto(false)}
                className="text-sm font-medium py-2.5 rounded-[10px] border text-center"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                Entrar
              </Link>
              <Link to="/registro" onClick={() => setMenuAberto(false)}
                className="text-sm font-medium py-2.5 rounded-[10px] text-center"
                style={{ background: 'var(--color-primary)', color: '#fff' }}>
                Anunciar grátis
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}