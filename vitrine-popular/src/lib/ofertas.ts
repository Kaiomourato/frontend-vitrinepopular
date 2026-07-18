import type { OfertaResponse } from '@/types'

/** Nº mínimo de confirmações da comunidade ("ainda tem") pra virar Achado de Ouro. */
export const LIMIAR_OURO = 3

/**
 * "Achado de Ouro" — heurística no cliente, sem campo dedicado no backend:
 * uma oferta ativa confirmada por gente suficiente da comunidade vira
 * destaque visual. Puramente apresentacional, recalculada a cada fetch.
 */
export function ehAchadoDeOuro(oferta: OfertaResponse): boolean {
  return oferta.status === 'ATIVA' && oferta.votosAindaTem >= LIMIAR_OURO
}
