import { Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Placeholder em favo de mel — usado onde uma oferta não tem foto ou a URL
 * falha ao carregar. Puramente decorativo (SVG inline, sem asset externo).
 */
export function PlaceholderFavo({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      <svg className="absolute inset-0 w-full h-full text-mel-300" aria-hidden="true">
        <defs>
          <pattern id="favo-oferta" width="24.25" height="21" patternUnits="userSpaceOnUse">
            <polygon
              points="12.12,0 24.25,7 24.25,21 12.12,28 0,21 0,7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#favo-oferta)" />
      </svg>
      <Hexagon size={30} strokeWidth={1.3} className="relative text-mel-500" aria-hidden="true" />
    </div>
  )
}
