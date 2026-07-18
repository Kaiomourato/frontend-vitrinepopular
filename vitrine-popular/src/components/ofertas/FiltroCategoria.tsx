import { useQuery } from '@tanstack/react-query'
import { categoriasService } from '@/services/lojas'
import { cn } from '@/lib/utils'

interface FiltroCategoriaProps {
  categoriaSelecionada: number | null
  onChange: (id: number | null) => void
}

export function FiltroCategoria({ categoriaSelecionada, onChange }: FiltroCategoriaProps) {
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  function classeChip(ativo: boolean) {
    return cn(
      'shrink-0 h-[34px] inline-flex items-center font-rounded font-semibold text-[13px] px-3.5 rounded-full border-[1.5px] transition-all active:scale-95',
      ativo
        ? 'text-white border-terracota-500 bg-terracota-500 shadow-brand'
        : 'text-ink-700 bg-white border-sand-300 hover:border-sand-400 hover:bg-sand-100'
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
      <button onClick={() => onChange(null)} className={classeChip(categoriaSelecionada === null)}>
        Todas
      </button>
      {categorias.map(cat => (
        <button key={cat.id} onClick={() => onChange(cat.id)} className={classeChip(categoriaSelecionada === cat.id)}>
          {cat.nome}
        </button>
      ))}
    </div>
  )
}