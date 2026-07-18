import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import { formatarWhatsApp } from '@/lib/utils'
import type { LojaResponse } from '@/types'

interface StoreHeaderProps {
  loja: LojaResponse
  onVoltar?: () => void
  className?: string
}

/**
 * Cabeçalho de loja — cover em degradê laranja→mel com o logo hexagonal
 * (linguagem de favo da marca) sobreposto à costura entre a capa e o corpo,
 * igual à StoreScreen do design system.
 */
export function StoreHeader({ loja, onVoltar, className }: StoreHeaderProps) {
  const whatsappUrl = formatarWhatsApp(loja.whatsapp)

  return (
    <div className={className}>
      <div className="relative h-28 md:h-36 rounded-t-2xl overflow-hidden bg-gradient-to-br from-terracota-500 to-mel-400">
        {onVoltar && (
          <button
            onClick={onVoltar}
            aria-label="Voltar"
            className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center bg-white/92 backdrop-blur-sm shadow-sm text-ink-900 transition-transform active:scale-90"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      <div className="rounded-b-2xl border border-t-0 border-sand-200 bg-white shadow-sm px-6 pb-6 md:px-8 md:pb-8">
        <div className="flex items-end gap-4 -mt-8 md:-mt-10">
          <div
            className="w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center text-2xl md:text-3xl font-display font-black bg-gradient-to-br from-terracota-400 to-mel-400 text-white shadow-md"
            style={{ clipPath: 'var(--hex-clip)' }}
            aria-hidden="true"
          >
            {loja.nome[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-display-sm font-extrabold text-ink-900 truncate">{loja.nome}</h1>
              {loja.isParceira && <Badge variant="primary">Parceira</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          {loja.endereco && (
            <p className="flex items-center gap-1.5 text-sm text-ink-700">
              <MapPin size={14} /> {loja.endereco}
            </p>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white bg-whatsapp shadow-md transition-opacity hover:opacity-90"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
