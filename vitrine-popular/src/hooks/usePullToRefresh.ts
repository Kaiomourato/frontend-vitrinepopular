import { useEffect, useRef, useState } from 'react'

const LIMIAR = 64
const PUXAO_MAX = 96

/**
 * Puxar-para-atualizar nativo (gesto touch), sem dependência externa.
 * Só ativa quando o topo da página já está visível (scrollY <= 0), para
 * não competir com o scroll normal do feed.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown> | void) {
  const [puxao, setPuxao] = useState(0)
  const [atualizando, setAtualizando] = useState(false)
  const inicioYRef = useRef<number | null>(null)
  const atualizandoRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY <= 0 && !atualizandoRef.current) {
        inicioYRef.current = e.touches[0].clientY
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (inicioYRef.current === null) return
      const delta = e.touches[0].clientY - inicioYRef.current
      if (delta > 0 && window.scrollY <= 0) {
        setPuxao(Math.min(delta * 0.5, PUXAO_MAX))
      } else {
        inicioYRef.current = null
        setPuxao(0)
      }
    }

    function onTouchEnd() {
      if (inicioYRef.current === null) return
      inicioYRef.current = null
      setPuxao(atual => {
        if (atual > LIMIAR && !atualizandoRef.current) {
          atualizandoRef.current = true
          setAtualizando(true)
          Promise.resolve(onRefreshRef.current()).finally(() => {
            atualizandoRef.current = false
            setAtualizando(false)
          })
        }
        return 0
      })
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return { puxao, atualizando, limiar: LIMIAR }
}
