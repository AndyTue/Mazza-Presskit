import { IconArrowLeft, IconArrowRight, IconPlayerPlayFilled, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { STROKE } from '../components/Icons'
import { Photo } from '../components/Photo'
import { RevealTitle } from '../components/RevealTitle'
import { gallery, type GalleryItem } from '../content/gallery'
import { useSmoothScroll } from '../lib/scroll'
import { useMounted } from '../lib/useMounted'

const pad = (n: number) => String(n).padStart(2, '0')

// "Foto 03" / "Video 01": items are numbered within their own kind.
const labels = (() => {
  const count = { photo: 0, video: 0 }
  return gallery.map((g) => `${g.kind === 'video' ? 'Video' : 'Foto'} ${pad(++count[g.kind])}`)
})()

// Photos are plain figures. Only videos open in the player (they need sound and controls).
function Tile({
  interactive,
  onOpen,
  children,
}: {
  interactive: boolean
  onOpen: (el: HTMLButtonElement) => void
  children: ReactNode
}) {
  if (!interactive) return <figure className="gt gt-static">{children}</figure>
  return (
    <button type="button" className="gt" onClick={(e) => onOpen(e.currentTarget)}>
      {children}
    </button>
  )
}

// Grid video: muted loop that only downloads and plays while it is on screen.
function GridVideo({ item }: { item: Extract<GalleryItem, { kind: 'video' }> }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const v = ref.current
    if (!v || reduce) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [reduce])
  return <video ref={ref} src={item.src} poster={item.poster} muted loop playsInline preload="none" aria-hidden="true" />
}

function Media({ item, large = false }: { item: GalleryItem; large?: boolean }) {
  if (item.kind === 'video') {
    return large ? (
      <video src={item.src} poster={item.poster} controls autoPlay playsInline aria-label={item.alt} />
    ) : (
      <>
        <GridVideo item={item} />
        <img src={item.poster} alt={item.alt} className="sr-only" loading="lazy" />
      </>
    )
  }
  return large ? (
    <Photo name={item.name} alt={item.alt} sizes="(max-width: 900px) 100vw, 60vw" eager />
  ) : (
    <Photo name={item.name} alt={item.alt} sizes="(max-width: 900px) 50vw, 33vw" />
  )
}

export function Gallery() {
  const reduce = useReducedMotion()
  const mounted = useMounted()
  const { lock, unlock } = useSmoothScroll()
  const area = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(-1)
  const opener = useRef<HTMLButtonElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Columns drift at different speeds while the gallery crosses the viewport.
  const { scrollYProgress } = useScroll({ target: area, offset: ['start end', 'end start'] })
  // Under reduced motion the ranges collapse to 0, keeping the same markup as the prerender.
  const still = reduce ? 0 : 1
  const y1 = useTransform(scrollYProgress, [0, 1], [56 * still, -56 * still])
  const y2 = useTransform(scrollYProgress, [0, 1], [-24 * still, 40 * still])
  const y3 = useTransform(scrollYProgress, [0, 1], [88 * still, -88 * still])
  const drift = [y1, y2, y3]

  const videoIdx = gallery.flatMap((g, i) => (g.kind === 'video' ? [i] : []))
  const step = (k: number) =>
    setOpen((i) => {
      const at = videoIdx.indexOf(i)
      return at < 0 ? i : videoIdx[(at + k + videoIdx.length) % videoIdx.length]
    })
  const several = videoIdx.length > 1
  const isOpen = open >= 0

  useEffect(() => {
    if (!isOpen) return
    lock()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(-1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlock()
    }
  }, [isOpen, lock, unlock])

  const close = () => {
    setOpen(-1)
    opener.current?.focus()
  }

  const photo = open >= 0 ? gallery[open] : null

  return (
    <section className="sec alt" aria-labelledby="h-gal">
      <RevealTitle id="h-gal" lines={['Galería']} />
      <div className="gal" ref={area}>
        {[1, 2, 3].map((col) => (
          <motion.div key={col} className={`gcol gcol-${col}`} style={{ y: drift[col - 1] }}>
            {gallery.map((g, i) =>
              g.column === col ? (
                <Tile
                  key={g.name}
                  interactive={g.kind === 'video'}
                  onOpen={(el) => {
                    opener.current = el
                    setOpen(i)
                  }}
                >
                  <motion.span
                    layoutId={reduce || g.kind !== 'video' ? undefined : `photo-${g.name}`}
                    className="img dj r24"
                    style={{ aspectRatio: g.ratio, display: 'block' }}
                  >
                    <Media item={g} />
                    {g.kind === 'video' && (
                      <span className="pill mono gplay" aria-hidden="true">
                        <IconPlayerPlayFilled size={12} />
                        Video
                      </span>
                    )}
                  </motion.span>
                  <span className="gcap mono">
                    <span>{labels[i]}</span>
                    {g.kind === 'video' && <span>Ver</span>}
                  </span>
                </Tile>
              ) : null,
            )}
          </motion.div>
        ))}
      </div>

      {mounted &&
        createPortal(
        <AnimatePresence>
          {photo && (
            <motion.div
              className="lb"
              role="dialog"
              aria-modal="true"
              aria-label="Galería ampliada"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="lb-top">
                <span className="mono">{labels[open]}</span>
                <span className="mono muted">
                  {pad(videoIdx.indexOf(open) + 1)} / {pad(videoIdx.length)}
                </span>
                <button ref={closeRef} className="btn mono" type="button" onClick={close}>
                  Cerrar
                  <IconX size={18} stroke={STROKE} aria-hidden="true" />
                </button>
              </div>
              <div className="lb-stage">
                {several && (
                  <button className="btn btn-sq" type="button" aria-label="Video anterior" onClick={() => step(-1)}>
                    <IconArrowLeft size={18} stroke={STROKE} aria-hidden="true" />
                  </button>
                )}
                <motion.div
                  key={photo.name}
                  layoutId={reduce ? undefined : `photo-${photo.name}`}
                  className="img dj lb-img"
                  style={{ aspectRatio: photo.full }}
                >
                  <Media item={photo} large />
                </motion.div>
                {several && (
                  <button className="btn btn-sq" type="button" aria-label="Video siguiente" onClick={() => step(1)}>
                    <IconArrowRight size={18} stroke={STROKE} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mono muted" style={{ textAlign: 'center' }}>
                {photo.alt}. {several ? 'Flechas para navegar, ' : ''}Esc para cerrar.
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}
