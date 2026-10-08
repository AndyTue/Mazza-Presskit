// Turns dist/index.html into a static, prerendered page (no server needed):
//   1. injects the server-rendered app at <!--app-html-->
//   2. inlines the stylesheet so the first paint needs no extra request
//   3. starts the app bundle once the first paint is on screen, so the prerendered content never
//      waits for React (the page is fully readable without JS; hydration adds the motion)
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDir = join(root, 'dist-ssr')
const { render } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href)
const htmlPath = join(dist, 'index.html')
let html = await readFile(htmlPath, 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('dist/index.html is missing the <!--app-html--> marker')
html = html.replace('<!--app-html-->', render())

html = await replaceAsync(html, /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g, async (_, href) => {
  const css = await readFile(join(dist, href), 'utf8')
  return `<style>${css.replace(/<\/style/gi, '<\/style')}</style>`
})

html = html.replace(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/, (_, src) => {
  const boot =
    `let s=0;const go=()=>{if(!s){s=1;import(${JSON.stringify(src)})}};` +
    `try{new PerformanceObserver((l,o)=>{if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();setTimeout(go,30)}}).observe({type:'paint',buffered:true})}catch{}` +
    `setTimeout(go,1500)`
  return `<script type="module">${boot}</script>`
})

await writeFile(htmlPath, html)
await rm(ssrDir, { recursive: true, force: true })
console.log('[prerender] dist/index.html written')

async function replaceAsync(str, re, fn) {
  const parts = []
  let last = 0
  for (const m of str.matchAll(re)) {
    parts.push(str.slice(last, m.index), await fn(...m))
    last = m.index + m[0].length
  }
  parts.push(str.slice(last))
  return parts.join('')
}
