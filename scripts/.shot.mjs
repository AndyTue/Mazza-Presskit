import { chromium } from 'playwright'
const out = process.argv[2]
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [w, h, n] of [[1535, 693, 'lap'], [1440, 900, 'desk'], [390, 844, 'mob']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
  await p.mouse.move(w / 2, h / 2 + 5); await p.mouse.move(w / 2, h / 2)
  await p.waitForFunction(() => document.querySelector('.logo2d.out') && getComputedStyle(document.querySelector('.logo2d')).opacity === '0', null, { timeout: 60000 }).catch(() => console.log(n, 'no 3D'))
  await p.waitForTimeout(1500)
  await p.screenshot({ path: `${out}/hero4-${n}.png` })
}
await b.close()
