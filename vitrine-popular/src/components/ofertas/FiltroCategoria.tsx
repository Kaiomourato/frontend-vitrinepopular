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
            ? 'text-white border-transparent'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
        )}
        style={
          categoriaSelecionada === null
            ? { background: 'var(--color-primary)', color: '#fff' }
            : { color: 'var(--color-text-secondary)', background: 'transparent' }
        }
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
              ? 'border-transparent'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
          )}
          style={
            categoriaSelecionada === cat.id
              ? { background: 'var(--color-primary)', color: '#fff' }
              : { color: 'var(--color-text-secondary)', background: 'transparent' }
          }
        >
          {cat.nome}
        </button>
      ))}
    </div>
  )
}