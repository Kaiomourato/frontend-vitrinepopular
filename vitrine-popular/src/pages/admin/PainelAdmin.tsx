import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Edit, ShieldAlert, Store, ShoppingBag, Check, X } from 'lucide-react'
import { adminService } from '@/services/admin'
import { lojasService } from '@/services/lojas'
import { ofertasService } from '@/services/ofertas'
import { Button, Badge, Select, EmptyState, dispararToast } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { formatarPreco, formatarDataRelativa, extrairErroApi } from '@/lib/utils'
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

interface EditLojaForm {
  nome: string
  endereco: string
  whatsapp: string
}

function ListaSkeleton({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-sand-100" />
      ))}
    </div>
  )
}

export function PainelAdmin() {
  const queryClient = useQueryClient()

  // ── Ofertas ──────────────────────────────────────────────────────────────
  const [filtroStatus, setFiltroStatus] = useState<StatusOferta | 'TODAS'>('TODAS')
  const [confirmandoOfertaId, setConfirmandoOfertaId] = useState<number | null>(null)

  const { data: ofertas = [], isLoading: loadingOfertas } = useQuery({
    queryKey: ['admin', 'ofertas', filtroStatus],
    queryFn: () => adminService.listarOfertas(filtroStatus === 'TODAS' ? undefined : filtroStatus),
  })

  const removerOferta = useMutation({
    mutationFn: (id: number) => adminService.removerOferta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ofertas'] })
      dispararToast('Oferta removida.', 'success')
      setConfirmandoOfertaId(null)
    },
    onError: (err) => {
      dispararToast(extrairErroApi(err), 'error')
      setConfirmandoOfertaId(null)
    },
  })

  // [NOVO] Moderação (RF12 estendido) — admin também pode aprovar/rejeitar sugestões
  const aprovarOferta = useMutation({
    mutationFn: (id: number) => ofertasService.aprovar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ofertas'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast('Oferta aprovada.', 'success')
    },
    onError: (err) => dispararToast(extrairErroApi(err), 'error'),
  })

  const rejeitarOferta = useMutation({
    mutationFn: (id: number) => ofertasService.rejeitar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ofertas'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast('Sugestão rejeitada.', 'success')
    },
    onError: (err) => dispararToast(extrairErroApi(err), 'error'),
  })

  // ── Lojas ────────────────────────────────────────────────────────────────
  const [editandoLojaId, setEditandoLojaId] = useState<number | null>(null)
  const [confirmandoLojaId, setConfirmandoLojaId] = useState<number | null>(null)
  const [form, setForm] = useState<EditLojaForm>({ nome: '', endereco: '', whatsapp: '' })

  const { data: lojas = [], isLoading: loadingLojas } = useQuery({
    queryKey: ['admin', 'lojas'],
    queryFn: lojasService.listar,
  })

  const editarLoja = useMutation({
    mutationFn: (id: number) => adminService.editarLoja(id, {
      nome: form.nome,
      endereco: form.endereco,
      whatsapp: form.whatsapp,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lojas'] })
      dispararToast('Loja atualizada.', 'success')
      setEditandoLojaId(null)
    },
    onError: (err) => dispararToast(extrairErroApi(err), 'error'),
  })

  const removerLoja = useMutation({
    mutationFn: (id: number) => adminService.removerLoja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lojas'] })
      dispararToast('Loja removida.', 'success')
      setConfirmandoLojaId(null)
    },
    onError: (err) => {
      dispararToast(extrairErroApi(err), 'error')
      setConfirmandoLojaId(null)
    },
  })

  function iniciarEdicao(loja: { id: number; nome: string; endereco: string | null; whatsapp: string | null }) {
    setEditandoLojaId(loja.id)
    setForm({ nome: loja.nome, endereco: loja.endereco ?? '', whatsapp: loja.whatsapp ?? '' })
  }

  return (
    <div className="container-app py-6 flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <ShieldAlert size={24} className="text-terracota-600" />
        <h1 className="font-display text-display-md font-semibold text-ink-900">Painel administrativo</h1>
      </div>

      {/* ── Ofertas ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-ink-900">
            <ShoppingBag size={18} /> Ofertas
          </h2>
          <div className="w-44">
            <Select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value as StatusOferta | 'TODAS')}
            >
              <option value="TODAS">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATIVA">Ativa</option>
              <option value="EXPIRADA">Expirada</option>
              <option value="REMOVIDA">Removida</option>
            </Select>
          </div>
        </div>

        {loadingOfertas ? (
          <ListaSkeleton />
        ) : !ofertas.length ? (
          <EmptyState icon={<ShoppingBag size={22} />} titulo="Nenhuma oferta encontrada" />
        ) : (
          <div className="flex flex-col gap-2">
            {ofertas.map(oferta => (
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
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-ink-700">{oferta.loja.nome}</span>
                    <span className="text-xs font-semibold text-terracota-700">{formatarPreco(oferta.preco)}</span>
                    <Badge variant={STATUS_VARIANT[oferta.status]}>{STATUS_LABEL[oferta.status]}</Badge>
                    <span className="text-xs text-ink-500">{formatarDataRelativa(oferta.dataPostagem)}</span>
                  </div>
                </div>
                {confirmandoOfertaId === oferta.id ? (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="danger" size="sm" loading={removerOferta.isPending} onClick={() => removerOferta.mutate(oferta.id)}>
                      Confirmar remoção
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmandoOfertaId(null)}>Cancelar</Button>
                  </div>
                ) : oferta.status === 'PENDENTE' ? (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={rejeitarOferta.isPending && rejeitarOferta.variables === oferta.id}
                      onClick={() => rejeitarOferta.mutate(oferta.id)}
                    >
                      <X size={14} />
                    </Button>
                    <Button
                      size="sm"
                      loading={aprovarOferta.isPending && aprovarOferta.variables === oferta.id}
                      onClick={() => aprovarOferta.mutate(oferta.id)}
                    >
                      <Check size={14} /> Aprovar
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmandoOfertaId(oferta.id)}>
                    <Trash2 size={15} className="text-perigo-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Lojas ── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg flex items-center gap-2 text-ink-900">
          <Store size={18} /> Lojas
        </h2>

        {loadingLojas ? (
          <ListaSkeleton />
        ) : !lojas.length ? (
          <EmptyState icon={<Store size={22} />} titulo="Nenhuma loja cadastrada" />
        ) : (
          <div className="flex flex-col gap-2">
            {lojas.map(loja => (
              <div key={loja.id} className="flex flex-col gap-3 p-3 rounded-xl border border-sand-200 bg-white">
                {editandoLojaId === loja.id ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Input label="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                      <Input label="Endereço" value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
                      <Input label="WhatsApp" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" loading={editarLoja.isPending} onClick={() => editarLoja.mutate(loja.id)}>Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditandoLojaId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-ink-900">{loja.nome}</p>
                        {loja.isParceira && <Badge variant="primary">Parceira</Badge>}
                      </div>
                      <p className="text-xs mt-0.5 text-ink-700">
                        {loja.endereco ?? 'Sem endereço'} {loja.whatsapp ? `• ${loja.whatsapp}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => iniciarEdicao(loja)}>
                        <Edit size={15} />
                      </Button>
                      {confirmandoLojaId === loja.id ? (
                        <div className="flex flex-col gap-2 items-end">
                          <p className="text-xs max-w-xs text-right text-perigo-600">
                            Remover esta loja apaga também suas ofertas, favoritos e votos vinculados, e desvincula os lojistas. Confirma?
                          </p>
                          <div className="flex gap-1">
                            <Button variant="danger" size="sm" loading={removerLoja.isPending} onClick={() => removerLoja.mutate(loja.id)}>
                              Confirmar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmandoLojaId(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmandoLojaId(loja.id)}>
                          <Trash2 size={15} className="text-perigo-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
