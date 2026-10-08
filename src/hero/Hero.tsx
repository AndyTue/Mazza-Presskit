import { IconArrowDown } from '@tabler/icons-react'
import { useState, type MouseEvent } from 'react'
import { DotField } from '../components/DotField'
import { FuzzyText } from '../components/FuzzyText'
import { SocialIcon, STROKE } from '../components/Icons'
import { Photo } from '../components/Photo'
import { site, socials } from '../content/site'
import { useSmoothScroll } from '../lib/scroll'
import { HeroLogo } from './HeroLogo'

const wordmarkSize = () => Math.max(64, Math.min(window.innerWidth * 0.125, window.innerHeight * 0.17, 184))

export function Hero() {
  const { scrollTo } = useSmoothScroll()
  const [ready, setReady] = useState(false)

  const toBio = (e: MouseEvent) => {
    e.preventDefault()
    scrollTo('biografia')
  }

  return (
    <section className="hero" aria-label="Inicio">
      <div className="hero-photo dj" aria-hidden="true">
        <Photo name="hero" alt="" sizes="100vw" eager />
      </div>
      <DotField className="hero-dots" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-col">
        <HeroLogo />
        <h1 className={`wm${ready ? ' ready' : ''}`}>
          <span className="disp wm-t">{site.name}</span>
          <FuzzyText
            className="fz"
            text={site.name.toUpperCase()}
            fontFamily="'Playfair Display Variable', 'Playfair Display', Georgia, serif"
            fontWeight={500}
            fontSize={wordmarkSize}
            onReady={() => setReady(true)}
          />
        </h1>
        <ul className="soc mono" aria-label="Redes sociales">
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                <SocialIcon id={s.id} />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <a className="hero-sc mono" href="#biografia" onClick={toBio}>
        Scroll
        <IconArrowDown size={18} stroke={STROKE} aria-hidden="true" />
      </a>
    </section>
  )
}
