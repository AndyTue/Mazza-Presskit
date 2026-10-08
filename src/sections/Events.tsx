import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, type PanInfo } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { STROKE } from '../components/Icons'
import { RevealTitle } from '../components/RevealTitle'
import { events, flyer } from '../content/events'
import { useMediaQuery } from '../lib/useMediaQuery'
import { useMounted } from '../lib/useMounted'

const AUTO_MS = 2000
const VISIBLE_SIDE = 3

// Shortest signed distance on a ring, so the carousel loops without rewinding.
function ringOffset(i: number, index: number, n: number) {
  let d = i - index
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

export function Events() {
  const reduce = useReducedMotion()
  const mounted = useMounted()
  const mobile = useMediaQuery('(max-width: 900px)')
  const short = useMediaQuery('(min-width: 901px) and (max-height: 800px)')
  const width = mobile ? 230 : short ? 260 : 340
  const n = events.length
  const [index, setIndex] = useState(0)
  const [hold, setHold] = useState(false)
  const [kick, setKick] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { amount: 0.4 })
  const dragged = useRef(false)
  const tiltX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 })
  const tiltY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 })

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (((i + delta) % n) + n) % n)
      setKick((k) => k + 1)
    },
    [n],
  )
  const current = events[index]

  // Advances every 2 s, like the music carousel. Stops while the pointer or focus is on it,
  // while it is off screen and under reduced motion; manual navigation restarts the count.
  useEffect(() => {
    if (reduce || hold || !inView || n < 2) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % n), AUTO_MS)
    return () => clearInterval(t)
  }, [reduce, hold, inView, n, kick])

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 30) return
    dragged.current = true
    const travel = info.offset.x + info.velocity.x * 0.25
    go(-Math.max(1, Math.round(Math.abs(travel) / (width * 0.6))) * Math.sign(travel))
    setTimeout(() => (dragged.current = false), 0)
  }

  const onTilt = (e: ReactPointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 10)
  }
  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'Home') go(-index)
    else if (e.key === 'End') go(n - 1 - index)
    else return
    e.preventDefault()
  }

  return (
    <section className="sec" aria-labelledby="h-ev">
      <RevealTitle
        id="h-ev"
        lines={[
          <>
            Eventos <em className="it">pasados</em>
          </>,
        ]}
      />
      <div
        className="cf-wrap"
        ref={stage}
        style={{ '--fw': `${width}px` } as CSSProperties}
        onPointerEnter={() => setHold(true)}
        onPointerLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHold(false)
        }}
      >
        <motion.div
          className="cf"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Flyers de eventos pasados. Cambia cada 2 segundos; usa las flechas izquierda y derecha para navegar."
          onPanEnd={onPanEnd}
          onKeyDown={onKey}
        >
          {mounted &&
            events.map((ev, i) => {
              const d = ringOffset(i, index, n)
              const ad = Math.abs(d)
              const sg = Math.sign(d)
              const hidden = ad > VISIBLE_SIDE
              const on = d === 0
              const src = flyer(ev.image)
              return (
                <motion.button
                  key={ev.image}
                  type="button"
                  className={`fl${on ? ' on' : ''}`}
                  style={{ zIndex: 50 - ad }}
                  initial={false}
                  animate={{
                    x: on ? 0 : sg * (0.72 + (ad - 1) * 0.42) * width,
                    z: on ? 0 : -0.4 * width - (ad - 1) * 60,
                    rotateY: on ? 0 : -sg * 40,
                    scale: on ? 1 : 0.86,
                    opacity: hidden ? 0 : 1,
                  }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 26 }}
                  aria-hidden={hidden ? true : undefined}
                  tabIndex={hidden ? -1 : 0}
                  aria-label={on ? ev.alt : `Mostrar: ${ev.alt}`}
                  aria-current={on ? 'true' : undefined}
                  onClick={() => !dragged.current && !on && go(d)}
                  onPointerMove={on ? onTilt : undefined}
                  onPointerLeave={on ? resetTilt : undefined}
                >
                  <motion.span
                    className="img r24 fl-in"
                    style={on ? { rotateX: tiltX, rotateY: tiltY, display: 'block' } : { display: 'block' }}
                  >
                    <img
                      src={src.src}
                      srcSet={src.srcSet}
                      sizes={`${width}px`}
                      alt=""
                      width={1080}
                      height={1350}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <motion.span
                      className="cv-sh"
                      initial={false}
                      animate={{ opacity: on ? 0 : Math.min(0.62, 0.32 + ad * 0.1) }}
                    />
                  </motion.span>
                </motion.button>
              )
            })}
        </motion.div>
        <button className="btn btn-sq cv-nav cv-prev fl-nav" type="button" aria-label="Flyer anterior" onClick={() => go(-1)}>
          <IconArrowLeft size={18} stroke={STROKE} aria-hidden="true" />
        </button>
        <button className="btn btn-sq cv-nav cv-next fl-nav" type="button" aria-label="Flyer siguiente" onClick={() => go(1)}>
          <IconArrowRight size={18} stroke={STROKE} aria-hidden="true" />
        </button>
      </div>
      {current && (
        <div className="cf-cap" aria-live="polite">
          <span className="mono muted">
            {[current.date, current.place].filter(Boolean).map((t) => `[${t}]`).join(' ')}
          </span>
          <span className="disp">{current.name}</span>
          <span className="mono muted">
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
        </div>
      )}
    </section>
  )
}
