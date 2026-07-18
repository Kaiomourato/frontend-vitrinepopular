import type { Medalha } from '@/types'

/** 1º/2º/3º lugar viram medalha; do 4º em diante não há medalha (ranking numérico simples). */
export function posicaoParaMedalha(posicao: number): Medalha | null {
  if (posicao === 0) return 'OURO'
  if (posicao === 1) return 'PRATA'
  if (posicao === 2) return 'BRONZE'
  return null
}
