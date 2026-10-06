/**
 * Proves the monitor-to-page handoff is invisible, by comparing the pixels.
 *
 * drei draws the website on a DOM layer floating in the 3D scene; when the
 * camera arrives, the real page replaces it. "Pixel-identical" is the only way to
 * know that swap cannot be seen, so: stop one step short of the swap, shoot,
 * let the swap happen, shoot, and diff.
 *
 *   node tools/handoff-diff.mjs [url]
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { decodePng, ascii, downsample, meanDiff } from './png.mjs'

const URL_ = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:5175/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334

/* ------------------------------------------------------------------- driving */
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=1600,900',
  '--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--no-first-run', '--user-data-dir=' + path.join(process.env.TEMP, 'cdp-diff-profile'), 'about:blank',
], { stdio: 'ignore' })

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const j = await r.json()
      if (j.webSocketDebuggerUrl) return j
    } catch {}
    await sleep(250)
  }
  throw new Error('no debugger')
}
await endpoint()
const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
const target = list.find((t) => t.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
  }
})
const call = (method, params = {}) => {
  id += 1
  const n = id
  ws.send(JSON.stringify({ id: n, method, params }))
  return new Promise((resolve, reject) => pending.set(n, { resolve, reject }))
}
const evaluate = async (expression) =>
  (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value
const shoot = async () =>
  decodePng(Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'))

await call('Runtime.enable')
await call('Page.enable')
await call('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false })
await call('Page.navigate', { url: URL_ })
await sleep(7000)

const state = () => evaluate(`(() => {
  const page = document.querySelector('.monitor-screen__page')
  const hero = document.querySelector('#home')
  /* Measure whichever copy is on screen, wherever it currently lives. */
  const target = page && hero.dataset.phase !== 'done' ? page : document.querySelector('.hero__real')
  const box = (sel) => {
    const el = target?.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2))
  }
  return {
    scrollY: Math.round(window.scrollY),
    p: parseFloat(getComputedStyle(hero).getPropertyValue('--intro-p')) || 0,
    phase: hero.dataset.phase,
    monitorPage: !!page,
    rect: page ? (r => ({ l: +r.left.toFixed(2), t: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }))(page.getBoundingClientRect()) : null,
    titles: document.querySelectorAll('#hero-title').length,
    roles: document.querySelector('.hero__roles')?.textContent?.trim() ?? null,
    boxes: {
      title: box('.hero__title'),
      roles: box('.hero__roles'),
      body: box('.hero__body'),
      terminal: box('.hero__terminal'),
      status: box('.hero__status'),
      inner: box('.hero__inner'),
    },
  }
})()`)

async function scrollTo(targetY, tries = 14) {
  for (let i = 0; i < tries; i += 1) {
    const y = await evaluate('Math.round(window.scrollY)')
    const delta = targetY - y
    if (Math.abs(delta) < 2) break
    await call('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: 800, y: 450, deltaX: 0,
      deltaY: Math.max(-900, Math.min(900, delta)), pointerType: 'mouse',
    })
    await sleep(420)
  }
  await sleep(900)
}

console.log('state at rest:', JSON.stringify(await state()))

/* The intro ends when the sticky stage reaches the bottom of the hero: hero is
   2115px tall (100svh + 135svh), so the stage is pinned exactly while
   scrollY <= 2115 - 900 = 1215. Past that it slides up, and anything measured
   after 1215 says more about the sticky box than about the handoff. */
const END = 1215
const BEFORE = 1180

await scrollTo(BEFORE)
const before = await state()
console.log('\nframe A (preview, just short of the swap):')
console.log('  ', JSON.stringify(before))
const imgA = await shoot()

/* Nudge down in small steps and shoot the instant the page takes over, which is
   what a visitor scrolling at an ordinary speed would see. Going further would
   start moving the sticky stage and measure that instead. */
console.log('\nscrolling the last of the intro...')
let after = null
for (let i = 0; i < 40 && !after; i += 1) {
  await call('Input.dispatchMouseEvent', {
    type: 'mouseWheel', x: 800, y: 450, deltaX: 0, deltaY: 25, pointerType: 'mouse',
  })
  await sleep(70)
  const now = await state()
  if (now.phase === 'done' || now.scrollY > END) after = now
}
await sleep(90)
after = await state()
console.log('\nframe B (real page, the moment it took over):')
console.log('  ', JSON.stringify(after))
const imgB = await shoot()

console.log('\nbox deltas, preview -> page (px; y is the one that matters):')
for (const key of Object.keys(before.boxes)) {
  const a = before.boxes[key]
  const b = after.boxes[key]
  if (!a || !b) { console.log(`    ${key.padEnd(9)} missing (${a ? 'preview' : 'page'})`); continue }
  const d = b.map((v, i) => +(v - a[i]).toFixed(2))
  console.log(`    ${key.padEnd(9)} dx ${String(d[0]).padStart(7)}  dy ${String(d[1]).padStart(7)}  dw ${String(d[2]).padStart(7)}  dh ${String(d[3]).padStart(7)}`)
}

/* ---------------------------------------------------------------- the diff */
console.log('\n=== pixel diff A -> B ===')
if (imgA.w !== imgB.w || imgA.h !== imgB.h) throw new Error('size mismatch')

let sum = 0
let max = 0
let over8 = 0
const COLS = 8
const ROWS = 6
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0))
const counts = Array.from({ length: ROWS }, () => new Array(COLS).fill(0))

