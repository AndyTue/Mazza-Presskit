import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { createRef, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

export type LayerDef = { id: string; node: ReactNode }

// Sections stack like cards: each one sticks while the next slides over it, and the
// covered layer scales back and darkens. A zero-height anchor before every layer keeps
// the section's natural scroll position for navigation and for the scroll progress.
export function Layers({ layers }: { layers: LayerDef[] }) {
  const anchors = useMemo(() => layers.map(() => createRef<HTMLDivElement>()), [layers])
  return (
    <>
      {layers.map((layer, i) => (
        <Layer key={layer.id} layer={layer} index={i} anchor={anchors[i]} next={anchors[i + 1]} />
      ))}
    </>
  )
}

type LayerProps = {
  layer: LayerDef
  index: number
  anchor: RefObject<HTMLDivElement | null>
  next?: RefObject<HTMLDivElement | null>
}

function Layer({ layer, index, anchor, next }: LayerProps) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)

  // A layer taller than the viewport sticks once its bottom edge reaches the bottom
  // of the screen, so its last part is still readable before the next layer covers it.
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const update = () => setTop(Math.min(0, window.innerHeight - el.offsetHeight))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: next ?? anchor, offset: ['start end', 'start start'] })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  const scale = useTransform(progress, [0, 1], [1, 0.94])
  const dim = useTransform(progress, [0, 1], [0, 0.72])
  const animated = Boolean(next) && !reduce

  return (
    <>
      <div id={layer.id} ref={anchor} className="anchor" />
      <motion.div
        ref={box}
        className="layer"
        style={{ top, zIndex: index + 1, scale: animated ? scale : 1, transformOrigin: '50% 100%' }}
      >
        {layer.node}
        {/* Rendered whenever a layer covers this one (not only when animated) so the prerendered
            markup matches the client under reduced motion. */}
        {next && <motion.div className="layer-dim" style={{ opacity: animated ? dim : 0 }} aria-hidden="true" />}
      </motion.div>
    </>
  )
}
