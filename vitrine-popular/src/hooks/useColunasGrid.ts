import { useEffect, useState } from 'react'

/**
 * Número de colunas do grid de ofertas por breakpoint — replica os mesmos
 * pontos de corte do Tailwind (sm/lg/xl) usados antes via classes
 * responsivas. Precisa existir em JS porque a virtualização do feed monta
 * as linhas manualmente (não dá pra deixar o CSS decidir quantos cards
 * cabem por linha quando o próprio JS precisa saber isso de antemão).
 */
const PONTOS_DE_CORTE: [number, number][] = [
  [1280, 5], // xl
  [1024, 4], // lg
  [640, 3],  // sm
  [0, 2],    // base
]

function calcularColunas(): number {
  if (typeof window === 'undefined') return 2
  const largura = window.innerWidth
  for (const [min, colunas] of PONTOS_DE_CORTE) {
    if (largura >= min) return colunas
  }
  return 2
}

export function useColunasGrid(): number {
  const [colunas, setColunas] = useState(calcularColunas)

  useEffect(() => {
    function onResize() {
      setColunas(atual => {
        const proximo = calcularColunas()
        return proximo === atual ? atual : proximo
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return colunas
}
