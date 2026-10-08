import { IconMenu2, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { nav, site, socials } from '../content/site'
import { useSmoothScroll } from '../lib/scroll'
import { SocialIcon, STROKE } from './Icons'

const LEFT = nav.slice(0, 4)
const RIGHT = nav.slice(4)

export function NavBar() {
  const { scrollTo, lock, unlock } = useSmoothScroll()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40)
    const line = window.innerHeight * 0.45
    let current = ''
    for (const item of nav) {
      const el = document.getElementById(item.id)
      if (el && el.getBoundingClientRect().top <= line) current = item.id
    }
    setActive(current)
  })

  useEffect(() => {
    if (!open) return
    lock()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlock()
      burgerRef.current?.focus()
    }
  }, [open, lock, unlock])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    if (open) {
      // Release the scroll lock before jumping; the menu effect cleanup runs a frame later.
      unlock()
      setOpen(false)
    }
    scrollTo(id)
  }

  const link = (item: (typeof nav)[number]) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      onClick={go(item.id)}
      className={`nl${active === item.id ? ' on' : ''}`}
      aria-current={active === item.id ? 'location' : undefined}
    >
      {item.label}
      {active === item.id && <motion.span layoutId="nav-line" className="nl-line" />}
    </a>
  )

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <nav className="nav-l mono" aria-label="Secciones, primera parte">
          {LEFT.map(link)}
        </nav>
        <a className="brand" href="#top" onClick={go('top')} aria-label={`${site.name}, ir al inicio`}>
          <span className="brand-mark" />
        </a>
        <div className="nav-r mono">
          <nav className="nav-rl" aria-label="Secciones, segunda parte">
            {RIGHT.map(link)}
          </nav>
          <button
            ref={burgerRef}
            className="burger mono"
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen(true)}
          >
            Menú
            <IconMenu2 size={18} stroke={STROKE} aria-hidden="true" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de secciones"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <div className="menu-top">
              <span />
              <a className="brand" href="#top" onClick={go('top')} aria-label={`${site.name}, ir al inicio`}>
                <span className="brand-mark" />
              </a>
              <button ref={closeRef} className="burger mono" type="button" onClick={() => setOpen(false)}>
                Cerrar
                <IconX size={18} stroke={STROKE} aria-hidden="true" />
              </button>
            </div>
            <nav className="menu-nav" aria-label="Secciones">
              {nav.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className={`ml disp${active === item.id ? ' on' : ''}`}
                  aria-current={active === item.id ? 'location' : undefined}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 + i * 0.05 }}
                >
                  <span className="mono">[{String(i + 1).padStart(2, '0')}]</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="menu-foot">
              <ul className="soc mono" style={{ justifyContent: 'flex-start', margin: 0 }}>
                {socials.map((s) => (
                  <li key={s.id}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      <SocialIcon id={s.id} />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mono muted">
                [{site.name}] [{site.year}]
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
