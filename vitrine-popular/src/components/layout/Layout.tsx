import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

// Layout base: Navbar no topo + conteúdo da página abaixo.
// O <Outlet /> é onde o React Router renderiza a página atual.
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}