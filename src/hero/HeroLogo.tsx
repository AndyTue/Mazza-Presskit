import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'

const HeroLogo3D = lazy(() => import('./HeroLogo3D'))

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

// WebGL available and the device is not obviously low-end or in data-saver mode.
function canRender3D() {
  const nav = navigator as NavigatorHints
  if (nav.connection?.saveData) return false
  if ((nav.hardwareConcurrency ?? 4) <= 2 || (nav.deviceMemory ?? 4) <= 2) return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// The 3D bundle (Three.js) is heavy, so it loads on the first interaction (or after a 10 s
// fallback) and never competes with the first paint. The flat monogram shows until it is ready.
const FALLBACK_MS = 10000

function useDeferred3D() {
  const [load, setLoad] = useState(false)
  useEffect(() => {
    if (!canRender3D()) return
    let done = false
    let idle = 0
    const events = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel', 'scroll'] as const
    const begin = () => setLoad(true)
    const start = () => {
      if (done) return
      done = true
      events.forEach((ev) => window.removeEventListener(ev, start))
      clearTimeout(timer)
      // Let the interaction that triggered this finish before parsing Three.js.
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(begin, { timeout: 800 })
      else window.setTimeout(begin, 120)
    }
    events.forEach((ev) => window.addEventListener(ev, start, { passive: true }))
    const timer = window.setTimeout(start, FALLBACK_MS)
    return () => {
      done = true
      events.forEach((ev) => window.removeEventListener(ev, start))
      clearTimeout(timer)
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [])
  return load
}

export function Logo2D({ hidden = false }: { hidden?: boolean }) {
  return <span className={`logo2d${hidden ? ' out' : ''}`} aria-hidden="true" />
}

export function HeroLogo() {
  const load = useDeferred3D()
  const [ready, setReady] = useState(false)

  return (
    <div className="stage" role="img" aria-label="Logotipo de Mazza">
      <Logo2D hidden={ready} />
      {load && (
        <WebGLBoundary fallback={null}>
          <Suspense fallback={null}>
            <HeroLogo3D onReady={() => setReady(true)} />
          </Suspense>
        </WebGLBoundary>
      )}
    </div>
  )
}
