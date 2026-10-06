import { useRef, useState } from 'react'
import HeroContent from './HeroContent'
import useRoomIntro from '../hooks/useRoomIntro'
import { scrollToSection } from '../lib/scroll'
import { getLenis } from '../lib/lenis'

/**
 * Hero — the room, the monitor, and the zoom into the site.
 *
 * LAYOUT
 *   <section class="hero">        tall: 100svh + --intro-len, creates the travel
 *     <div class="hero__stage">   sticky, 100svh, clips everything
 *       <div class="hero__frame"> the artwork and the monitor glass, one box
 *         <div class="hero__room">      video + sunlight + dust + glow
 *         <div class="hero__screen">    the monitor: a viewport-sized page,
 *                                       scaled down, with glass effects on top
 *       <div class="hero__real">   the same content, once it is open
 *       <div class="hero__hint">   "scroll to enter"
 *
 * ONE COPY OF THE CONTENT
 *   HeroContent is rendered inside the monitor while the intro plays, and as
 *   the page once it is open. Never both: the copy on the glass is removed in
 *   the same commit that mounts the page, so there is one set of ids and one
 *   set of timers in the document.
 *
 * THE SCREEN FEELS LIKE A DISPLAY
 *   - The room never moves with the mouse (no parallax), so the screen stays
 *     welded to the artwork.
 *   - Glass layers on top of the page: warm tint, scanlines, inner vignette, a
 *     reflection that slides a little with the mouse, and a faint flicker.
 *   - The screen "boots" once on load.
 *   - A small cursor drifts over the screen and hovers over the first button.
 *   - Hovering the monitor lights up the room; clicking or tapping it opens
 *     the site.
 */

/* Twenty motes, positions fixed so nothing re-randomises between renders. */
const DUST = Array.from({ length: 20 }, (_, index) => {
  const a = (((index * 47) % 100) + 0.5) / 100
  const b = (((index * 29 + 13) % 100) + 0.5) / 100
  const c = (((index * 61 + 7) % 100) + 0.5) / 100

  return {
    left: `${(6 + a * 86).toFixed(1)}%`,
    top: `${(14 + b * 72).toFixed(1)}%`,
    '--size': `${(2 + c * 3).toFixed(1)}px`,
    '--dur': `${(19 + c * 24).toFixed(1)}s`,
    '--delay': `${(-c * 34).toFixed(1)}s`,
    '--alpha': `${(0.32 + a * 0.5).toFixed(2)}`,
    '--drift': `${((b - 0.5) * 52).toFixed(0)}px`,
  }
})

