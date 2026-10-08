import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

// Adapted from React Bits <DotField />: a grid of dots that bulges away from the pointer
// while it moves, with a soft accent glow under the cursor. Device-pixel aware, pauses
// offscreen and renders a single still frame for reduced motion.

type DotFieldProps = {
  className?: string
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  bulgeStrength?: number
  glowRadius?: number
  gradientFrom?: string
  gradientTo?: string
  glowRgb?: [number, number, number]
}

type Dot = { ax: number; ay: number; sx: number; sy: number }

const MAROON_RGB: [number, number, number] = [122, 15, 31]

export function DotField({
  className,
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  bulgeStrength = 67,
  glowRadius = 160,
  gradientFrom = '#7A0F1F',
  gradientTo = 'rgba(242, 237, 232, 0.2)',
  glowRgb = MAROON_RGB,
}: DotFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0 }
    let dots: Dot[] = []
    let w = 0
    let h = 0
    let engagement = 0
    let glow = 0
    let raf = 0
    let visible = true

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const step = dotRadius + dotSpacing
      const cols = Math.floor(w / step)
      const rows = Math.floor(h / step)
      const padX = (w % step) / 2
      const padY = (h % step) / 2
      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ax = padX + c * step + step / 2
          const ay = padY + r * step + step / 2
          dots.push({ ax, ay, sx: ax, sy: ay })
        }
      }
    }

    // Returns true while something is still moving, so the loop can stop when the field is at rest.
    const draw = () => {
      const target = reduce ? 0 : Math.min(mouse.speed / 5, 1)
      engagement += (target - engagement) * 0.06
      if (engagement < 0.001) engagement = 0
      glow += (engagement - glow) * 0.08
      ctx.clearRect(0, 0, w, h)
      if (glow > 0.01) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius)
        g.addColorStop(0, `rgba(${glowRgb.join(',')},${(0.35 * glow).toFixed(3)})`)
        g.addColorStop(1, `rgba(${glowRgb.join(',')},0)`)
        ctx.fillStyle = g
        ctx.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2)
      }
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, gradientFrom)
      grad.addColorStop(1, gradientTo)
      ctx.fillStyle = grad
      const r = dotRadius / 2
      const crSq = cursorRadius * cursorRadius
      let moving = 0
      ctx.beginPath()
      for (const d of dots) {
        const dx = mouse.x - d.ax
        const dy = mouse.y - d.ay
        const distSq = dx * dx + dy * dy
        if (distSq < crSq && engagement > 0.01) {
          const k = 1 - Math.sqrt(distSq) / cursorRadius
          const push = k * k * bulgeStrength * engagement
          const a = Math.atan2(dy, dx)
          d.sx += (d.ax - Math.cos(a) * push - d.sx) * 0.15
          d.sy += (d.ay - Math.sin(a) * push - d.sy) * 0.15
        } else {
          d.sx += (d.ax - d.sx) * 0.1
          d.sy += (d.ay - d.sy) * 0.1
        }
        moving = Math.max(moving, Math.abs(d.sx - d.ax) + Math.abs(d.sy - d.ay))
        ctx.moveTo(d.sx + r, d.sy)
        ctx.arc(d.sx, d.sy, r, 0, Math.PI * 2)
      }
      ctx.fill()
      return engagement > 0.001 || glow > 0.01 || moving > 0.05 || mouse.speed > 0
    }

    let running = false
    const tick = () => {
      if (visible && draw()) raf = requestAnimationFrame(tick)
      else running = false
    }
    const wake = () => {
      if (running || reduce) return
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      wake()
    }
    const speedTimer = window.setInterval(() => {
      const d = Math.hypot(mouse.px - mouse.x, mouse.py - mouse.y)
      mouse.speed += (d - mouse.speed) * 0.5
      if (mouse.speed < 0.001) mouse.speed = 0
      mouse.px = mouse.x
      mouse.py = mouse.y
    }, 20)
    let resizeTimer = 0
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        draw()
      }, 100)
    }
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))

    build()
    draw()
    io.observe(canvas)
    window.addEventListener('resize', onResize)
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(speedTimer)
      clearTimeout(resizeTimer)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, glowRadius, gradientFrom, gradientTo, glowRgb, reduce])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
