import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ShoppingBag, Clock, XCircle, Check, X, Sparkles } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { Button, Badge, EmptyState } from '@/components/ui'
import { dispararToast } from '@/components/ui'
import { cn, formatarPreco, formatarDataRelativa, extrairErroApi } from '@/lib/utils'
import type { StatusOferta } from '@/types'

const STATUS_LABEL: Record<StatusOferta, string> = {
  ATIVA: 'Ativa',
  EXPIRADA: 'Expirada',
  REMOVIDA: 'Removida',
  PENDENTE: 'Pendente',
}
const STATUS_VARIANT: Record<StatusOferta, 'success' | 'warning' | 'danger' | 'primary'> = {
  ATIVA: 'success',
  EXPIRADA: 'warning',
  REMOVIDA: 'danger',
  PENDENTE: 'primary',
}

export function Dashboard() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filtro, setFiltro] = useState<StatusOferta | 'TODAS'>('TODAS')
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)

  const lojaId = usuario?.loja?.id

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'ofertas', lojaId],
    queryFn: () => ofertasService.porLoja(lojaId!, 0, 100),
    enabled: !!lojaId,
  })

  const deletar = useMutation({
    mutationFn: (id: number) => ofertasService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast('Oferta removida com sucesso.', 'success')
      setConfirmandoId(null)
    },
    onError: () => {
      dispararToast('Não foi possível remover a oferta.', 'error')
      setConfirmandoId(null)
    },
  })

  // [NOVO] Fila de moderação (RF12 estendido) — sugestões de COLABORADOR aguardando
  // aprovação do lojista dono. O backend já escopa a fila pela loja do usuário logado.
  const { data: pendentesData } = useQuery({
    queryKey: ['dashboard', 'pendentes', lojaId],
    queryFn: () => ofertasService.listarPendentes(0, 50),
    enabled: !!lojaId,
  })
  const pendentes = pendentesData?.content ?? []

  function invalidarPendentesEFeed() {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['ofertas'] })
  }

  const aprovar = useMutation({
    mutationFn: (id: number) => ofertasService.aprovar(id),
    onSuccess: () => {
      invalidarPendentesEFeed()
      dispararToast('Oferta aprovada e publicada!', 'success')
    },
    onError: (err) => dispararToast(extrairErroApi(err), 'error'),
  })

  const rejeitar = useMutation({
    mutationFn: (id: number) => ofertasService.rejeitar(id),
    onSuccess: () => {
      invalidarPendentesEFeed()
      dispararToast('Sugestão rejeitada.', 'success')
    },
    onError: (err) => dispararToast(extrairErroApi(err), 'error'),
  })

  const ofertas = data?.content ?? []
  const ofertasFiltradas = filtro === 'TODAS' ? ofertas : ofertas.filter(o => o.status === filtro)

  const contadores = {
    TODAS: ofertas.length,
    ATIVA: ofertas.filter(o => o.status === 'ATIVA').length,
    EXPIRADA: ofertas.filter(o => o.status === 'EXPIRADA').length,
    REMOVIDA: ofertas.filter(o => o.status === 'REMOVIDA').length,
  }

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-semibold text-ink-900">Meu painel</h1>
          {usuario?.loja && (
            <p className="text-sm mt-0.5 text-ink-700">
              Loja: <Link to={`/loja/${usuario.loja.id}`} className="font-medium text-terracota-600">{usuario.loja.nome}</Link>
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/oferta/nova')}>
          <Plus size={16} /> Nova oferta
        </Button>
      </div>

      {!!pendentes.length && (
        <section className="flex flex-col gap-3 rounded-xl border border-mel-200 bg-mel-50 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-sm text-ink-900">
            <Sparkles size={16} className="text-mel-600" />
            Sugestões aguardando sua aprovação ({pendentes.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pendentes.map(oferta => (
              <div key={oferta.id} className="flex items-center gap-3 p-3 rounded-xl border border-sand-200 bg-white">
                {oferta.imagemUrl && (
                  <img
                    src={oferta.imagemUrl}
                    alt={oferta.produtoNome}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-sand-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-ink-900">{oferta.produtoNome}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-ink-700">
                    <span className="font-semibold text-terracota-700">{formatarPreco(oferta.preco)}</span>
                    {oferta.autor && <span>Sugerido por {oferta.autor.nome}</span>}
                    <span className="text-ink-500">{formatarDataRelativa(oferta.dataPostagem)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={rejeitar.isPending && rejeitar.variables === oferta.id}
                    onClick={() => rejeitar.mutate(oferta.id)}
                  >
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    loading={aprovar.isPending && aprovar.variables === oferta.id}
                    onClick={() => aprovar.mutate(oferta.id)}
                  >
                    <Check size={14} /> Aprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['TODAS', 'ATIVA', 'EXPIRADA', 'REMOVIDA'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={cn(
              'p-4 rounded-xl border text-left transition-colors hover:border-terracota-500',
              filtro === s ? 'bg-terracota-50 border-terracota-500' : 'bg-white border-sand-200'
            )}
          >
            <p className={cn('text-2xl font-semibold font-display', filtro === s ? 'text-terracota-700' : 'text-ink-900')}>
              {contadores[s]}
            </p>
            <p className="text-xs mt-0.5 text-ink-700">
              {s === 'TODAS' ? 'Total' : STATUS_LABEL[s]}
            </p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-sand-100" />
          ))}
        </div>
      ) : !usuario?.loja ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          titulo="Nenhuma loja vinculada"
          descricao="Sua conta não está associada a uma loja. Entre em contato com o administrador."
        />
      ) : !ofertasFiltradas.length ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          titulo="Nenhuma oferta aqui"
          descricao={filtro === 'TODAS' ? 'Publique sua primeira oferta!' : `Nenhuma oferta ${STATUS_LABEL[filtro as StatusOferta].toLowerCase()}.`}
          acao={filtro === 'TODAS' ? <Button onClick={() => navigate('/oferta/nova')}><Plus size={16} /> Nova oferta</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {ofertasFiltradas.map(oferta => (
            <div key={oferta.id} className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-sand-200 bg-white">
              {oferta.imagemUrl && (
                <img
                  src={oferta.imagemUrl}
                  alt={oferta.produtoNome}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border border-sand-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-ink-900">{oferta.produtoNome}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-terracota-700">{formatarPreco(oferta.preco)}</span>
                  <Badge variant={STATUS_VARIANT[oferta.status]}>{STATUS_LABEL[oferta.status]}</Badge>
                </div>
                <p className="text-xs mt-0.5 flex items-center gap-1 text-ink-500">
                  <Clock size={11} />{formatarDataRelativa(oferta.dataPostagem)}
                  {oferta.votosAcabou > 0 && (
                    <span className="ml-2 flex items-center gap-0.5 text-perigo-600">
                      <XCircle size={11} /> {oferta.votosAcabou} voto{oferta.votosAcabou > 1 ? 's' : ''} "acabou"
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/oferta/${oferta.id}/editar`)}>
                  <Edit size={15} />
                </Button>
                {confirmandoId === oferta.id ? (
                  <div className="flex gap-1">
                    <Button variant="danger" size="sm" loading={deletar.isPending} onClick={() => deletar.mutate(oferta.id)}>
                      Confirmar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmandoId(null)}>Cancelar</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmandoId(oferta.id)}>
                    <Trash2 size={15} className="text-perigo-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
