import { useLayoutEffect, useRef } from 'react'
import { gsap, SCROLL_FX } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

/** How far each reveal variant travels before it lands. */
const DISTANCE = {
  up: SCROLL_FX.distance,
  left: 58,
  right: 58,
  scale: 0.92,
  zoom: 0.88,
  fade: 0,
}

/**
 * Reversible scroll reveal for a single element.
 *
 * The animation is *scrubbed*: its progress is bound directly to scroll
 * position, so scrolling back up plays it in reverse and the element
 * disappears again. Nothing is time-based, which is what keeps it on the
 * compositor (only `transform` and `opacity` are touched).
 *
 * The `delay` prop still works: it is converted into extra scroll distance so
 * siblings cascade one after another instead of all landing together.
 *
 * @param {object} ref      element ref to animate
 * @param {string} variant  'up' | 'left' | 'right' | 'scale' | 'zoom' | 'fade'
 * @param {number} delay    stagger delay in ms
 */
export function useScrollReveal(ref, { variant = 'up', delay = 0 } = {}) {
  const reduced = useReducedMotion()
  const keepRef = useRef({ variant, delay })
  keepRef.current = { variant, delay }

  useLayoutEffect(() => {
    const node = ref.current
    const touch = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches
    if (!node || reduced) return undefined

    const { variant: v, delay: d } = keepRef.current
    const distance = DISTANCE[v] ?? DISTANCE.up

    /* Starting state per variant — opacity is always animated from 0. */
    const from = { opacity: 0 }
    if (v === 'left') from.x = -distance
    else if (v === 'right') from.x = distance
    else if (v === 'scale' || v === 'zoom') from.scale = distance
    else if (v !== 'fade') from.y = distance

    const tween = gsap.fromTo(
      node,
      from,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        // Linear: progress maps directly onto scroll position.
        ease: 'none',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: node,
          /* Later `delay` values push the trigger further down the viewport,
             which staggers the cascade. */
          start: () =>
            `top ${window.innerHeight * SCROLL_FX.startAt - d * SCROLL_FX.staggerPx}px`,
          end: () => `top ${window.innerHeight * SCROLL_FX.endAt}px`,
          scrub: touch ? 0.16 : SCROLL_FX.scrub,
          invalidateOnRefresh: true,
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reduced])
}