import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { categoriasService } from '@/services/lojas'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { extrairErroApi, formatarPreco } from '@/lib/utils'
import { useState, useRef } from 'react'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  produtoNome: z.string().min(2, 'Nome obrigatório').max(100),
  descricao:   z.string().max(500).optional(),
  preco:       z.coerce.number().positive('Preço deve ser maior que zero'),
  categoriaId: z.coerce.number().min(1, 'Selecione uma categoria'),
})
type Form = z.infer<typeof schema>

export function NovaOferta() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [erroImagem, setErroImagem] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema) as Resolver<Form>,
    defaultValues: { categoriaId: 0 },
  })

  const precoValor = watch('preco')

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErroImagem('Imagem deve ter no máximo 5MB'); return }
    setErroImagem('')
    setImagem(file)
    setPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: Form) {
    if (!imagem) { setErroImagem('Selecione uma imagem para a oferta'); return }
    if (!usuario?.loja?.id) { dispararToast('Nenhuma loja vinculada à sua conta.', 'error'); return }
    setLoading(true)
    try {
      const dados = JSON.stringify({
        produtoNome: data.produtoNome,
        descricao:   data.descricao,
        preco:       data.preco,
        lojaId:      usuario.loja.id,
        categoriaId: data.categoriaId,
      })
      await ofertasService.criar(dados, imagem)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast('Oferta publicada com sucesso!', 'success')
      navigate('/dashboard')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Nova oferta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Foto do produto</span>
          <div
            onClick={() => inputRef.current?.click()}
            className="relative border-2 border-dashed rounded-[14px] cursor-pointer transition-all hover:border-[var(--color-primary)] flex flex-col items-center justify-center gap-2 overflow-hidden"
            style={{
              borderColor: erroImagem ? 'var(--color-danger)' : 'var(--color-border)',
              minHeight: 200,
              background: preview ? 'transparent' : 'var(--color-bg)',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                  <ImageIcon size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Clique para selecionar a foto</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>JPG, PNG ou WEBP · Máximo 5MB</p>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                  <Upload size={14} /> Selecionar foto
                </div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImagem} />
          </div>
          {preview && (
            <button type="button" onClick={() => { setPreview(null); setImagem(null) }}
              className="text-xs self-start" style={{ color: 'var(--color-danger)' }}>
              Remover imagem
            </button>
          )}
          {erroImagem && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{erroImagem}</p>}
        </div>

        <Input label="Nome do produto" placeholder="Ex: Camiseta estampada azul" error={errors.produtoNome?.message} {...register('produtoNome')} />
        <Textarea label="Descrição (opcional)" placeholder="Detalhes, condições, validade da oferta..." rows={3} error={errors.descricao?.message} {...register('descricao')} />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              error={errors.preco?.message}
              {...register('preco')}
            />
            {precoValor > 0 && (
              <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                {formatarPreco(precoValor)}
              </p>
            )}
          </div>
          <Select label="Categoria" error={errors.categoriaId?.message} {...register('categoriaId')}>
            <option value={0} disabled>Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </div>

        {usuario?.loja && (
          <div className="rounded-[10px] p-3 text-sm" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Publicando em: </span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{usuario.loja.nome}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="flex-1" loading={loading}>Publicar oferta</Button>
        </div>
      </form>
    </div>
  )
}