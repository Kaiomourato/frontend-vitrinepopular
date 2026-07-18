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

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-all',
          categoriaSelecionada === null
            ? 'text-white border-transparent bg-terracota-500'
            : 'text-ink-700 bg-transparent border-sand-200 hover:border-terracota-500'
        )}
      >
        Todas
      </button>
      {categorias.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-all',
            categoriaSelecionada === cat.id
              ? 'text-white border-transparent bg-terracota-500'
              : 'text-ink-700 bg-transparent border-sand-200 hover:border-terracota-500'
          )}
        >
          {cat.nome}
        </button>
      ))}
    </div>
  )
}