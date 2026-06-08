import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ShoppingBag, Clock, XCircle } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { useAuthStore } from '@/store/authStore'
import { Button, Badge, Spinner, EmptyState } from '@/components/ui'
import { dispararToast } from '@/components/ui'
import { formatarPreco, formatarDataRelativa } from '@/lib/utils'
import type { StatusOferta } from '@/types'

const STATUS_LABEL: Record<StatusOferta, string> = {
  ATIVA: 'Ativa',
  EXPIRADA: 'Expirada',
  REMOVIDA: 'Removida',
}
const STATUS_VARIANT: Record<StatusOferta, 'success' | 'warning' | 'danger'> = {
  ATIVA: 'success',
  EXPIRADA: 'warning',
  REMOVIDA: 'danger',
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Meu painel</h1>
          {usuario?.loja && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Loja: <Link to={`/loja/${usuario.loja.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{usuario.loja.nome}</Link>
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/oferta/nova')}>
          <Plus size={16} /> Nova oferta
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['TODAS', 'ATIVA', 'EXPIRADA', 'REMOVIDA'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className="p-4 rounded-[14px] border text-left transition-all hover:border-[var(--color-primary)]"
            style={{
              background: filtro === s ? 'var(--color-primary-light)' : 'var(--color-surface)',
              borderColor: filtro === s ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            <p className="text-2xl font-bold" style={{ color: filtro === s ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
              {contadores[s]}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {s === 'TODAS' ? 'Total' : STATUS_LABEL[s]}
            </p>
          </button>
        ))}
      </div>

      {/* Lista de ofertas */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
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
            <div
              key={oferta.id}
              className="flex items-center gap-3 p-3 md:p-4 rounded-[12px] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <img
                src={oferta.imagemUrl}
                alt={oferta.produtoNome}
                className="w-14 h-14 rounded-[10px] object-cover shrink-0 border"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{oferta.produtoNome}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{formatarPreco(oferta.preco)}</span>
                  <Badge variant={STATUS_VARIANT[oferta.status]}>{STATUS_LABEL[oferta.status]}</Badge>
                </div>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={11} />{formatarDataRelativa(oferta.dataPostagem)}
                  {oferta.votosAcabou > 0 && (
                    <span className="ml-2 flex items-center gap-0.5" style={{ color: 'var(--color-danger)' }}>
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
                    <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
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