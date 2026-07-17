import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, User, Mail, Lock, Store, Users,
  ChevronRight, ChevronLeft, KeyRound, PlusCircle, Search
} from 'lucide-react'
import { authService } from '@/services/auth'
import { lojasService } from '@/services/lojas'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { extrairErroApi, cn } from '@/lib/utils'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Resolver } from 'react-hook-form'
import type { LojaResponse } from '@/types'

// ── Schemas ───────────────────────────────────────────────────────────────────

const schemaBase = z.object({
  nome:           z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:          z.string().email('E-mail inválido'),
  senha:          z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string(),
  tipo:           z.enum(['COLABORADOR', 'LOJISTA']),
}).refine(d => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

const schemaNovaLoja = z.object({
  nome:     z.string().min(2, 'Nome da loja obrigatório'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  whatsapp: z.string().optional(),
})

const schemaVincular = z.object({
  lojaId: z.coerce.number().min(1, 'Selecione uma loja'),
  pin:    z.string().min(1, 'Digite o PIN da loja'),
})

type FormBase     = z.infer<typeof schemaBase>
type FormNovaLoja = z.infer<typeof schemaNovaLoja>
type FormVincular = z.infer<typeof schemaVincular>
type SubPasso     = 'escolha' | 'nova-loja' | 'pin-gerado' | 'vincular'

// ── Componente ────────────────────────────────────────────────────────────────

export function Registro() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [passo,      setPasso]      = useState<1 | 2>(1)
  const [subPasso,   setSubPasso]   = useState<SubPasso>('escolha')
  const [loading,    setLoading]    = useState(false)
  const [dadosBase,  setDadosBase]  = useState<FormBase | null>(null)
  const [lojaCriada, setLojaCriada] = useState<LojaResponse | null>(null)

  // Forms
  const formBase = useForm<FormBase>({
    resolver:      zodResolver(schemaBase) as Resolver<FormBase>,
    defaultValues: { tipo: 'COLABORADOR' },
  })
  const tipoSelecionado = formBase.watch('tipo')

  const formNovaLoja = useForm<FormNovaLoja>({
    resolver: zodResolver(schemaNovaLoja) as Resolver<FormNovaLoja>,
  })

  const formVincular = useForm<FormVincular>({
    resolver: zodResolver(schemaVincular) as Resolver<FormVincular>,
  })

  // Lojas para o select
  const { data: lojas = [] } = useQuery({
    queryKey: ['lojas'],
    queryFn:  lojasService.listar,
    enabled:  passo === 2 && subPasso === 'vincular',
  })

  // ── Passo 1 ───────────────────────────────────────────────────────────────
  async function onSubmitBase(data: FormBase) {
    if (data.tipo === 'COLABORADOR') {
      setLoading(true)
      try {
        await authService.registrar({ nome: data.nome, email: data.email, senha: data.senha, perfil: 'COLABORADOR' })
        dispararToast('Conta criada! Faça login para continuar.', 'success')
        navigate('/login')
      } catch (err) {
        dispararToast(extrairErroApi(err), 'error')
      } finally {
        setLoading(false)
      }
      return
    }
    setDadosBase(data)
    setPasso(2)
    setSubPasso('escolha')
  }

  // ── Criar nova loja ───────────────────────────────────────────────────────
  // Fluxo: registra como colaborador → login → cria loja com token → mostra PIN → oferece vincular
  async function onSubmitNovaLoja(data: FormNovaLoja) {
    if (!dadosBase) return
    setLoading(true)
    try {
      // 1. Cria conta como colaborador
      await authService.registrar({
        nome:   dadosBase.nome,
        email:  dadosBase.email,
        senha:  dadosBase.senha,
        perfil: 'COLABORADOR',
      })

      // 2. Faz login para obter token — passa pelo authStore (não localStorage
      // direto) pra manter o estado reativo do app consistente com a sessão.
      const loginResp = await authService.login(dadosBase.email, dadosBase.senha)
      login(loginResp.token, loginResp.perfil)

      // 3. Cria a loja (agora autenticado)
      const loja = await lojasService.criar(data.nome, data.endereco, data.whatsapp)
      setLojaCriada(loja)
      setSubPasso('pin-gerado')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Vincular automaticamente após criar loja ──────────────────────────────
  async function vincularAutomatico() {
    if (!lojaCriada) return
    setLoading(true)
    try {
      await authService.vincularLoja(lojaCriada.id, lojaCriada.pin!)
      // Atualiza o token/perfil com o novo vínculo (re-login) via authStore
      const loginResp = await authService.login(dadosBase!.email, dadosBase!.senha)
      login(loginResp.token, loginResp.perfil)
      dispararToast('Conta de lojista ativada! Bem-vindo.', 'success')
      navigate('/dashboard')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Vincular loja existente ───────────────────────────────────────────────
  async function onSubmitVincular(data: FormVincular) {
    if (!dadosBase) return
    setLoading(true)
    try {
      await authService.registrar({
        nome:    dadosBase.nome,
        email:   dadosBase.email,
        senha:   dadosBase.senha,
        perfil:  'LOJISTA',
        lojaId:  data.lojaId,
        pinLoja: data.pin,
      })
      dispararToast('Conta de lojista criada! Faça login.', 'success')
      navigate('/login')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Títulos dinâmicos ─────────────────────────────────────────────────────
  const titulo = () => {
    if (passo === 1) return 'Criar conta'
    if (subPasso === 'nova-loja') return 'Cadastrar loja'
    if (subPasso === 'pin-gerado') return 'Loja cadastrada!'
    if (subPasso === 'vincular') return 'Vincular à loja'
    return 'Tipo de loja'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream-50">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-terracota-600">
            <ShoppingBag size={28} /> <span className="font-display">Vitrine Popular</span>
          </Link>
          <h1 className="mt-4 font-display text-display-sm font-semibold text-ink-900">{titulo()}</h1>
          {passo === 1 && (
            <p className="text-sm mt-1 text-ink-700">
              Já tem conta?{' '}
              <Link to="/login" className="font-medium text-terracota-600">Entrar</Link>
            </p>
          )}
        </div>

        {tipoSelecionado === 'LOJISTA' && (
          <div className="flex items-center gap-2 mb-6 justify-center">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-[1.5px] transition-colors',
                  passo >= n ? 'bg-terracota-500 border-terracota-500 text-white' : 'bg-sand-100 border-sand-200 text-ink-500'
                )}>{n}</div>
                {n < 2 && <div className={cn('w-8 h-[1.5px]', passo > n ? 'bg-terracota-500' : 'bg-sand-200')} />}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-sand-200 bg-white p-6 md:p-8">

          {/* ══ PASSO 1 ══ */}
          {passo === 1 && (
            <form onSubmit={formBase.handleSubmit(onSubmitBase)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-ink-900">Tipo de conta</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val: 'COLABORADOR', label: 'Colaborador', sub: 'Divulgo ofertas que encontro', Icon: Users },
                    { val: 'LOJISTA',     label: 'Lojista',     sub: 'Tenho um estabelecimento',    Icon: Store },
                  ] as const).map(({ val, label, sub, Icon }) => {
                    const ativo = tipoSelecionado === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => formBase.setValue('tipo', val)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition-colors',
                          ativo ? 'border-2 border-terracota-500 bg-terracota-50' : 'border-[1.5px] border-sand-200'
                        )}
                      >
                        <Icon size={22} className={ativo ? 'text-terracota-600' : 'text-ink-500'} />
                        <span className={cn('text-sm font-semibold', ativo ? 'text-terracota-700' : 'text-ink-900')}>{label}</span>
                        <span className="text-xs leading-tight text-ink-500">{sub}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Input label="Nome completo" placeholder="Seu nome" leftIcon={<User size={16} />}
                error={formBase.formState.errors.nome?.message} {...formBase.register('nome')} />
              <Input label="E-mail" type="email" placeholder="seu@email.com" leftIcon={<Mail size={16} />}
                error={formBase.formState.errors.email?.message} {...formBase.register('email')} />
              <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" leftIcon={<Lock size={16} />}
                error={formBase.formState.errors.senha?.message} {...formBase.register('senha')} />
              <Input label="Confirmar senha" type="password" placeholder="Repita a senha" leftIcon={<Lock size={16} />}
                error={formBase.formState.errors.confirmarSenha?.message} {...formBase.register('confirmarSenha')} />

              {tipoSelecionado === 'LOJISTA' && (
                <div className="rounded-lg p-3 text-xs bg-terracota-50 text-terracota-700">
                  No próximo passo pode cadastrar a sua loja ou vincular-se a uma já existente com o PIN.
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-1">
                {tipoSelecionado === 'LOJISTA'
                  ? <span className="flex items-center justify-center gap-2">Próximo <ChevronRight size={16} /></span>
                  : 'Criar conta'}
              </Button>
            </form>
          )}

          {/* ══ PASSO 2 — ESCOLHA ══ */}
          {passo === 2 && subPasso === 'escolha' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink-700">O que deseja fazer com a sua loja?</p>

              {[
                {
                  sub: 'nova-loja' as SubPasso,
                  Icon: PlusCircle,
                  titulo: 'Cadastrar minha loja agora',
                  desc: 'Minha loja ainda não está no sistema. Vou cadastrá-la e receber o PIN.',
                },
                {
                  sub: 'vincular' as SubPasso,
                  Icon: Search,
                  titulo: 'Já tenho o PIN da minha loja',
                  desc: 'Minha loja já está cadastrada e tenho o PIN em mãos.',
                },
              ].map(({ sub, Icon, titulo, desc }) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubPasso(sub)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-sand-200 text-left transition-colors hover:border-terracota-500 hover:bg-terracota-50"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-terracota-50">
                    <Icon size={20} className="text-terracota-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink-900">{titulo}</p>
                    <p className="text-xs mt-0.5 text-ink-500">{desc}</p>
                  </div>
                </button>
              ))}

              <button type="button" onClick={() => setPasso(1)} className="flex items-center gap-1 text-sm mt-1 text-ink-500">
                <ChevronLeft size={15} /> Voltar
              </button>
            </div>
          )}

          {/* ══ PASSO 2 — NOVA LOJA ══ */}
          {passo === 2 && subPasso === 'nova-loja' && (
            <form onSubmit={formNovaLoja.handleSubmit(onSubmitNovaLoja)} className="flex flex-col gap-4">
              <div className="rounded-lg p-3 text-xs bg-terracota-50 text-terracota-700">
                <strong>Como funciona:</strong> sua conta e loja serão criadas. Você receberá um PIN — guarde-o para vincular funcionários no futuro.
              </div>

              <Input label="Nome da loja" placeholder="Ex: Mercadinho do João" leftIcon={<Store size={16} />}
                error={formNovaLoja.formState.errors.nome?.message} {...formNovaLoja.register('nome')} />
              <Input label="Endereço" placeholder="Ex: Rua das Flores, 123 — Centro"
                error={formNovaLoja.formState.errors.endereco?.message} {...formNovaLoja.register('endereco')} />
              <Input label="WhatsApp (opcional)" placeholder="Ex: 89912345678"
                error={formNovaLoja.formState.errors.whatsapp?.message} {...formNovaLoja.register('whatsapp')} />

              <div className="flex gap-3 mt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSubPasso('escolha')}>
                  <ChevronLeft size={16} /> Voltar
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>Cadastrar loja</Button>
              </div>
            </form>
          )}

          {/* ══ PASSO 2 — PIN GERADO ══ */}
          {passo === 2 && subPasso === 'pin-gerado' && lojaCriada && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl p-5 border-2 border-terracota-500 bg-terracota-50 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-terracota-700">
                  PIN secreto — {lojaCriada.nome}
                </p>
                <p className="text-4xl font-semibold tracking-[0.25em] font-mono text-terracota-700">
                  {lojaCriada.pin}
                </p>
                <p className="text-xs mt-2 text-terracota-700">
                  Anote agora — não será exibido novamente
                </p>
              </div>

              <div className="rounded-lg p-3 text-xs bg-sand-100 text-ink-700">
                Sua conta de colaborador foi criada. Deseja já se vincular a esta loja como <strong>Lojista</strong>?
              </div>

              <Button onClick={vincularAutomatico} loading={loading}>
                Sim, vincular-me como lojista agora
              </Button>

              <button type="button" onClick={() => navigate('/login')} className="text-sm text-center text-ink-500">
                Agora não — entrar como colaborador
              </button>
            </div>
          )}

          {/* ══ PASSO 2 — VINCULAR LOJA EXISTENTE ══ */}
          {passo === 2 && subPasso === 'vincular' && (
            <form onSubmit={formVincular.handleSubmit(onSubmitVincular)} className="flex flex-col gap-4">
              <div className="rounded-lg p-3 text-xs bg-terracota-50 text-terracota-700">
                <strong>PIN secreto:</strong> entregue pela equipa da Vitrine Popular ao dono do estabelecimento.
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-900">Selecione a sua loja</label>
                <div className="relative">
                  <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-500" />
                  <select
                    {...formVincular.register('lojaId')}
                    className={cn(
                      'w-full h-10 pl-10 pr-4 rounded-lg border text-sm outline-none appearance-none bg-white text-ink-900',
                      formVincular.formState.errors.lojaId ? 'border-perigo-600' : 'border-sand-200'
                    )}
                  >
                    <option value={0}>Selecione...</option>
                    {lojas.map(l => (
                      <option key={l.id} value={l.id}>{l.nome}{l.endereco ? ` — ${l.endereco}` : ''}</option>
                    ))}
                  </select>
                </div>
                {formVincular.formState.errors.lojaId && (
                  <p className="text-xs text-perigo-600">{formVincular.formState.errors.lojaId.message}</p>
                )}
              </div>

              <Input label="PIN secreto da loja" placeholder="Ex: A7X9P2" leftIcon={<KeyRound size={16} />}
                error={formVincular.formState.errors.pin?.message}
                {...formVincular.register('pin')} />

              <div className="flex gap-3 mt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSubPasso('escolha')}>
                  <ChevronLeft size={16} /> Voltar
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>Criar conta de lojista</Button>
              </div>
            </form>
          )}

        </div>

        <p className="text-center text-xs mt-6">
          <Link to="/" className="text-ink-700">← Voltar aos achados</Link>
        </p>
      </div>
    </div>
  )
}
