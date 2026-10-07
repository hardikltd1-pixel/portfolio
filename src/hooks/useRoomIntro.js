import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'
import { useLiteMode } from '../lib/device'

/**
 * The pinned scroll that zooms the room into the website.
 *
 * PINNING
 *   The hero is a tall section (`100svh` plus `--intro-len`) containing a sticky
 *   `100svh` stage. Native `position: sticky` does the pinning rather than
 *   ScrollTrigger's `pin`, so there is no pin-spacer and no layout jump, and the
 *   whole thing degrades to an ordinary section if this hook never runs.
 *
 * WHAT IT WRITES  (all on <section class="hero">, all transform/opacity only)
 *   --fw --fh --ax --ay    the frame: size and position of the artwork
 *   --ox --oy              zoom anchor, solved so the screen fills the viewport
 *   --zoom-s               scale of the frame, 1 -> --s-end
 *   --mini-k               scale of the copy inside the screen
 *   --mini-dy              keeps the copy at the top of a cropped glass
 *   --intro-p              raw progress 0 -> 1, read by the stylesheet
 *   --vw --vh              viewport box, so the copy lays out like the page
 *   --sw --sh              the monitor glass in unscaled pixels (the drifting
 *                          cursor on the screen is sized from these)
 *
 * NO POINTER PARALLAX
 *   The room used to drift a few pixels with the mouse. The glass was not part
 *   of that drift, so the website slid around on the monitor like a sticker.
 *   The room and the screen are now completely fixed to each other.
 *
 * THE HANDOFF
 *   The copy inside the screen is laid out at viewport size, so at progress 1
 *   it is exactly one viewport wide, tall and centred — the same box
 *   .hero__page occupies. The phase then flips and Hero mounts the page and
 *   removes the copy in one commit: no duplicate id, no second timer.
 *
 * PHONES / TOUCH / NARROW WINDOWS
 *   The zoom is skipped there (see lib/device.js): the monitor is far wider than a
 *   portrait screen, so the glass was cropped and the page looked cut in half,
 *   and re-rasterising the scaled room every frame is what made it crawl. They
 *   get phase 'off' — an ordinary hero section.
 *
 * PERFORMANCE
 *   - Per-frame values are written straight onto the few elements that use
 *     them. They used to be CSS variables on <section class="hero">, which
 *     forces the browser to re-check the style of the whole hero subtree
 *     (typing text, terminal, 20 dust motes...) on every scroll tick.
 *   - While the zoom is moving the frame is promoted to its own GPU layer
 *     (will-change: transform) so scaling it is a texture op. Once scrolling
 *     stops the promotion is dropped so the text re-rasterises crisp.
 *   - Room animations and the video are paused once the room is hidden or the
 *     hero is off screen.
 *
 * PHASES
 *   'off'  reduced motion / phone — the hero is just the hero.
 *   'on'   the monitor owns the content.
 *   'done' the screen has opened and the real page has taken over.
 *
 * TUNING
 *   INTRO.scrub    how tightly the zoom follows the scrollbar (0.8 - 1)
 *   INTRO.length   scroll distance of the zoom, in viewport heights
 *                  — keep in sync with --intro-len in styles/room.css
 *   INTRO.doneAt   progress at which the copy is swapped for the page
 *   ROOM_AR        aspect ratio of public/videos/room.mp4
 *   EDGE           extra scale so the screen always covers the viewport
 *   FIT_MIN        below this fraction of the screen width, the copy is
 *                  fitted by width instead of contained
 */

const INTRO = {
  /** 1 tracks the scrollbar exactly; just under feels heavier. */
  scrub: 1,
  /** Total scroll distance of the intro, in viewport heights. */
  length: 1.35,
  /** Progress at which the copy is swapped for the real page. */
  doneAt: 0.999,
}

/** public/videos/room.mp4 — 1280 × 630. */
const ROOM_AR = 1280 / 630

/** Safety margin on the final scale, so the screen never stops short. */
const EDGE = 1.02

/** Contain the copy only while it stays at least this wide on the glass. */
const FIT_MIN = 0.6

/** Where the room fades out (progress). Mirrors the old CSS custom properties. */
const ROOM_FADE_FROM = 0.55
const ROOM_FADE_TO = 0.92

const CSS_VARS = [
  '--intro-len',
  '--intro-p',
  '--zoom-s',
  '--mini-k',
  '--mini-dy',
  '--fw',
  '--fh',
  '--ax',
  '--ay',
  '--ox',
  '--oy',
  '--vw',
  '--vh',
  '--sw',
  '--sh',
]

