// Section-by-section screenshots at desktop (1440) and mobile (390) widths.
// Usage: node scripts/screenshots.mjs [url] [outDir]   (uses the installed Chrome)
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'screens'
const sections = ['top', 'biografia', 'servicios', 'musica', 'hidden', 'eventos', 'galeria', 'contacto']
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
]

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
for (const d of devices) {
  const ctx = await browser.newContext({ viewport: d.viewport, isMobile: d.isMobile, hasTouch: d.isMobile, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${d.name}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${d.name} console: ${m.text()}`))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  for (const id of sections) {
    await page.evaluate((target) => {
      const el = document.getElementById(target)
      const top = target === 'top' || !el ? 0 : el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top)
    }, id)
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `${out}/${d.name}-${id}.png` })
  }
  await ctx.close()
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no page errors')
