import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react'
import { ofertasService } from '@/services/ofertas'
import { categoriasService, lojasService } from '@/services/lojas'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { dispararToast } from '@/components/ui'
import { cn, extrairErroApi, formatarPreco } from '@/lib/utils'
import { useState, useRef } from 'react'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  produtoNome: z.string().min(2, 'Nome obrigatório').max(100),
  descricao:   z.string().max(500).optional(),
  preco:       z.coerce.number().positive('Preço deve ser maior que zero'),
  categoriaId: z.coerce.number().min(1, 'Selecione uma categoria'),
  lojaId:      z.coerce.number().optional(), // só usado pelo fluxo do COLABORADOR
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
  const [erroLoja, setErroLoja] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // LOJISTA publica direto na própria loja (fluxo inalterado); qualquer outro
  // perfil está "sugerindo" uma oferta para uma loja já existente — entra em
  // moderação (PENDENTE) até o lojista dono ou um admin aprovar.
  const ehLojista = usuario?.perfil === 'LOJISTA'
  const ehSugestao = !ehLojista

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  const { data: lojas = [] } = useQuery({
    queryKey: ['lojas'],
    queryFn: lojasService.listar,
    staleTime: Infinity,
    enabled: ehSugestao,
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema) as Resolver<Form>,
    defaultValues: { categoriaId: 0, lojaId: 0 },
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

    setErroLoja('')
    let lojaId: number | undefined

    if (ehLojista) {
      if (!usuario?.loja?.id) { dispararToast('Nenhuma loja vinculada à sua conta.', 'error'); return }
      lojaId = usuario.loja.id
    } else {
      if (!data.lojaId) { setErroLoja('Selecione a loja onde esse achado está'); return }
      lojaId = data.lojaId
    }

    setLoading(true)
    try {
      const dados = JSON.stringify({
        produtoNome: data.produtoNome,
        descricao:   data.descricao,
        preco:       data.preco,
        lojaId,
        categoriaId: data.categoriaId,
      })
      await ofertasService.criar(dados, imagem)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      dispararToast(
        ehSugestao
          ? 'Sugestão enviada! Ela entra no ar assim que for aprovada pela loja ou por um admin.'
          : 'Oferta publicada com sucesso!',
        'success'
      )
      navigate(ehSugestao ? '/perfil' : '/dashboard')
    } catch (err) {
      dispararToast(extrairErroApi(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 text-ink-700">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className={cn('font-display text-display-md font-semibold text-ink-900', ehSugestao ? 'mb-2' : 'mb-6')}>
        {ehSugestao ? 'Sugerir achado' : 'Nova oferta'}
      </h1>
      {ehSugestao && (
        <p className="text-sm mb-6 text-ink-700">
          Sua sugestão entra em análise: só aparece para todo mundo depois que a loja ou um admin aprovar.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-900">Foto do produto</span>
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-terracota-500 flex flex-col items-center justify-center gap-2 overflow-hidden',
              erroImagem ? 'border-perigo-600' : 'border-sand-200',
              preview ? 'bg-transparent' : 'bg-cream-50'
            )}
            style={{ minHeight: 200 }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-terracota-50">
                  <ImageIcon size={24} className="text-terracota-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-ink-900">Clique para selecionar a foto</p>
                  <p className="text-xs mt-0.5 text-ink-500">JPG, PNG ou WEBP · Máximo 5MB</p>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-terracota-500 text-white">
                  <Upload size={14} /> Selecionar foto
                </div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImagem} />
          </div>
          {preview && (
            <button type="button" onClick={() => { setPreview(null); setImagem(null) }}
              className="text-xs self-start text-perigo-600">
              Remover imagem
            </button>
          )}
          {erroImagem && <p className="text-xs text-perigo-600">{erroImagem}</p>}
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
              <p className="text-xs font-medium text-terracota-700">
                {formatarPreco(precoValor)}
              </p>
            )}
          </div>
          <Select label="Categoria" error={errors.categoriaId?.message} {...register('categoriaId')}>
            <option value={0} disabled>Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </div>

        {ehLojista ? (
          usuario?.loja && (
            <div className="rounded-lg p-3 text-sm border border-sand-200 bg-cream-50">
              <span className="text-ink-700">Publicando em: </span>
              <span className="font-medium text-ink-900">{usuario.loja.nome}</span>
            </div>
          )
        ) : (
          <Select label="Loja onde encontrou esse achado" error={erroLoja} {...register('lojaId')}>
            <option value={0} disabled>Selecione...</option>
            {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </Select>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="flex-1" loading={loading}>
            {ehSugestao ? 'Enviar sugestão' : 'Publicar oferta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
