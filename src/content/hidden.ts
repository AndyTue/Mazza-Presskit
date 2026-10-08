// Hidden sessions come from the channel's public YouTube feed
// (src/content/generated/youtube.json, refreshed before every build).
import feed from './generated/youtube.json'

export const hidden = {
  handle: '@HIDDEN_121',
  url: 'https://www.youtube.com/@HIDDEN_121',
  tagline: 'Uncover the sound',
  lead: 'Mazza es uno de los creadores de Hidden, el primer canal y proyecto de sesiones de música electrónica en Tizimín, Yucatán.',
  body: 'Hidden es un proyecto dedicado a documentar y expandir la escena electrónica del sureste mexicano, sesión a sesión.',
  // Session shown large. If it disappears from the feed, the newest one is used.
  featuredId: 'VDrf_xir0Kk',
}

export type Video = { id: string; genre: string; artists: string; date: string; title: string }

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(' ')
    .map((w) => (w === 'b2b' ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(iso))
    .replace('.', '')

function parse(raw: string): { genre: string; artists: string } {
  const parts = raw
    .split(/\s+-\s+/)
    .map((p) => p.trim())
    .filter((p) => p && p.toUpperCase() !== 'HIDDEN')
  return { genre: titleCase(parts[0] ?? 'Sesión'), artists: titleCase(parts.slice(1).join(' ') || 'Hidden') }
}

export const videos: Video[] = feed.items.map((v) => ({ id: v.id, title: v.title, date: formatDate(v.published), ...parse(v.title) }))

export const featuredVideo = videos.find((v) => v.id === hidden.featuredId) ?? videos[0]

export const recentVideos = videos.filter((v) => v.id !== featuredVideo?.id).slice(0, 4)

export const thumb = (id: string, size: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'maxresdefault') =>
  `https://i.ytimg.com/vi/${id}/${size}.jpg`

// Responsive YouTube thumbnails: small ones for the row, up to 1280px for the featured video.
export const thumbSet = (id: string, large: boolean) =>
  large
    ? `${thumb(id, 'hqdefault')} 480w, ${thumb(id, 'maxresdefault')} 1280w`
    : `${thumb(id, 'mqdefault')} 320w, ${thumb(id, 'hqdefault')} 480w`
