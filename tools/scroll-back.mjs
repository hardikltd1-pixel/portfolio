/**
 * Isolates one question: can the page actually be scrolled back up?
 *
 * The wheel-driven check in verify-hero reported a page that would not move when
 * the wheel was reversed. That is either a real defect or an artefact of how
 * synthetic wheel events are delivered, so this tries three independent ways of
 * scrolling up and reports what each one did.
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { decodePng, stats } from './png.mjs'

const URL_ = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:5175/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9335

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=1600,900',
  '--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--no-first-run', '--user-data-dir=' + path.join(process.env.TEMP, 'cdp-scroll-profile'), 'about:blank',
], { stdio: 'ignore' })

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if ((await r.json()).webSocketDebuggerUrl) return
    } catch {}
    await sleep(250)
  }
  throw new Error('no debugger')
}
await endpoint()
const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let id = 0
const pending = new Map()
const events = []
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
  } else if (m.method === 'Runtime.exceptionThrown' || m.method === 'Log.entryAdded') {
    events.push(JSON.stringify(m.params).slice(0, 200))
  }
})
const call = (method, params = {}) => {
  id += 1
  const n = id
  ws.send(JSON.stringify({ id: n, method, params }))
  return new Promise((resolve, reject) => pending.set(n, { resolve, reject }))
}
const ev = async (expression) =>
  (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value

await call('Runtime.enable')
await call('Log.enable')
await call('Page.enable')
await call('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false })
await call('Page.navigate', { url: URL_ })
await sleep(7000)

const y = () => ev('Math.round(window.scrollY)')
const wheel = async (delta, n = 1, gap = 90) => {
  for (let i = 0; i < n; i += 1) {
    await call('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: 800, y: 450, deltaX: 0, deltaY: delta, pointerType: 'mouse',
    })
    await sleep(gap)
  }
  await sleep(900)
}

console.log('start scrollY', await y())

/* ---------------------------------------------------------- 1. wheel down */
await wheel(300, 8)
const down = await y()
console.log(`\n1. wheel down x8      -> scrollY ${down}  ${down > 500 ? 'MOVES' : 'STUCK'}`)

/* ----------------------------------------------------------- 2. wheel up */
await wheel(-300, 8)
const up = await y()
console.log(`2. wheel up x8        -> scrollY ${up}  ${up < down - 200 ? 'MOVES' : 'STUCK'}`)

/* --------------------------------------------- 3. synthesizeScrollGesture */
await call('Input.synthesizeScrollGesture', {
  x: 800, y: 450, xDistance: 0, yDistance: -1200, speed: 1200, gestureSourceType: 'mouse',
})
await sleep(1400)
const gest = await y()
console.log(`3. gesture yDist -1200 -> scrollY ${gest}  ${gest < up - 200 ? 'MOVES' : 'STUCK'}`)

/* --------------------------------------------------- 4. keyboard PageUp x3 */
for (let i = 0; i < 3; i += 1) {
  await call('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 33, key: 'PageUp', code: 'PageUp' })
  await call('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 33, key: 'PageUp', code: 'PageUp' })
  await sleep(500)
}
await sleep(1200)
const key = await y()
console.log(`4. PageUp x3          -> scrollY ${key}  ${key < gest - 200 ? 'MOVES' : 'STUCK'}`)

/* ------------------------------------------ 5. does a scroll listener fire? */
const listen = await ev(`(() => {
  window.__up = 0; window.__down = 0; window.__lastY = window.scrollY
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.__lastY) window.__up++
    else if (window.scrollY > window.__lastY) window.__down++
    window.__lastY = window.scrollY
  }, { passive: true })
  return 'armed'
})()`)
console.log('\n' + listen + ' a scroll counter; now one wheel-up')

await wheel(-300, 3)
console.log(`5. after wheel up: scrollY ${await y()} | scroll events up=${await ev('window.__up')} down=${await ev('window.__down')}`)

/* ------------------------------------------ 6. can the page still be painted? */
const shot = decodePng(Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
const st = stats(shot)
console.log(`6. frame now: mean luminance ${st.meanLum}/255, ${st.litOver8}% lit — ${st.litOver8 > 5 ? 'page is painted' : 'PAGE IS BLANK'}`)
console.log('   documentElement.className =', JSON.stringify(await ev('document.documentElement.className')))
console.log('   body classes              =', JSON.stringify(await ev('document.body.className')))
console.log('   html overflow             =', await ev('getComputedStyle(document.documentElement).overflow'))
console.log('   body overflow             =', await ev('getComputedStyle(document.body).overflow'))
console.log('   scrollHeight/clientHeight =', await ev('document.documentElement.scrollHeight'), '/', await ev('document.documentElement.clientHeight'))

if (events.length) {
  console.log('\npage errors:')
  events.slice(0, 6).forEach((e) => console.log('  ', e))
}

ws.close()
chrome.kill()
process.exit(0)
