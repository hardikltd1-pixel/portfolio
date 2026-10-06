import { useEffect, useLayoutEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { profile } from '../config/profile'
import { isPlaceholder } from '../lib/links'

/** Intro length in ms. Keep it short — it should feel like a breath, not a wait. */
const HOLD_MS = 620
/** Must match the opacity transition on .loader so we unmount as it finishes. */
const FADE_MS = 380

/**
 * Short page-load intro.
 *
 * A thin accent bar sweeps across the monogram, then the overlay fades away and
 * this component unmounts itself so it can never intercept clicks. The
 * `intro-active` class on <html> delays the hero's staggered entrance just
 * enough that it lands after the overlay clears.
 *
 * If JavaScript is unavailable the overlay never renders at all, so the hero
 * animates immediately — there is no way for this to hide the page.
 */
export default function PageLoader() {
  const reduced = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  const [done, setDone] = useState(false)

  /* Arm the delayed hero entrance before first paint. */
  useLayoutEffect(() => {
    if (reduced) return undefined
    const root = document.documentElement
    root.classList.add('intro-active')
    return () => root.classList.remove('intro-active')
  }, [reduced])

  useEffect(() => {
    if (reduced) return undefined
    const root = document.documentElement

    const beginLeaving = window.setTimeout(() => setLeaving(true), HOLD_MS)
    /* Unconditional failsafe: never let the overlay outlive the intro, even if
       the timers above are throttled in a background tab. */
    const finish = window.setTimeout(() => {
      root.classList.remove('intro-active')
      setDone(true)
    }, HOLD_MS + FADE_MS + 60)

    return () => {
      window.clearTimeout(beginLeaving)
      window.clearTimeout(finish)
    }
  }, [reduced])

  if (reduced || done) return null

  const mark = isPlaceholder(profile.shortName) ? '>_' : null

  return (
    <div className="loader" data-leaving={leaving} aria-hidden="true">
      <div className="loader__inner">
        <span className="loader__mark">
          {mark ?? (
            profile.shortName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0].toUpperCase())
              .join('')
          )}
        </span>
        <span className="loader__bar">
          <span className="loader__bar-fill" />
        </span>
      </div>
    </div>
  )
}