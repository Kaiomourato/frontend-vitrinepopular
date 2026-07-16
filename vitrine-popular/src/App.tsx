import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RotaProtegida } from '@/components/auth/RotaProtegida'
import { RotaAdmin } from '@/components/auth/RotaAdmin'
import { Layout } from '@/components/layout/Layout'
import { ToastContainer } from '@/components/ui/ToastContainer'

import { Feed }          from '@/pages/Feed'
import { DetalheOferta } from '@/pages/DetalheOferta'
import { PaginaLoja }    from '@/pages/PaginaLoja'
import { Busca }         from '@/pages/Busca'
import { Login }         from '@/pages/Login'
import { Registro }      from '@/pages/Registro'
import { Dashboard }     from '@/pages/Dashboard'
import { NovaOferta }    from '@/pages/NovaOferta'
import { EditarOferta }  from '@/pages/EditarOferta'
import { Favoritos }     from '@/pages/Favoritos'
import { PainelAdmin }   from '@/pages/admin/PainelAdmin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 2 * 60 * 1000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="/oferta/:id"  element={<DetalheOferta />} />
            <Route path="/loja/:id"    element={<PaginaLoja />} />
            <Route path="/busca"       element={<Busca />} />
          </Route>

          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route path="/dashboard"         element={<Dashboard />} />
              <Route path="/oferta/nova"       element={<NovaOferta />} />
              <Route path="/oferta/:id/editar" element={<EditarOferta />} />
              <Route path="/favoritos"         element={<Favoritos />} />
            </Route>
          </Route>

          <Route element={<RotaAdmin />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<PainelAdmin />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  )
}