export default function useRoomIntro() {
  const reduced = prefersReducedMotion()
  const lite = useLiteMode()
  const off = reduced || lite

  const [phase, setPhase] = useState(off ? 'off' : 'on')
  const sectionRef = useRef(null)

  /* The window can cross the phone / desktop line (rotation, resize). */
  useEffect(() => {
    setPhase(off ? 'off' : 'on')
  }, [off])

  /* Publishes the phase on <html> so the stylesheet owns the navbar handover
     without React re-rendering anything. */
  useEffect(() => {
    const root = document.documentElement
    root.dataset.heroIntro = phase === 'on' ? 'playing' : phase
    return () => {
      delete root.dataset.heroIntro
    }
  }, [phase])

  useLayoutEffect(() => {
    if (off) return undefined

    const section = sectionRef.current
    if (!section) return undefined

    const stage = section.querySelector('.hero__stage')
    const frame = section.querySelector('.hero__frame')
    const screen = section.querySelector('.hero__screen')
    if (!stage || !frame || !screen) return undefined

    /* Elements whose style is written every frame. Some of them are mounted
       and unmounted by the handoff, so they are looked up lazily. */
    const cache = {}
    const find = (key, selector) => {
      const node = cache[key]
      if (node && node.isConnected) return node
      cache[key] = section.querySelector(selector)
      return cache[key]
    }
    const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)
    const video = frame.querySelector('video')
    const PLAYING = { room: true, visible: true }
    let settleTimer = 0

    /* One source of truth for the scroll distance. */
    section.style.setProperty('--intro-len', `${INTRO.length * 100}svh`)

    let layout = null
    let progress = 0
    let done = false

    const set = (name, value) => section.style.setProperty(name, value)

    /* ------------------------------------------------------------- layout
       Sizes the frame to cover the stage while keeping the whole monitor
       glass on screen, and solves the anchor the zoom grows from. */
    const measure = () => {
      const vw = stage.clientWidth
      const vh = stage.clientHeight
      if (!vw || !vh) return false

      const fw = Math.max(vw, vh * ROOM_AR)
      const fh = fw / ROOM_AR
      set('--fw', `${fw.toFixed(1)}px`)
      set('--fh', `${fh.toFixed(1)}px`)

      /* Rect deltas rather than offsetLeft / offsetWidth: those are rounded
         to whole pixels, which leaves a visible seam at the handoff. A
         refresh can run mid-zoom, so the frame is measured at rest first —
         the reset and the reads happen inside one task, so nothing paints. */
      const zoomed = frame.style.transform
      frame.style.transform = 'scale(1)'
      const frameBox = frame.getBoundingClientRect()
      const glassBox = screen.getBoundingClientRect()
      frame.style.transform = zoomed

      /* Frame-relative: the anchor maths below works in the frame's own box. */
      const sl = glassBox.left - frameBox.left
      const st = glassBox.top - frameBox.top
      const sw = glassBox.width
      const sh = glassBox.height

      /* Centred, unless that would push part of the glass off the viewport —
         on a tall phone the artwork is much wider than the screen, so the
         frame slides over until the monitor is fully visible. */
      const ax = Math.min(
        Math.max(vw / 2 - fw / 2, Math.max(vw - fw, -sl)),
        Math.min(0, vw - sl - sw),
      )
      const ay = Math.min(
        Math.max(vh / 2 - fh / 2, Math.max(vh - fh, -st)),
        Math.min(0, vh - st - sh),
      )

      /* Small enough that the glass covers the viewport when it lands. */
      const sEnd = Math.max(vw / sw, vh / sh) * EDGE

      const scx = sl + sw / 2
      const scy = st + sh / 2

      /* Contain the whole page on the glass, unless it would be unreadably
         narrow — then fill the glass instead and let it crop. */
      let k0 = Math.min(sw / vw, sh / vh)
      if (k0 * vw < FIT_MIN * sw) k0 = sw / vw

      layout = {
        vw,
        vh,
        sh,
        sEnd,
        k0,
        /* Anchor chosen so the centre of the glass ends on the centre of the
           viewport at scale sEnd. */
        ox: (ax + sEnd * scx - vw / 2) / (sEnd - 1),
        oy: (ay + sEnd * scy - vh / 2) / (sEnd - 1),
      }

      set('--ax', `${ax.toFixed(1)}px`)
      set('--ay', `${ay.toFixed(1)}px`)
      set('--ox', `${layout.ox.toFixed(1)}px`)
      set('--oy', `${layout.oy.toFixed(1)}px`)
      set('--vw', `${vw}px`)
      set('--vh', `${vh}px`)
      /* Unscaled glass size (layout pixels, not affected by the zoom). */
      set('--sw', `${screen.offsetWidth}px`)
      set('--sh', `${screen.offsetHeight}px`)
      return true
    }

    /* ------------------------------------------------------------ progress */
    const apply = (value) => {
      progress = value
      if (!layout) return

      const scale = 1 + value * (layout.sEnd - 1)
      /* Apparent size of the copy inside the glass, before the glass scales. */
      const fit = layout.k0 + value * (1 - layout.k0)

      const roomA = 1 - clamp01((value - ROOM_FADE_FROM) / (ROOM_FADE_TO - ROOM_FADE_FROM))
      const dy = Math.max(0, layout.vh * fit - layout.sh * scale) / (2 * scale)

      /* Promote while moving, demote once scrolling has stopped (crisp text). */
      frame.style.willChange = 'transform'
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        frame.style.willChange = ''
      }, 160)

      frame.style.transform = `scale(${scale.toFixed(4)})`

      const room = find('room', '.hero__room')
      if (room) {
        room.style.opacity = roomA.toFixed(3)
        room.style.visibility = roomA <= 0.001 ? 'hidden' : ''
      }
      PLAYING.room = roomA > 0.001
      syncMedia()

      const glass = find('glass', '.hero__glass')
      if (glass) glass.style.opacity = (1 - clamp01(value * 1.6)).toFixed(3)
      const cursor = find('cursor', '.hero__cursor-wrap')
      if (cursor) cursor.style.opacity = (1 - clamp01(value * 8)).toFixed(3)
      const hint = find('hint', '.hero__hint')
      if (hint) hint.style.opacity = (1 - clamp01(value * 14)).toFixed(3)
      const navEcho = find('navEcho', '.screen-nav')
      if (navEcho) navEcho.style.opacity = clamp01((0.94 - value) * 6.25).toFixed(3)

      /* Scale of the copy inside the screen, kept at the top of a cropped glass. */
      const mini = find('mini', '.hero__mini')
      if (mini) {
        mini.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${dy.toFixed(1)}px, 0) scale(${(fit / scale).toFixed(5)})`
      }

      const nowDone = value >= INTRO.doneAt
      if (nowDone !== done) {
        done = nowDone
        setPhase(done ? 'done' : 'on')
      }
    }

    /* Pause the video and every looping room animation while nobody can see
       them: the room has faded out, or the hero has scrolled away. */
    function syncMedia() {
      const run = PLAYING.room && PLAYING.visible
      section.dataset.live = run ? 'true' : 'false'
      if (!video) return
      if (run && video.paused) video.play()?.catch(() => {})
      else if (!run && !video.paused) video.pause()
    }

    const visibility = new IntersectionObserver(([entry]) => {
      PLAYING.visible = entry.isIntersecting
      syncMedia()
    })
    visibility.observe(section)

    measure()
    apply(0)

    /* --------------------------------------------------------------- scroll
       A proxy tween scrubbed by ScrollTrigger: `onUpdate` fires on every tick
       of the scrub, so the CSS is driven by the value that is actually on
       screen rather than by the scrollbar. */
    const proxy = { p: 0 }
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      onUpdate: () => apply(proxy.p),
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: INTRO.scrub,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure()
          apply(proxy.p)
        },
      },
    })

    /* ------------------------------------------------------------- resize */
    const observer = new ResizeObserver(() => {
      if (measure()) apply(progress)
    })
    observer.observe(stage)

    /* Web fonts land after first paint and change every section height. */
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
      observer.disconnect()
      visibility.disconnect()
      window.clearTimeout(settleTimer)
      tween.scrollTrigger?.kill()
      tween.kill()
      CSS_VARS.forEach((name) => section.style.removeProperty(name))
      frame.style.transform = ''
      frame.style.willChange = ''
      delete section.dataset.live
      ;['room', 'glass', 'cursor', 'hint', 'navEcho', 'mini'].forEach((key) => {
        const node = cache[key]
        if (node) {
          node.style.opacity = ''
          node.style.visibility = ''
          node.style.transform = ''
        }
      })
    }
  }, [off])

  return { phase, sectionRef }
}