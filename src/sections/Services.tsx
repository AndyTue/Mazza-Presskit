import type { MouseEvent } from 'react'
import { Arrow } from '../components/Icons'
import { Photo } from '../components/Photo'
import { RevealTitle } from '../components/RevealTitle'
import { services } from '../content/services'
import { useSmoothScroll } from '../lib/scroll'

export function Services() {
  const { scrollTo } = useSmoothScroll()
  const toContact = (e: MouseEvent) => {
    e.preventDefault()
    scrollTo('contacto')
  }

  return (
    <section className="sec alt" aria-labelledby="h-svc">
      <RevealTitle id="h-svc" lines={['Servicios']} />
      <div className="svc-g">
        {services.map((s) => (
          <a
            key={s.title}
            href="#contacto"
            onClick={toContact}
            className={`svc svc--${s.layout}${s.accent ? ' svc-acc' : ''}`}
          >
            {s.image && (
              <span className="img dj">
                <Photo
                  name={s.image.name}
                  alt={s.image.alt}
                  position={s.image.position}
                  sizes="(max-width: 900px) calc(100vw - 48px), 60vw"
                />
              </span>
            )}
            <div className="svc-b">
              <div className="svc-t">
                <h3 className="disp">{s.title}</h3>
                <Arrow size={24} />
              </div>
              <p className="body" style={{ margin: 0 }}>
                {s.body}
              </p>
              <span className="tags">
                {s.tags.map((t) => (
                  <span key={t} className="tag mono">
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
