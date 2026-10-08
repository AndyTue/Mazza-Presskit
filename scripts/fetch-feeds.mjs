// Pulls Mazza's public SoundCloud tracks and the Hidden YouTube uploads into
// src/content/generated/*.json. Runs before every build (npm run build) and can be
// run by hand with `npm run feeds`. No API keys: both services publish public RSS feeds.
// If a feed is unreachable, the last committed JSON is kept so the build never breaks.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'content', 'generated')

const SOUNDCLOUD_USER_ID = '1106894353'
const YOUTUBE_CHANNEL_ID = 'UCWG6PuI7y_mnBR0M2Bg85fw'

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim()

const pick = (xml, re) => {
  const m = xml.match(re)
  return m ? decode(m[1]) : ''
}

const toSeconds = (hms) => hms.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0)

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'mazza-presskit-build/1.0' } })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

async function soundcloud() {
  const xml = await get(`https://feeds.soundcloud.com/users/soundcloud:users:${SOUNDCLOUD_USER_ID}/sounds.rss`)
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const url = pick(it, /<link>([\s\S]*?)<\/link>/)
    const art = pick(it, /<itunes:image href="([^"]+)"/)
    const duration = pick(it, /<itunes:duration>([\s\S]*?)<\/itunes:duration>/)
    return {
      slug: url.split('/').pop(),
      title: pick(it, /<title>([\s\S]*?)<\/title>/),
      url,
      published: new Date(pick(it, /<pubDate>([\s\S]*?)<\/pubDate>/)).toISOString(),
      duration,
      seconds: duration ? toSeconds(duration) : 0,
      artwork: art.replace('-t3000x3000.', '-t500x500.'),
    }
  })
}

async function youtube() {
  const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`)
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: pick(e, /<yt:videoId>([\s\S]*?)<\/yt:videoId>/),
    title: pick(e, /<title>([\s\S]*?)<\/title>/),
    published: pick(e, /<published>([\s\S]*?)<\/published>/),
  }))
}

async function write(name, task) {
  const file = join(outDir, `${name}.json`)
  try {
    const items = await task()
    if (!items.length) throw new Error('empty feed')
    await writeFile(file, JSON.stringify({ fetchedAt: new Date().toISOString(), items }, null, 2) + '\n')
    console.log(`[feeds] ${name}: ${items.length} items`)
  } catch (err) {
    try {
      await readFile(file)
      console.warn(`[feeds] ${name}: ${err.message}. Keeping the previous snapshot.`)
    } catch {
      await writeFile(file, JSON.stringify({ fetchedAt: null, items: [] }, null, 2) + '\n')
      console.warn(`[feeds] ${name}: ${err.message}. Wrote an empty snapshot.`)
    }
  }
}

await mkdir(outDir, { recursive: true })
await Promise.all([write('soundcloud', soundcloud), write('youtube', youtube)])
