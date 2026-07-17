import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Aviso persistente (não um toast, que some sozinho) enquanto o app está
 * offline. O service worker/PWA continuam servindo o que já foi
 * cacheado — isso só avisa com um tom mais gentil que "erro".
 */
export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-mel-800 bg-mel-50 border-b border-mel-200">
      <WifiOff size={14} />
      Sem internet no momento — você ainda pode ver o que já carregou.
    </div>
  )
}
