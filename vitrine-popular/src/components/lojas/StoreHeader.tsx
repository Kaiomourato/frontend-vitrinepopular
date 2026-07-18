import { MapPin, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import { formatarWhatsApp } from '@/lib/utils'
import type { LojaResponse } from '@/types'

interface StoreHeaderProps {
  loja: LojaResponse
  className?: string
}

/** Cabeçalho de loja — avatar hexagonal (linguagem de favo da marca) + dados + CTA de WhatsApp. */
export function StoreHeader({ loja, className }: StoreHeaderProps) {
  const whatsappUrl = formatarWhatsApp(loja.whatsapp)

  return (
    <div className={`rounded-xl border border-sand-200 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 ${className ?? ''}`}>
      <div
        className="w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-terracota-400 to-terracota-600 text-white"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        aria-hidden="true"
      >
        {loja.nome[0].toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-display-sm font-semibold text-ink-900">{loja.nome}</h1>
          {loja.isParceira && <Badge variant="primary">Parceira</Badge>}
        </div>
        {loja.endereco && (
          <p className="flex items-center gap-1.5 text-sm mt-1 text-ink-700">
            <MapPin size={14} /> {loja.endereco}
          </p>
        )}
      </div>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shrink-0 text-white bg-whatsapp transition-opacity hover:opacity-90"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
      )}
    </div>
  )
}
