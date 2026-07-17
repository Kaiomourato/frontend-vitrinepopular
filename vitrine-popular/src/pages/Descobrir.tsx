import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Utensils, Shirt, Wrench, Sparkles, Package, Home as HomeIcon,
  Coffee, Palette, Gift, Smartphone, Car, PawPrint, type LucideIcon,
} from 'lucide-react'
import { categoriasService } from '@/services/lojas'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

const ICONES: LucideIcon[] = [
  Utensils, Shirt, Wrench, Sparkles, Package, HomeIcon,
  Coffee, Palette, Gift, Smartphone, Car, PawPrint,
]

const PALETAS = [
  { bg: 'bg-terracota-50', text: 'text-terracota-700' },
  { bg: 'bg-queimado-50', text: 'text-queimado-700' },
  { bg: 'bg-mel-50', text: 'text-mel-800' },
  { bg: 'bg-mandacaru-50', text: 'text-mandacaru-700' },
]

const ROW_UNIT = 92 // px — usado no gridAutoRows para o efeito "Pinterest"

export function Descobrir() {
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listar,
    staleTime: Infinity,
  })

  return (
    <div className="container-app py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-lg font-semibold text-ink-900">Descobrir</h1>
        <p className="text-sm md:text-base mt-1 text-ink-700">
          Explore por categoria o que o comércio de Picos-PI tem pra oferecer.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: ROW_UNIT }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse bg-sand-100" style={{ gridRow: i % 5 === 2 ? 'span 2' : 'span 1' }} />
          ))}
        </div>
      ) : !categorias.length ? (
        <EmptyState
          icon={<Package size={28} />}
          titulo="Nenhuma categoria por aqui ainda"
          descricao="Volte mais tarde para explorar o comércio local."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: ROW_UNIT }}>
          {categorias.map((categoria, i) => {
            const Icone = ICONES[categoria.id % ICONES.length]
            const paleta = PALETAS[categoria.id % PALETAS.length]
            const alta = i % 5 === 2 || i % 5 === 4
            return (
              <Link
                key={categoria.id}
                to={`/?categoria=${categoria.id}`}
                style={{ gridRow: alta ? 'span 2' : 'span 1' }}
                className={cn(
                  'relative rounded-xl overflow-hidden flex flex-col justify-end gap-2 p-4 transition-transform duration-200 hover:-translate-y-0.5',
                  paleta.bg
                )}
              >
                <Icone size={24} className={paleta.text} strokeWidth={1.6} />
                <span className={cn('font-display font-semibold leading-tight', paleta.text)}>
                  {categoria.nome}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
