import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RotaProtegida } from '@/components/auth/RotaProtegida'
import { RotaAdmin } from '@/components/auth/RotaAdmin'
import { Layout } from '@/components/layout/Layout'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { Spinner } from '@/components/ui'

const Feed          = lazy(() => import('@/pages/Feed').then(m => ({ default: m.Feed })))
const Descobrir      = lazy(() => import('@/pages/Descobrir').then(m => ({ default: m.Descobrir })))
const DetalheOferta  = lazy(() => import('@/pages/DetalheOferta').then(m => ({ default: m.DetalheOferta })))
const PaginaLoja     = lazy(() => import('@/pages/PaginaLoja').then(m => ({ default: m.PaginaLoja })))
const Busca          = lazy(() => import('@/pages/Busca').then(m => ({ default: m.Busca })))
const Ranking        = lazy(() => import('@/pages/Ranking').then(m => ({ default: m.Ranking })))
const Perfil         = lazy(() => import('@/pages/Perfil').then(m => ({ default: m.Perfil })))
const Login          = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Registro       = lazy(() => import('@/pages/Registro').then(m => ({ default: m.Registro })))
const Dashboard      = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const NovaOferta     = lazy(() => import('@/pages/NovaOferta').then(m => ({ default: m.NovaOferta })))
const EditarOferta   = lazy(() => import('@/pages/EditarOferta').then(m => ({ default: m.EditarOferta })))
const Favoritos      = lazy(() => import('@/pages/Favoritos').then(m => ({ default: m.Favoritos })))
const PainelAdmin    = lazy(() => import('@/pages/admin/PainelAdmin').then(m => ({ default: m.PainelAdmin })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 2 * 60 * 1000 },
  },
})

function CarregandoRota() {
  return (
    <div className="container-app py-24 flex justify-center">
      <Spinner size={28} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<CarregandoRota />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Feed />} />
              <Route path="/descobrir"   element={<Descobrir />} />
              <Route path="/oferta/:id"  element={<DetalheOferta />} />
              <Route path="/loja/:id"    element={<PaginaLoja />} />
              <Route path="/busca"       element={<Busca />} />
              <Route path="/ranking"     element={<Ranking />} />
              <Route path="/perfil"      element={<Perfil />} />
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
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
