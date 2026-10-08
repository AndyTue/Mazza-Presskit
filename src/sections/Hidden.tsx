import { IconPlayerPlayFilled } from '@tabler/icons-react'
import { useState, type SyntheticEvent } from 'react'
import { Arrow } from '../components/Icons'
import { RevealTitle } from '../components/RevealTitle'
import { featuredVideo, hidden, recentVideos, thumb, thumbSet, type Video } from '../content/hidden'

const fallbackThumb = (id: string) => (e: SyntheticEvent<HTMLImageElement>) => {
  const fallback = thumb(id, 'hqdefault')
  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
}

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`

export function Hidden() {
  const set: Video[] = featuredVideo ? [featuredVideo, ...recentVideos] : []
  const [currentId, setCurrentId] = useState(featuredVideo?.id)
  const [playing, setPlaying] = useState(false)
  const current = set.find((v) => v.id === currentId) ?? featuredVideo
  const row = set.filter((v) => v.id !== current?.id)

  return (
    <section className="sec alt" aria-labelledby="h-hid">
      <div className="g12" style={{ alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 5', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <RevealTitle id="h-hid" lines={['Hidden']} className="flush" />
          <p className="lead">{hidden.lead}</p>
          <p className="body">{hidden.body}</p>
          <p className="mono muted">
            [{hidden.tagline}] [YouTube] [{hidden.handle}]
          </p>
          <a className="btn mono" href={hidden.url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
            Ver canal
            <Arrow />
          </a>
        </div>

        {current && (
          <figure style={{ gridColumn: '6 / span 7', margin: 0 }}>
            {playing ? (
              <div className="img r24 vid">
                <iframe
                  src={embed(current.id)}
                  title={`Hidden: ${current.genre}, ${current.artists}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                type="button"
                className="img r24 vid"
                onClick={() => setPlaying(true)}
                aria-label={`Ver sesión: ${current.genre} / ${current.artists}`}
              >
                <img
                  src={thumb(current.id)}
                  srcSet={thumbSet(current.id, true)}
                  sizes="(max-width: 900px) 100vw, 58vw"
                  alt=""
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  onError={fallbackThumb(current.id)}
                />
                <span className="pill mono vid-play">
                  <IconPlayerPlayFilled size={14} aria-hidden="true" />
                  Ver sesión
                </span>
              </button>
            )}
            <figcaption className="cap mono">
              <span>
                {current.genre} / {current.artists}
              </span>
              <span className="muted">[{current.date}]</span>
            </figcaption>
          </figure>
        )}
      </div>

      {row.length > 0 && (
        <ul className="recent" aria-label="Más sesiones de Hidden">
          {row.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => {
                  setCurrentId(v.id)
                  setPlaying(false)
                }}
              >
                <span className="img r24">
                  <img
                    src={thumb(v.id, 'hqdefault')}
                    srcSet={thumbSet(v.id, false)}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    alt=""
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    onError={fallbackThumb(v.id)}
                  />
                </span>
                <span className="cap mono" style={{ flexDirection: 'column', gap: 4, textAlign: 'left' }}>
                  <span>
                    {v.genre} / {v.artists}
                  </span>
                  <span className="muted">[{v.date}]</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
