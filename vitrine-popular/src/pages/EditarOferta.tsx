import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { categoriasService } from '@/services/lojas'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { PlaceholderFavo } from '@/components/ui/PlaceholderFavo'
import { extrairErroApi, formatarPreco } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  produtoNome: z.string().min(2, 'Nome obrigatório').max(100),
  descricao:   z.string().max(500).optional(),
  preco:       z.coerce.number().positive('Preço deve ser maior que zero'),
  categoriaId: z.coerce.number().min(1, 'Selecione uma categoria'),
})
type Form = z.infer<typeof schema>

export function EditarOferta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [novaImagem, setNovaImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imgErro, setImgErro] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: oferta, isLoading } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.buscarPorId(Number(id)),
    enabled: !!id,
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema) as Resolver<Form>,
  })

  useEffect(() => {
    if (oferta) {
      reset({
        produtoNome: oferta.produtoNome,
        descricao:   oferta.descricao ?? '',
        preco:       oferta.preco,
        categoriaId: oferta.categoria.id,
      })
    }
  }, [oferta, reset])

  const precoValor = watch('preco')

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNovaImagem(file)
    setPreview(URL.createObjectURL(file))
    setImgErro(false)
  }

  async function onSubmit(data: Form) {
    if (!id) return
    setLoading(true)
    try {
      const dados = JSON.stringify({
        produtoNome: data.produtoNome,
        descricao:   data.descricao,
        preco:       data.preco,
        lojaId:      oferta?.loja.id,
        categoriaId: data.categoriaId,
      })
      await ofertasService.editar(Number(id), dados, novaImagem ?? undefined)
      queryClient.invalidateQueries({ queryKey: ['oferta', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast('Oferta atualizada!', 'success')
      navigate('/dashboard')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <EditarOfertaSkeleton />
  if (!oferta) return (
    <div className="container-app py-20 text-center">
      <p className="text-ink-700">Oferta não encontrada.</p>
    </div>
  )

  return (
    <div className="container-app py-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 text-ink-700">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="font-display text-display-md font-semibold mb-6 text-ink-900">Editar oferta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-900">Foto do produto</span>
          <div className="relative rounded-xl overflow-hidden border border-sand-200 bg-mel-50 h-56">
            {(preview ?? oferta.imagemUrl) && !imgErro ? (
              <img
                src={preview ?? oferta.imagemUrl}
                alt={oferta.produtoNome}
                className="w-full h-56 object-cover"
                onError={() => setImgErro(true)}
              />
            ) : (
              <PlaceholderFavo />
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium text-white bg-ink-900/60"
            >
              <Upload size={13} /> Trocar foto
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImagem} />
          </div>
        </div>

        <Input label="Nome do produto" placeholder="Nome do produto" error={errors.produtoNome?.message} {...register('produtoNome')} />
        <Textarea label="Descrição (opcional)" placeholder="Detalhes da oferta..." rows={3} error={errors.descricao?.message} {...register('descricao')} />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Input label="Preço (R$)" type="number" step="0.01" min="0" error={errors.preco?.message} {...register('preco')} />
            {precoValor > 0 && (
              <p className="text-xs font-medium text-terracota-700">{formatarPreco(precoValor)}</p>
            )}
          </div>
          <Select label="Categoria" error={errors.categoriaId?.message} {...register('categoriaId')}>
            <option value={0} disabled>Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="flex-1" loading={loading}>Salvar alterações</Button>
        </div>
      </form>
    </div>
  )
}

function EditarOfertaSkeleton() {
  return (
    <div className="container-app py-6 max-w-2xl animate-pulse">
      <div className="h-4 w-16 rounded mb-6 bg-sand-100" />
      <div className="h-8 w-48 rounded mb-6 bg-sand-100" />
      <div className="flex flex-col gap-5">
        <div className="h-56 rounded-xl bg-sand-100" />
        <div className="h-10 rounded-lg bg-sand-100" />
        <div className="h-20 rounded-lg bg-sand-100" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded-lg bg-sand-100" />
          <div className="h-10 rounded-lg bg-sand-100" />
        </div>
      </div>
    </div>
  )
}
