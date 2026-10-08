import { IconArrowUp } from '@tabler/icons-react'
import { Arrow, SocialIcon, STROKE } from '../components/Icons'
import { RevealTitle } from '../components/RevealTitle'
import { site, socials } from '../content/site'
import { useSmoothScroll } from '../lib/scroll'

export function Contact() {
  const { scrollTo } = useSmoothScroll()
  return (
    <section className="sec" aria-labelledby="h-con" style={{ paddingBottom: 24 }}>
      <RevealTitle id="h-con" lines={['Contacto']} />
      <ul className="lks" aria-label="Redes sociales">
        {socials.map((s) => (
          <li key={s.id}>
            <a className="lk" href={s.href} target="_blank" rel="noopener noreferrer">
              <span className="lk-i">
                <SocialIcon id={s.id} size={26} />
              </span>
              <span className="lk-tx">
                <span className="disp lk-t">{s.label}</span>
                <span className="mono lk-h">{s.handle}</span>
              </span>
              <span className="lk-ar">
                <Arrow size={32} />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <footer className="foot">
        <img src="/images/letras.webp" alt={site.name} width={1800} height={246} loading="lazy" decoding="async" />
        <div className="foot-r mono muted">
          <span>
            © {site.year} {site.name}
          </span>
          <span>{site.location}</span>
          <button type="button" onClick={() => scrollTo('top')}>
            Volver arriba
            <IconArrowUp size={18} stroke={STROKE} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  )
}
