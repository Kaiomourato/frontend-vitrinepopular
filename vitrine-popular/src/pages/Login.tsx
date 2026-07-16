import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Mail, Lock } from 'lucide-react'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { extrairErroApi } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})
type Form = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Form) {
    setLoading(true)
    try {
      const resp = await authService.login(data.email, data.senha)
      // O backend retorna { perfil: UsuarioResponse, token: string }
      login(resp.token, resp.perfil)
      dispararToast(`Bem-vindo, ${resp.perfil.nome}!`, 'success')
      const destino = resp.perfil.perfil === 'ADMIN' ? '/admin'
        : resp.perfil.perfil === 'LOJISTA' ? '/dashboard'
        : '/'
      navigate(destino)
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
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Entrar na sua conta</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Não tem conta?{' '}
            <Link to="/registro" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Cadastre-se grátis</Link>
          </p>
        </div>

        <div className="rounded-[20px] border p-6 md:p-8 flex flex-col gap-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.senha?.message}
              {...register('senha')}
            />
            <Button type="submit" size="lg" loading={loading} className="mt-2">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)' }}>← Voltar ao feed</Link>
        </p>
      </div>
    </div>
  )
}