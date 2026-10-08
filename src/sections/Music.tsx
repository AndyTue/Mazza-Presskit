import { IconArrowLeft, IconArrowRight, IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react'
import { motion, useInView, useReducedMotion, type PanInfo } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Arrow, STROKE } from '../components/Icons'
import { RevealTitle } from '../components/RevealTitle'
import { soundcloudProfile, tracks, type Track } from '../content/music'
import { useMediaQuery } from '../lib/useMediaQuery'
import { useMounted } from '../lib/useMounted'

const WIDGET_API = 'https://w.soundcloud.com/player/api.js'
let widgetApi: Promise<void> | null = null

function loadWidgetApi() {
  widgetApi ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = WIDGET_API
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('SoundCloud widget API failed to load'))
    document.head.appendChild(s)
  })
  return widgetApi
}

const AUTO_MS = 2000
const VISIBLE_SIDE = 3

// Shortest signed distance on a ring, so the carousel loops without rewinding.
function ringOffset(i: number, index: number, n: number) {
  let d = i - index
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

const widgetSrc = (url: string) =>
  'https://w.soundcloud.com/player/?' +
  new URLSearchParams({
    url,
    color: '#7a0f1f',
    auto_play: 'true',
    visual: 'true',
    hide_related: 'true',
    show_comments: 'false',
    show_reposts: 'false',
    show_teaser: 'false',
  }).toString()

export function Music() {
  const reduce = useReducedMotion()
  const mounted = useMounted()
  const mobile = useMediaQuery('(max-width: 900px)')
  const short = useMediaQuery('(min-width: 901px) and (max-height: 800px)')
  const size = mobile ? 210 : short ? 240 : 320
  const [index, setIndex] = useState(Math.min(2, tracks.length - 1))
  const [loaded, setLoaded] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const widget = useRef<SoundCloudWidget | null>(null)
  const dragged = useRef(false)

  const n = tracks.length
  const current = tracks[index]
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { amount: 0.4 })
  const [hold, setHold] = useState(false)
  const [kick, setKick] = useState(0)
  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (((i + delta) % n) + n) % n)
      setKick((k) => k + 1)
    },
    [n],
  )
  const isOn = playing && loaded?.slug === current?.slug

  // Advances every 2 s. Stops while a track plays, while the pointer or focus is on the
  // carousel, while it is off screen and under reduced motion; manual navigation restarts it.
  useEffect(() => {
    if (reduce || hold || !inView || playing || n < 2) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % n), AUTO_MS)
    return () => clearInterval(t)
  }, [reduce, hold, inView, playing, n, kick])

  const playCurrent = () => {
    if (!current) return
    if (loaded?.slug === current.slug && widget.current) widget.current.toggle()
    else {
      setPlaying(false)
      setLoaded(current)
    }
  }

  const bindWidget = async (iframe: HTMLIFrameElement) => {
    try {
      await loadWidgetApi()
      const SC = window.SC
      if (!SC) return
      const w = SC.Widget(iframe)
      widget.current = w
      w.bind(SC.Widget.Events.PLAY, () => setPlaying(true))
      w.bind(SC.Widget.Events.PAUSE, () => setPlaying(false))
      w.bind(SC.Widget.Events.FINISH, () => setPlaying(false))
    } catch {
      widget.current = null
    }
  }

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const travel = info.offset.x + info.velocity.x * 0.25
    if (Math.abs(info.offset.x) < 30) return
    dragged.current = true
    go(-Math.max(1, Math.round(Math.abs(travel) / (size * 0.45))) * Math.sign(travel))
    setTimeout(() => (dragged.current = false), 0)
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
    <section className="sec" aria-labelledby="h-mus">
      <div className="sec-head">
        <RevealTitle id="h-mus" lines={['Música']} />
        <a className="btn mono" href={soundcloudProfile} target="_blank" rel="noopener noreferrer">
          Escuchar en SoundCloud
          <Arrow />
        </a>
      </div>

      {tracks.length === 0 ? (
        <p className="body">Los tracks se cargan desde SoundCloud al publicar el sitio.</p>
      ) : (
        <>
          <div
            className="cvf-wrap"
            ref={stage}
            style={{ '--cs': `${size}px` } as CSSProperties}
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setHold(false)
            }}
          >
            <motion.div
              className="cvf"
              role="group"
              aria-roledescription="carrusel"
              aria-label="Tracks de Mazza. Cambia cada 2 segundos; usa las flechas izquierda y derecha para navegar."
              onKeyDown={onKey}
              onPanEnd={onPanEnd}
            >
              {mounted &&
                tracks.map((t, i) => {
                  const d = ringOffset(i, index, n)
                  const ad = Math.abs(d)
                  const sg = Math.sign(d)
                  const hidden = ad > VISIBLE_SIDE
                  const on = d === 0
                  const playingThis = isOn && loaded?.slug === t.slug
                  return (
                    <motion.button
                      key={t.slug}
                      type="button"
                      className={`cv${on ? ' on' : ''}${playingThis ? ' playing' : ''}`}
                      style={{ zIndex: 50 - ad }}
                      initial={false}
                      animate={{
                        x: on ? 0 : sg * (0.74 + (ad - 1) * 0.36) * size,
                        z: on ? 0 : -0.45 * size - (ad - 1) * 60,
                        rotateY: on ? 0 : -sg * 48,
                        scale: on ? 1 : 0.88,
                        opacity: hidden ? 0 : 1,
                      }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 26 }}
                      aria-hidden={hidden ? true : undefined}
                      tabIndex={hidden ? -1 : 0}
                      aria-label={on ? `${t.title}, ${isOn ? 'pausar' : 'reproducir'}` : `Mostrar ${t.title}`}
                      onClick={() => {
                        if (dragged.current) return
                        if (on) playCurrent()
                        else go(d)
                      }}
                    >
                      <span className="img r24 cv-img">
                        <img
                          src={t.artwork}
                          srcSet={`${t.artwork.replace('-t500x500.', '-t300x300.')} 300w, ${t.artwork} 500w`}
                          sizes={`${size}px`}
                          alt=""
                          width={500}
                          height={500}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                        <motion.span
                          className="cv-sh"
                          initial={false}
                          animate={{ opacity: on ? 0 : Math.min(0.62, 0.32 + ad * 0.1) }}
                        />
                        {on && (
                          <span className="cv-play" aria-hidden="true">
                            {playingThis ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}
                          </span>
                        )}
                      </span>
                      <span className="img r24 cv-ref" aria-hidden="true">
                        <img
                          src={t.artwork.replace('-t500x500.', '-t300x300.')}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </span>
                    </motion.button>
                  )
                })}
            </motion.div>
            <button className="btn btn-sq cv-nav cv-prev" type="button" aria-label="Track anterior" onClick={() => go(-1)}>
              <IconArrowLeft size={18} stroke={STROKE} aria-hidden="true" />
            </button>
            <button className="btn btn-sq cv-nav cv-next" type="button" aria-label="Track siguiente" onClick={() => go(1)}>
              <IconArrowRight size={18} stroke={STROKE} aria-hidden="true" />
            </button>
          </div>

          {current && (
            <div className="cv-info">
              <p className="mono muted">
                <span>{current.tag}</span>
                <span style={{ marginLeft: 16 }}>
                  [{current.year}] [{current.duration}]
                </span>
                <span style={{ marginLeft: 16 }}>
                  {String(index + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}
                </span>
              </p>
              <div className="cv-tl" aria-live="polite">
                <p className="disp cv-title">{current.title}</p>
                {isOn && (
                  <span className="eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
              {loaded && (
                <div className="sc-player">
                  <iframe
                    key={loaded.slug}
                    title={`Reproductor de SoundCloud: ${loaded.title}`}
                    src={widgetSrc(loaded.url)}
                    allow="autoplay"
                    onLoad={(e) => bindWidget(e.currentTarget)}
                  />
                </div>
              )}
              <a
                className="mono muted"
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}
              >
                Abrir este track en SoundCloud
                <Arrow />
              </a>
            </div>
          )}
        </>
      )}
    </section>
  )
}
