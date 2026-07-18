import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Heart, LayoutDashboard, ShieldAlert, LogOut, Plus, ShoppingBag, Trophy } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { gamificacaoService } from '@/services/gamificacao'
import { Button } from '@/components/ui/Button'
import { MedalBadge } from '@/components/ui/MedalBadge'

const ROTULO_PERFIL: Record<string, string> = {
  LOJISTA: 'Lojista',
  COLABORADOR: 'Colaborador',
  ADMIN: 'Administrador',
}

export function Perfil() {
  const { isAutenticado, usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: gamificacao } = useQuery({
    queryKey: ['gamificacao', usuario?.id],
    queryFn: () => gamificacaoService.buscarPorUsuario(usuario!.id),
    enabled: !!usuario?.id,
  })

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!isAutenticado || !usuario) {
    return (
      <div className="container-app py-10 flex flex-col items-center text-center gap-4 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-terracota-50 text-terracota-600">
          <ShoppingBag size={28} />
        </div>
        <div>
          <p className="font-display text-display-sm font-semibold text-ink-900">Entre para salvar seus achados</p>
          <p className="text-sm mt-1 text-ink-700">
            Faça login para favoritar ofertas e acompanhar o que aparece no comércio local.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button onClick={() => navigate('/login')}>Entrar</Button>
          <Button variant="outline" onClick={() => navigate('/registro')}>Criar conta grátis</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-5">
        <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-xl font-bold bg-terracota-50 text-terracota-700">
          {usuario.nome?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate text-ink-900">{usuario.nome}</p>
          <p className="text-sm truncate text-ink-500">{usuario.email}</p>
          <p className="text-xs mt-0.5 text-ink-500">{ROTULO_PERFIL[usuario.perfil] ?? usuario.perfil}</p>
        </div>
        {gamificacao?.medalha && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <MedalBadge medalha={gamificacao.medalha} tamanho="md" comLabel />
            <span className="text-[11px] text-ink-500">{gamificacao.contribuicoesAprovadas} contribuições</span>
          </div>
        )}
      </div>

      <Link
        to="/oferta/nova"
        className="flex items-center justify-center gap-2 h-12 rounded-lg font-medium bg-terracota-500 text-white transition-colors hover:bg-terracota-600"
      >
        <Plus size={18} />
        {usuario.perfil === 'LOJISTA' ? 'Publicar novo achado' : 'Sugerir um achado'}
      </Link>

      <nav className="flex flex-col rounded-xl border border-sand-200 bg-white overflow-hidden">
        <Link to="/favoritos" className="flex items-center gap-3 px-4 py-3.5 text-sm border-b border-sand-200 text-ink-900 transition-colors hover:bg-sand-100">
          <Heart size={17} className="text-ink-500" />
          Meus favoritos
        </Link>
        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 text-sm border-b border-sand-200 text-ink-900 transition-colors hover:bg-sand-100">
          <LayoutDashboard size={17} className="text-ink-500" />
          Meu painel
        </Link>
        <Link to="/ranking" className="flex items-center gap-3 px-4 py-3.5 text-sm border-b border-sand-200 text-ink-900 transition-colors hover:bg-sand-100">
          <Trophy size={17} className="text-ink-500" />
          Ranking
        </Link>
        {usuario.perfil === 'ADMIN' && (
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3.5 text-sm border-b border-sand-200 text-ink-900 transition-colors hover:bg-sand-100">
            <ShieldAlert size={17} className="text-ink-500" />
            Painel admin
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 text-sm text-perigo-600 transition-colors hover:bg-perigo-50"
        >
          <LogOut size={17} />
          Sair
        </button>
      </nav>
    </div>
  )
}
