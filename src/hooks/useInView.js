import { useEffect, useRef, useState } from 'react'

const DEFAULTS = {
  threshold: 0.15,
  /** Negative bottom margin so the element fires a little after it appears. */
  rootMargin: '0px 0px -10% 0px',
  /** Fire immediately when already on screen on mount. */
  once: true,
}

/** Mirrors the observer's rootMargin so the fallback agrees with it. */
const FALLBACK_RATIO = 0.9

/**
 * Reveals an element the first time it enters the viewport.
 *
 * Uses a single `IntersectionObserver` per element, then stops observing —
 * so scrolling back up never re-triggers a burst of animation, and
 * fast scrolling never queues a backlog.
 *
 * A rAF-throttled bounding-box check runs alongside the observer as a safety
 * net. If IntersectionObserver is missing, patched, or silently fails, the
 * fallback still reveals the element, so content can never be left stuck at
 * opacity 0.
 *
 * @param {object}  options
 * @param {boolean} options.enabled  set false to skip observation entirely
 * @returns {{ ref, isInView }}
 */
export function useInView({ threshold, rootMargin, once = true, enabled = true } = DEFAULTS) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const node = ref.current

    // Nothing to observe — treat it as already visible so content is
    // never left stuck at opacity 0.
    if (!enabled || !node) {
      setIsInView(true)
      return undefined
    }

    let frame = 0
    const done = once
      ? () => {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onScroll)
        }
      : () => {}

    const reveal = () => setIsInView(true)

    function onScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const rect = node.getBoundingClientRect()
        const visible = rect.top < window.innerHeight * FALLBACK_RATIO && rect.bottom > 0
        if (visible) {
          setIsInView(true)
          if (once) done()
        } else if (!once) {
          setIsInView(false)
        }
      })
    }

    // No IO support: the scroll fallback below becomes the primary mechanism.
    if (typeof IntersectionObserver === 'undefined') {
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (frame) window.cancelAnimationFrame(frame)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal()
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setIsInView(false)
          }
        })
      },
      {
        threshold: threshold ?? DEFAULTS.threshold,
        rootMargin: rootMargin ?? DEFAULTS.rootMargin,
      },
    )

    /* IntersectionObserver is enough on its own. The old extra scroll listener
       (one per element, each reading layout every frame) is only needed when
       IO is missing, which is handled above. */
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [threshold, rootMargin, once, enabled])

  return { ref, isInView }
}