export default function Hero() {
  const { phase, sectionRef } = useRoomIntro()
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)

  const frameRef = useRef(null)
  const screenRef = useRef(null)
  const frameJob = useRef(0)

  const introOff = phase === 'off'
  const open = introOff || phase === 'done'

  /* ------------------------------------------------------------ enter
     Scrolls to the exact end of the intro, where the screen fills the
     viewport. Uses Lenis when it is running so the page is not fought. */
  const enterSite = () => {
    const section = sectionRef.current
    if (!section) return

    const end =
      section.getBoundingClientRect().top +
      window.scrollY +
      section.offsetHeight -
      window.innerHeight +
      1

    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(end, { duration: 2.4 })
    } else {
      window.scrollTo({ top: end, behavior: 'smooth' })
    }
  }

  /* ------------------------------------------------- mouse over the glass
     Writes two CSS variables (--gx / --gy) that slide the reflection, and a
     data attribute that lights the room. No React state, one write per frame. */
  const onPointerEnter = (event) => {
    if (event.pointerType !== 'mouse') return
    if (frameRef.current) frameRef.current.dataset.hover = 'true'
  }

  const onPointerLeave = () => {
    const frame = frameRef.current
    if (!frame) return
    frame.dataset.hover = 'false'
    frame.style.setProperty('--gx', '0px')
    frame.style.setProperty('--gy', '0px')
  }

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse' || frameJob.current) return
    const { clientX, clientY } = event

    frameJob.current = window.requestAnimationFrame(() => {
      frameJob.current = 0
      const frame = frameRef.current
      const screen = screenRef.current
      if (!frame || !screen) return

      const box = screen.getBoundingClientRect()
      if (!box.width || !box.height) return

      const nx = (clientX - box.left) / box.width - 0.5
      const ny = (clientY - box.top) / box.height - 0.5
      frame.style.setProperty('--gx', `${(nx * 70).toFixed(1)}px`)
      frame.style.setProperty('--gy', `${(ny * 36).toFixed(1)}px`)
    })
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero"
      data-intro={introOff ? 'off' : 'on'}
      data-phase={phase}
      aria-labelledby="hero-title"
    >
      <div className="hero__stage">
        {!introOff && (
          <div ref={frameRef} className="hero__frame" data-loaded={loaded} data-hover="false">
            <div className="hero__room">
              <picture>
                <source srcSet="/images/room.webp" type="image/webp" />
                <img
                  src="/images/room.png"
                  alt=""
                  width="1264"
                  height="843"
                  decoding="async"
                  onLoad={() => setLoaded(true)}
                />
              </picture>

              {/* The animated room. The picture above is the poster layer, so
                  the artwork is on screen from the first paint and the video
                  cross-fades over it once it has a frame to show. */}
              <video
                className="hero__video"
                src="/videos/room.mp4"
                poster="/images/room.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
                data-ready={ready}
                onCanPlay={() => setReady(true)}
                onPlaying={() => setReady(true)}
                onError={() => setReady(false)}
              />

              {/* Sunlight through a window, drifting across the wall. */}
              <span className="hero__ray hero__ray--a" aria-hidden="true">
                <span className="hero__ray-inner" />
              </span>
              <span className="hero__ray hero__ray--b" aria-hidden="true">
                <span className="hero__ray-inner" />
              </span>

              {DUST.map((style, index) => (
                <span key={index} className="hero__dust" style={style} aria-hidden="true" />
              ))}

              <span className="hero__glow" aria-hidden="true" />
              {/* Light the screen throws onto the desk; brightens on hover. */}
              <span className="hero__spill" aria-hidden="true" />
              <span className="hero__vignette" aria-hidden="true" />
            </div>

            <div ref={screenRef} className="hero__screen">
              {/* inert: this copy is a picture of the site, not the site. The
                  real one takes over once the screen has opened. It is
                  removed (not hidden) when the page mounts, so only one copy
                  of the content ever exists in the document. */}
              <div className="hero__mini" inert="">
                <div className="hero__mini-page">{!open && <HeroContent />}</div>
              </div>

              {/* Everything below is glass: it sits on top of the page and
                  fades out as the zoom closes in. */}
              <div className="hero__glass" aria-hidden="true">
                <span className="hero__glass-tint" />
                <span className="hero__glass-scan" />
                <span className="hero__glass-vig" />
                <span className="hero__glass-glare" />
                <span className="hero__glass-flicker" />
              </div>

              {/* A tiny cursor wandering over the screen. */}
              <div className="hero__cursor-wrap" aria-hidden="true">
                <svg className="hero__cursor" viewBox="0 0 12 18" width="9" height="14">
                  <path
                    d="M1 1v14l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3H12z"
                    fill="#fff"
                    stroke="#1b1b22"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Power-on: black screen, a white line, then the picture. */}
              <div className="hero__boot" aria-hidden="true">
                <span className="hero__boot-line" />
              </div>

              {!open && (
                <button
                  type="button"
                  className="hero__screen-hit"
                  aria-label="Open the website"
                  onClick={enterSite}
                  onPointerEnter={onPointerEnter}
                  onPointerLeave={onPointerLeave}
                  onPointerMove={onPointerMove}
                />
              )}
            </div>
          </div>
        )}

        {open && (
          <div className="hero__real">
            <div className="hero__page">
              <HeroContent />
            </div>
          </div>
        )}

        {!open && (
          <div className="hero__hint" aria-hidden="true">
            <span className="hero__hint-label mono">scroll to enter</span>
            <span className="hero__hint-arrow">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" strokeWidth="1.6">
                <path
                  d="M12 4v15M5 13l7 7 7-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Keyboard / screen-reader way past the intro. */}
      <a
        className="hero__skip"
        href="#about"
        onClick={(event) => {
          event.preventDefault()
          scrollToSection('about')
        }}
      >
        Skip introduction
      </a>
    </section>
  )
}
