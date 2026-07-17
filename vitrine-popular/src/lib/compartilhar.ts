import { dispararToast } from '@/components/ui'
import type { OfertaResponse } from '@/types'

/**
 * Compartilha uma oferta via Web Share API (client-side, sem contagem —
 * não há endpoint de compartilhamento no back-end e não fabricamos um).
 * Cai para copiar o link quando a API não está disponível (ex.: desktop).
 */
export function compartilharOferta(oferta: OfertaResponse) {
  const url = `${window.location.origin}/oferta/${oferta.id}`

  if (navigator.share) {
    navigator.share({ title: oferta.produtoNome, url }).catch(() => {})
    return
  }

  navigator.clipboard
    .writeText(url)
    .then(() => dispararToast('Link copiado!', 'success'))
}
