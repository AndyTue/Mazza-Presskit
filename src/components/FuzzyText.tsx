import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

// Adapted from React Bits <FuzzyText />: the text is drawn once to an offscreen canvas,
// then copied row by row with a random horizontal offset every frame. Intensity rises on
// hover, bursts on click and spikes on a fixed interval (glitch, synced to 124 BPM).
// Device-pixel aware, pauses offscreen and draws a clean static frame for reduced motion.

type FuzzyTextProps = {
  text: string
  fontFamily: string
  fontWeight?: number
  color?: string
  /** CSS pixel font size, re-evaluated on resize. */
  fontSize: () => number
  letterSpacing?: number
  baseIntensity?: number
  hoverIntensity?: number
  fuzzRange?: number
  glitchInterval?: number
  glitchDuration?: number
  className?: string
  onReady?: () => void
}

export function FuzzyText({
  text,
  fontFamily,
  fontWeight = 500,
  color = '#F2EDE8',
  fontSize,
  letterSpacing = 0,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  fuzzRange = 30,
  glitchInterval = 3870,
  glitchDuration = 160,
  className,
  onReady,
}: FuzzyTextProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const sizeRef = useRef(fontSize)
  const readyRef = useRef(onReady)
  sizeRef.current = fontSize
  readyRef.current = onReady

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let raf = 0
    let cancelled = false
    let visible = true
    let hover = false
    let burst = false
    let glitch = false
    let current = reduce ? 0 : 1
    let last = 0
    let off: HTMLCanvasElement | null = null
    let range = 0
    let margin = 0
    const timers: number[] = []

    const draw = (k: number) => {
      if (!off) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let row = 0; row < off.height; row++) {
        const dx = Math.floor(k * (Math.random() - 0.5) * range)
        ctx.drawImage(off, 0, row, off.width, 1, margin + dx, row, off.width, 1)
      }
    }

    const setup = async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = sizeRef.current()
      const fontCss = `${fontWeight} ${size}px ${fontFamily}`
      try {
        await document.fonts.load(fontCss, text)
      } catch {
        await document.fonts.ready
      }
      if (cancelled) return
      const px = size * dpr
      const next = document.createElement('canvas')
      const o = next.getContext('2d')
      if (!o) return
      const applyFont = () => {
        o.font = `${fontWeight} ${px}px ${fontFamily}`
        o.textBaseline = 'alphabetic'
      }
      applyFont()
      const spacing = letterSpacing * px
      let total = -spacing
      for (const ch of text) total += o.measureText(ch).width + spacing
      const metrics = o.measureText(text)
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || px * 0.74)
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || 0)
      const pad = Math.ceil(2 * dpr)
      const buffer = Math.ceil(10 * dpr)
      next.width = Math.ceil(total) + buffer
      next.height = ascent + descent + pad * 2
      applyFont()
      o.fillStyle = color
      let x = buffer / 2
      for (const ch of text) {
        o.fillText(ch, x, ascent + pad)
        x += o.measureText(ch).width + spacing
      }
      off = next
      range = fuzzRange * dpr
      margin = Math.ceil(range + 20 * dpr)
      canvas.width = next.width + margin * 2
      canvas.height = next.height
      canvas.style.width = `${canvas.width / dpr}px`
      canvas.style.height = `${canvas.height / dpr}px`
      draw(current)
      readyRef.current?.()
    }

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      // ~30 fps is enough for the jitter and halves the per-frame cost.
      if (!off || !visible || t - last < 32) return
      last = t
      const target = burst || glitch ? 1 : hover ? hoverIntensity : baseIntensity
      current += (target - current) * 0.14
      draw(current)
    }

    const onEnter = () => (hover = true)
    const onLeave = () => (hover = false)
    const onDown = () => {
      burst = true
      timers.push(window.setTimeout(() => (burst = false), 150))
    }
    let resizeTimer = 0
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(setup, 150)
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)
    window.addEventListener('resize', onResize)
    let glitchTimer = 0
    if (!reduce) {
      canvas.addEventListener('pointerenter', onEnter)
      canvas.addEventListener('pointerleave', onLeave)
      canvas.addEventListener('pointerdown', onDown)
      glitchTimer = window.setInterval(() => {
        glitch = true
        timers.push(window.setTimeout(() => (glitch = false), glitchDuration))
      }, glitchInterval)
    }

    setup().then(() => {
      if (!cancelled && !reduce) raf = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearInterval(glitchTimer)
      clearTimeout(resizeTimer)
      timers.forEach(clearTimeout)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [text, fontFamily, fontWeight, color, letterSpacing, baseIntensity, hoverIntensity, fuzzRange, glitchInterval, glitchDuration, reduce])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
