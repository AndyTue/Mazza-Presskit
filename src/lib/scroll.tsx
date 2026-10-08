import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

type ScrollApi = {
  scrollTo: (id: string) => void
  lock: () => void
  unlock: () => void
}

const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {}, lock: () => {}, unlock: () => {} })

// Lenis smooth scrolling (skipped when the visitor prefers reduced motion) plus
// helpers to jump to a section anchor and to freeze scrolling under overlays.
export function ScrollProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduce) return
    const instance = new Lenis({ lerp: 0.1 })
    lenis.current = instance
    let frame = requestAnimationFrame(function loop(time) {
      instance.raf(time)
      frame = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      lenis.current = null
    }
  }, [reduce])

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      const top = id === 'top' || !el ? 0 : el.getBoundingClientRect().top + window.scrollY
      if (lenis.current) lenis.current.scrollTo(top, { duration: 1.2 })
      else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
      history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
    },
    [reduce],
  )

  const lock = useCallback(() => {
    lenis.current?.stop()
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const unlock = useCallback(() => {
    lenis.current?.start()
    document.documentElement.style.overflow = ''
  }, [])

  useEffect(() => {
    const id = location.hash.slice(1)
    if (id) requestAnimationFrame(() => scrollTo(id))
  }, [scrollTo])

  const value = useMemo(() => ({ scrollTo, lock, unlock }), [scrollTo, lock, unlock])
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}

export const useSmoothScroll = () => useContext(ScrollContext)
