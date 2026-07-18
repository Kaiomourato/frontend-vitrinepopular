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

// Blocos de cor cheios (não tons pastéis) — mel fica com texto escuro por
// contraste (regra do design system), os demais levam texto branco.
const PALETAS = [
  { bg: 'bg-gradient-to-br from-terracota-500 to-terracota-700', text: 'text-white', iconBg: 'bg-white/20' },
  { bg: 'bg-gradient-to-br from-queimado-400 to-queimado-600', text: 'text-white', iconBg: 'bg-white/20' },
  { bg: 'bg-gradient-to-br from-mel-300 to-mel-500', text: 'text-mel-900', iconBg: 'bg-white/50' },
  { bg: 'bg-gradient-to-br from-mandacaru-500 to-mandacaru-700', text: 'text-white', iconBg: 'bg-white/20' },
  { bg: 'bg-gradient-to-br from-perigo-500 to-perigo-700', text: 'text-white', iconBg: 'bg-white/20' },
]

const ROW_UNIT = 104 // px — usado no gridAutoRows para o efeito "Pinterest"

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
                to={`/busca?categoria=${categoria.id}`}
                style={{ gridRow: alta ? 'span 2' : 'span 1' }}
                className={cn(
                  'relative rounded-xl overflow-hidden flex flex-col justify-end gap-2 p-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                  paleta.bg
                )}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', paleta.iconBg, paleta.text)}>
                  <Icone size={19} strokeWidth={1.8} />
                </div>
                <span className={cn('font-display text-lg font-bold leading-tight', paleta.text)}>
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
