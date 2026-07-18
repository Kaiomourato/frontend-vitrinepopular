import { useEffect, useState } from 'react'

// Mesmo ponto de corte do breakpoint `md` do Tailwind (768px) — usado em
// todo o app pra decidir bottom nav vs. navbar de topo, então a Home segue
// a mesma fronteira pra alternar entre feed vertical e grade.
const MOBILE_QUERY = '(max-width: 767px)'

export function useEhMobile(): boolean {
  const [ehMobile, setEhMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    function handler(e: MediaQueryListEvent) {
      setEhMobile(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return ehMobile
}
