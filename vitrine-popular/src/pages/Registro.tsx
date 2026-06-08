import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Mail, Lock } from 'lucide-react'
import { authService } from '@/services/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { extrairErroApi } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
  nome:  z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine(d => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})
type Form = z.infer<typeof schema>

export function Registro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Form) {
    setLoading(true)
    try {
      await authService.registrar(data.nome, data.email, data.senha)
      dispararToast('Conta criada! Faça login para continuar.', 'success')
      navigate('/login')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
            <ShoppingBag size={28} /> Vitrine Popular
          </Link>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Criar conta de colaborador</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Entrar</Link>
          </p>
        </div>

        <div className="rounded-[20px] border p-6 md:p-8 flex flex-col gap-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

          <div className="rounded-[10px] p-3 text-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <strong>É lojista?</strong> Primeiro cadastre sua conta aqui. Depois, acesse com o PIN da loja para vincular seu perfil ao estabelecimento.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Nome completo" placeholder="Seu nome" leftIcon={<User size={16} />} error={errors.nome?.message} {...register('nome')} />
            <Input label="E-mail" type="email" placeholder="seu@email.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" leftIcon={<Lock size={16} />} error={errors.senha?.message} {...register('senha')} />
            <Input label="Confirmar senha" type="password" placeholder="Repita a senha" leftIcon={<Lock size={16} />} error={errors.confirmarSenha?.message} {...register('confirmarSenha')} />
            <Button type="submit" size="lg" loading={loading} className="mt-2">Criar conta</Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6">
          <Link to="/" style={{ color: 'var(--color-text-secondary)' }}>← Voltar ao feed</Link>
        </p>
      </div>
    </div>
  )
}