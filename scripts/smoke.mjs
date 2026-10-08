// Interaction smoke test: SoundCloud player, YouTube facade, lightbox keyboard nav,
// mobile menu, and a reduced-motion load. Usage: node scripts/smoke.mjs [url] [outDir]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'screens'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const results = []
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
const jump = (page, id) =>
  page.evaluate((target) => window.scrollTo(0, document.getElementById(target).getBoundingClientRect().top + scrollY), id)

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(url, { waitUntil: 'networkidle' })

  await jump(page, 'musica')
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: 'Track siguiente' }).click()
  await page.waitForTimeout(600)
  const title = await page.locator('.cv-title').textContent()
  check('Cover Flow avanza con la flecha', Boolean(title), title)
  await page.locator('.cv.on').click()
  const scFrame = page.locator('.sc-player iframe')
  await scFrame.waitFor({ timeout: 8000 }).catch(() => {})
  check('SoundCloud: el reproductor se carga al dar Play', (await scFrame.count()) === 1, await scFrame.getAttribute('src').catch(() => ''))
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${out}/smoke-musica-play.png` })

  await jump(page, 'hidden')
  await page.waitForTimeout(1200)
  await page.locator('button.vid').click()
  const yt = page.locator('.vid iframe')
  await yt.waitFor({ timeout: 8000 }).catch(() => {})
  check('YouTube: el video se incrusta al hacer clic', (await yt.count()) === 1, await yt.getAttribute('src').catch(() => ''))

  await jump(page, 'galeria')
  await page.waitForTimeout(1200)
  check('Galería: las fotos no son clicables', (await page.locator('figure.gt img').count()) > 0 && (await page.locator('button.gt img').count()) === 1)
  await page.locator('figure.gt img').first().click({ force: true })
  await page.waitForTimeout(500)
  const dialog = page.getByRole('dialog', { name: 'Galería ampliada' })
  check('Galería: clic en una foto no abre nada', !(await dialog.isVisible().catch(() => false)))
  await page.locator('button.gt').first().click()
  await page.waitForTimeout(700)
  check('Galería: el video abre su reproductor', (await dialog.locator('video[controls]').count()) === 1)
  await page.screenshot({ path: `${out}/smoke-lightbox.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  check('Lightbox: Esc cierra', !(await dialog.isVisible().catch(() => false)))
  check('Sin errores de página (escritorio)', errors.length === 0, errors.join(' | '))
  await page.close()
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Menú' }).click()
  await page.waitForTimeout(900)
  const menu = page.getByRole('dialog', { name: 'Menú de secciones' })
  check('Menú móvil abre', await menu.isVisible())
  await page.screenshot({ path: `${out}/smoke-menu.png` })
  await menu.getByRole('link', { name: /Galería/ }).click()
  await page.waitForTimeout(1800)
  const y = await page.evaluate(() => document.getElementById('galeria').getBoundingClientRect().top)
  check('Menú móvil: navega a la sección y se cierra', Math.abs(y) < 80 && !(await menu.isVisible().catch(() => false)), `top=${Math.round(y)}`)
  await ctx.close()
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await jump(page, 'biografia')
  await page.waitForTimeout(600)
  const visible = await page.locator('#h-bio .ln-in').evaluate((el) => getComputedStyle(el).transform)
  check('Movimiento reducido: títulos visibles sin animación', visible === 'none' || visible.includes('1, 0, 0, 1, 0, 0'), visible)
  check('Sin errores de página (movimiento reducido)', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

await browser.close()
console.log(results.join('\n'))
