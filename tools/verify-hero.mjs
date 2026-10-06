/**
 * Minimal Chrome DevTools Protocol driver (no dependencies — Node 22+ has a
 * global WebSocket). Used to verify the 3D hero in a real browser.
 *
 *   node tools/verify-hero.mjs [url] [--shots]
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { decodePng, stats, ascii } from './png.mjs'

const URL_ = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:5175/'
const SHOTS = process.argv.includes('--shots')
const OUT = path.join(process.cwd(), 'tools', 'shots')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333

if (SHOTS) mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1600,900',
  '--hide-scrollbars',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--no-first-run',
  '--user-data-dir=' + path.join(process.env.TEMP, 'cdp-verify-profile'),
  'about:blank',
], { stdio: 'ignore' })

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const json = await res.json()
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('Chrome did not expose a debugger endpoint')
}

class Session {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      }
    })
  }

  send(method, params = {}) {
    this.id += 1
    const id = this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }

  async shot(name) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(r.data, 'base64')
    if (SHOTS && name) {
      writeFileSync(path.join(OUT, `${name}.png`), buf)
    }
    return decodePng(buf)
  }
}

const wsUrl = await endpoint()
const boot = new WebSocket(wsUrl)
await new Promise((r) => boot.addEventListener('open', r, { once: true }))
/* Find the page target and talk to it directly, so no session routing is needed. */
const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
const pageTarget = list.find((t) => t.type === 'page')
if (!pageTarget) throw new Error('no page target')
boot.close()

const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
const s = new Session(ws)
const call = s.send.bind(s)

const logs = []
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.method === 'Runtime.consoleAPICalled') {
    logs.push({
      type: m.params.type,
      text: m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '),
    })
  }
  if (m.method === 'Runtime.exceptionThrown') {
    logs.push({ type: 'exception', text: m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description ?? '') })
  }
  if (m.method === 'Log.entryAdded') {
    logs.push({ type: m.params.entry.level, text: m.params.entry.text })
  }
})

await call('Runtime.enable')
await call('Log.enable')
await call('Page.enable')
await call('Emulation.setDeviceMetricsOverride', {
  width: 1600, height: 900, deviceScaleFactor: 1, mobile: false,
})

console.log('→ loading', URL_)
await call('Page.navigate', { url: URL_ })
await sleep(6000)

const probe = `(() => {
  const canvas = document.querySelector('.hero__scene canvas')
  const page = document.querySelector('.monitor-screen__page')
  const scene = document.querySelector('.hero__scene')
  const webgl = canvas ? (canvas.getContext('webgl2') ? 'webgl2' : 'none') : 'no-canvas'
  return {
    heroSection: !!document.querySelector('#home'),
    canvas: !!canvas,
    canvasSize: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
    webgl,
    sceneReady: scene ? scene.dataset.ready : null,
    sceneVisible: scene ? scene.dataset.visible : null,
    monitorPage: !!page,
    screenRect: page ? (r => ({ l: +r.left.toFixed(2), t: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }))(page.getBoundingClientRect()) : null,
    innerW: window.innerWidth, innerH: window.innerHeight,
    clientW: document.documentElement.clientWidth, clientH: document.documentElement.clientHeight,
    heroPhase: document.querySelector('#home')?.dataset.phase,
    heroIntro: document.documentElement.dataset.heroIntro,
    scrollY: Math.round(window.scrollY),
    heroH: document.querySelector('#home')?.offsetHeight,
    introP: getComputedStyle(document.querySelector('#home')).getPropertyValue('--intro-p').trim(),
    hasLenis: document.documentElement.classList.contains('has-lenis'),
    sections: [...document.querySelectorAll('main > section')].map(s => s.id),
    title: document.querySelector('#hero-title')?.textContent?.trim().slice(0, 40),
    titleCount: document.querySelectorAll('#hero-title').length,
  }
})()`

console.log('\n=== at rest (scroll 0) ===')
const rest = await call('Runtime.evaluate', { expression: probe, returnByValue: true }).then(r => r.result.value)
console.log(JSON.stringify(rest, null, 2))

/* Is the room actually drawn, and is it lit in the colour it is meant to be? A
   3D scene that fails to render is a black rectangle that passes every DOM
   check, so the pixels have to be looked at too. */
const restShot = await s.shot(SHOTS ? '01-rest' : null)
const st = stats(restShot)
console.log('\n  brightness   mean', st.meanLum, '/255   lit >8:', st.litOver8 + '%', ' >32:', st.litOver32 + '%', ' >96:', st.litOver96 + '%')
console.log('  mean RGB     ', st.meanRGB.join(' / '), st.meanRGB[0] > st.meanRGB[2] ? '(red leads blue: the wall glow is red)' : '(NOT red-led)')
console.log('\n' + ascii(restShot).split('\n').map((l) => '  ' + l).join('\n'))

/* Scroll through the intro with real wheel input, the way a visitor does, so
   Lenis is actually in the loop (window.scrollTo would bypass it). */
const height = await call('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true }).then(r => r.result.value)
console.log('\nscrollHeight', height, '| viewport 900')

async function wheel(times, deltaY = 200) {
  for (let i = 0; i < times; i += 1) {
    await call('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: 800, y: 450, deltaX: 0, deltaY, pointerType: 'mouse',
    })
    await sleep(60)
  }
  await sleep(1500)
}

const marks = [1, 3, 3, 3, 2, 2]
for (const [i, times] of marks.entries()) {
  await wheel(times)
  const out = await call('Runtime.evaluate', { expression: probe, returnByValue: true }).then(r => r.result.value)
  console.log(`\n--- after wheel burst ${i + 1} ---`)
  console.log('  scrollY', out.scrollY, '| intro-p', out.introP, '| phase', out.heroPhase, '| nav', out.heroIntro, '| visible', out.sceneVisible)
  console.log('  screenRect', JSON.stringify(out.screenRect))
  console.log('  titles', out.titleCount)
  if (SHOTS) await s.shot(`0${i + 2}-burst${i + 1}`)
}

/* Scroll back up: the reverse must be exact. */
console.log('\n=== scrolling back up ===')
for (const [i, times] of [[3, 6], [4, 6]].entries()) {
  await wheel(times, -200)
  const out = await call('Runtime.evaluate', { expression: probe, returnByValue: true }).then(r => r.result.value)
  console.log(`  burst ${i + 1}: scrollY ${out.scrollY} | intro-p ${out.introP} | phase ${out.heroPhase} | screenRect ${JSON.stringify(out.screenRect)} | titles ${out.titleCount}`)
}

console.log('\n=== console ===')
const noisy = logs.filter(l => !/Download the React DevTools|Lenis.*debug/i.test(l.text))
if (!noisy.length) console.log('  (clean)')
noisy.forEach(l => console.log(`  [${l.type}] ${l.text.slice(0, 300)}`))

ws.close()
chrome.kill()
process.exit(0)
