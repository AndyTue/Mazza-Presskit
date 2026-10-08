// Tracks come from Mazza's public SoundCloud feed (src/content/generated/soundcloud.json,
// refreshed by `npm run feeds` and before every build). Use the lists below to curate them.
import feed from './generated/soundcloud.json'

export const soundcloudProfile = 'https://soundcloud.com/edgar-pat-249072497'

// Uploads shorter than this (intros, promos, copyright snippets) are left out.
const MIN_SECONDS = 120
// Hide specific uploads by slug (the last part of the SoundCloud URL).
const HIDDEN_SLUGS: string[] = ['summer-mashup-pack-vol-2-by']
// Display names. Anything not listed is cleaned up automatically.
const OVERRIDES: Record<string, { title: string; tag: string }> = {
  'she-can-love-u-vs-la-jumpa-bad': { title: 'She Can Love U x La Jumpa', tag: 'Mazza Edit' },
  'baziman-x-rauw-mazzaedit': { title: 'Baziman x Diluvio', tag: 'Mazza Edit' },
  'mumbai-taxi-x-only-girl': { title: 'Mumbai Taxi x Only Girl', tag: 'Mazza Twist' },
  'shaking-x-doin-ya-thang': { title: 'Shaking x Doin Ya Thang', tag: 'Mazza Edit' },
  'guabansexxx-rauw-x-maccabi': { title: 'Guabansexxx x Maccabi', tag: 'Mazza Twist' },
  'luch-x-los-microfonos': { title: 'Luch x Los Micrófonos', tag: 'Mazza Edit' },
  'spring-break-mashup-pack-1': { title: 'Spring Break Mashup Pack 1', tag: 'ft. Katas' },
  'mazza-rooftop-dj-set': { title: 'Rooftop CF', tag: 'DJ set' },
  'afro-by-mazza': { title: 'Warm Up Afro', tag: 'DJ set' },
  'mazza-b2b-kats-afterentizi': { title: 'Mazza b2b Kats @afterentizi', tag: 'DJ set' },
}

export type Track = {
  slug: string
  title: string
  tag: string
  url: string
  artwork: string
  duration: string
  year: string
}

const smallWords = new Set(['x', 'vs', 'by', 'ft.', 'feat.', 'de', 'la', 'el', 'y'])

function cleanTitle(raw: string): { title: string; tag: string } {
  let title = raw
  let tag = ''
  const edit = title.match(/\(?\s*mazza\s*(edit|twist|remix)\s*\)?/i)
  if (edit) {
    tag = `Mazza ${edit[1][0].toUpperCase()}${edit[1].slice(1).toLowerCase()}`
    title = title.replace(edit[0], '')
  } else if (/dj\s*set/i.test(title)) {
    tag = 'DJ set'
    title = title.replace(/dj\s*set/i, '')
  }
  title = title.replace(/\s{2,}/g, ' ').replace(/[\s,-]+$/, '').trim()
  if (title === title.toUpperCase()) {
    title = title
      .toLowerCase()
      .split(' ')
      .map((w, i) => (i > 0 && smallWords.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ')
  }
  return { title, tag: tag || 'Track' }
}

const shortDuration = (d: string) => d.replace(/^00:/, '').replace(/^0(\d:)/, '$1')

export const tracks: Track[] = feed.items
  .filter((t) => t.seconds >= MIN_SECONDS && !HIDDEN_SLUGS.includes(t.slug))
  .map((t) => {
    const names = OVERRIDES[t.slug] ?? cleanTitle(t.title)
    return {
      slug: t.slug,
      title: names.title,
      tag: names.tag,
      url: t.url,
      artwork: t.artwork,
      duration: shortDuration(t.duration),
      year: t.published.slice(0, 4),
    }
  })
