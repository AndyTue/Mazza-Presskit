import { Photo } from '../components/Photo'
import { RevealTitle } from '../components/RevealTitle'
import { bio } from '../content/bio'

export function Bio() {
  return (
    <section className="sec" aria-labelledby="h-bio">
      <div className="bio">
        <div className="bio-text">
          <RevealTitle id="h-bio" lines={['Biografía']} />
          {bio.draft && (
            <span className="tag mono" style={{ alignSelf: 'flex-start' }}>
              [Borrador de texto]
            </span>
          )}
          <p className="lead">{bio.lead}</p>
          <p className="body">{bio.body}</p>
          <dl className="facts">
            {bio.facts.map((f) => (
              <div key={f.label}>
                <dt className="mono muted">[{f.label}]</dt>
                <dd className="disp">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="bio-fig">
          <div className="img dj r24">
            <Photo name={bio.portrait.name} alt={bio.portrait.alt} sizes="(max-width: 900px) calc(100vw - 32px), 560px" />
          </div>
        </figure>
      </div>
    </section>
  )
}