for (let y = 0; y < imgA.h; y += 1) {
  for (let x = 0; x < imgA.w; x += 1) {
    const i = y * imgA.w * imgA.bpp + x * imgA.bpp
    const d =
      Math.abs(imgA.data[i] - imgB.data[i]) +
      Math.abs(imgA.data[i + 1] - imgB.data[i + 1]) +
      Math.abs(imgA.data[i + 2] - imgB.data[i + 2])
    sum += d / 3
    if (d / 3 > max) max = d / 3
    if (d / 3 > 8) over8 += 1
    const gy = Math.min(ROWS - 1, Math.floor((y / imgA.h) * ROWS))
    const gx = Math.min(COLS - 1, Math.floor((x / imgA.w) * COLS))
    grid[gy][gx] += d / 3
    counts[gy][gx] += 1
  }
}

const px = imgA.w * imgA.h
console.log('  mean |diff| over whole frame :', (sum / px).toFixed(3), '/ 255')
console.log('  worst pixel                  :', max.toFixed(1))
console.log('  pixels differing by >8/255   :', over8, `(${(100 * over8 / px).toFixed(3)}%)`)

console.log('\n  mean |diff| per eighth of the frame (rows top->bottom):')
for (let gy = 0; gy < ROWS; gy += 1) {
  const row = grid[gy].map((v, gx) => (v / counts[gy][gx]).toFixed(1).padStart(6)).join(' ')
  console.log(`    y${gy} ${row}`)
}

/* Where the difference actually is: a coarse map of the affected cells. */
console.log('\n  where the difference is (share of cells over 8/255, 64x36):')
let anyDiff = false
for (let gy = 0; gy < 36; gy += 1) {
  let line = '    '
  for (let gx = 0; gx < 64; gx += 1) {
    let hits = 0
    let total = 0
    const x0 = Math.floor((gx / 64) * imgA.w)
    const x1 = Math.floor(((gx + 1) / 64) * imgA.w)
    const y0 = Math.floor((gy / 36) * imgA.h)
    const y1 = Math.floor(((gy + 1) / 36) * imgA.h)
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const i = y * imgA.w * imgA.bpp + x * imgA.bpp
        const d = (Math.abs(imgA.data[i] - imgB.data[i]) +
          Math.abs(imgA.data[i + 1] - imgB.data[i + 1]) +
          Math.abs(imgA.data[i + 2] - imgB.data[i + 2])) / 3
        total += 1
        if (d > 8) hits += 1
      }
    }
    const frac = total ? hits / total : 0
    if (frac > 0.05) anyDiff = true
    line += frac > 0.5 ? '#' : frac > 0.25 ? '+' : frac > 0.05 ? '.' : ' '
  }
  console.log(line)
}
if (!anyDiff) console.log('    (no cell over 5%)')

console.log('\n  averaged into blocks, which is roughly what the eye resolves:')
for (const factor of [2, 4, 8]) {
  const { mean, worst } = meanDiff(downsample(imgA, factor), downsample(imgB, factor))
  const w = Math.floor(imgA.w / factor)
  console.log(`    ${String(w + 'x' + Math.floor(imgA.h / factor)).padEnd(9)} mean ${mean.toFixed(2)}/255   worst block ${worst.toFixed(1)}`)
}

console.log('\n  frame A brightness (60x22):\n' + ascii(imgA))
console.log('\n  frame B brightness (60x22):\n' + ascii(imgB))
ws.close()
chrome.kill()
process.exit(0)
