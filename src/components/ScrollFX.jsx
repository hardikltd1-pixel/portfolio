import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger, SCROLL_FX } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Page-level scroll-linked animation.
 *
 * Every tween here is *scrubbed* — progress is bound to scroll position rather
 * than to a clock — so the page opens as you scroll down and closes again as
 * you scroll up. Only `transform` and `opacity` are animated, so nothing here
 * triggers layout and the page stays on the compositor.
 *
 * The hero is NOT handled here. It is a sticky stage owned end-to-end by
 * useDesktopIntro(), including its exit, so no two systems write to the same
 * element's transform.
 *
 * TUNING
 *   SCROLL_FX.scrub      how tightly the animation follows the scrollbar
 *   the numbers below    travel distances, in px
 *
 * Reduced-motion visitors get none of this: the hook bails out and every
 * element simply renders in its final state.
 */
export default function ScrollFX() {
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const touch = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches
    if (reduced || touch) return undefined

    const teardown = []

    /** Creates a scrubbed tween and registers its cleanup. */
    const scrub = (target, vars, trigger, start, end) => {
      if (!target) return
      const tween = gsap.fromTo(
        target,
        vars.from,
        {
          ...vars.to,
          ease: 'none',
          overwrite: 'auto',
          scrollTrigger: {
            trigger,
            start,
            end,
            scrub: SCROLL_FX.scrub,
            invalidateOnRefresh: true,
          },
        },
      )
      teardown.push(() => {
        tween.scrollTrigger?.kill()
        tween.kill()
      })
    }

    /* Web fonts land after first paint and change section heights, which
       invalidates every cached start/end position. */
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    /* ----------------------------------------------------- 1. the project
       Rises 80px and fades up. Flat — no rotateX, no perspective. */
    const projectCard = document.querySelector('.project__card')
    if (projectCard) {
      scrub(
        projectCard,
        { from: { y: 80, opacity: 0.2 }, to: { y: 0, opacity: 1 } },
        projectCard,
        'top 92%',
        'center 62%',
      )
    }

    /* ---------------------------------------------------- 2. the timeline
       The vertical line draws itself as the section scrolls past. */
    const railFill = document.querySelector('.journey__rail-fill')
    const rail = document.querySelector('.journey__rail')
    if (railFill && rail) {
      scrub(railFill, { from: { scaleY: 0 }, to: { scaleY: 1 } }, rail, 'top 78%', 'bottom 62%')
    }

    /* ------------------------------------------------ 3. skill level bars
       Width is driven by the `focus` value in config/profile.js. */
    document.querySelectorAll('[data-meter-fill]').forEach((fill) => {
      const target = Number(fill.dataset.meterFill) || 0
      if (target <= 0) return
      scrub(
        fill,
        { from: { scaleX: 0 }, to: { scaleX: target } },
        fill.closest('.skill') || fill,
        'top 88%',
        'top 62%',
      )
    })

    /* ----------------------------------------------------- 4. the contact
       Fades up only. The old looping float tween wrote an inline `y` that
       overwrote the card's CSS hover lift, so it is gone — the card now
       responds cleanly to the pointer. */
    const contactCard = document.querySelector('.contact__card')
    if (contactCard) {
      scrub(
        contactCard,
        { from: { y: 70, opacity: 0.2 }, to: { y: 0, opacity: 1 } },
        contactCard,
        'top 90%',
        'center 70%',
      )
    }

    /* ------------------------------------------------ 5. section parallax
       Optional: any element tagged data-parallax drifts at its own rate. */
    document.querySelectorAll('[data-parallax]').forEach((node) => {
      const amount = Number(node.dataset.parallax) || 40
      scrub(
        node,
        { from: { y: amount }, to: { y: -amount } },
        node.closest('section') || node,
        'top bottom',
        'bottom top',
      )
    })

    /* Safety net. ScrollTrigger sets an inline opacity on every element it
       owns, so any `.reveal` still without one was never picked up. If that
       ever happens the content would sit at opacity 0 forever — this makes
       sure it cannot. */
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((node) => {
        if (!node.style.opacity) {
          gsap.set(node, { opacity: 1, x: 0, y: 0, scale: 1 })
        }
      })
    }, 2500)

    return () => {
      window.clearTimeout(failsafe)
      teardown.forEach((fn) => fn())
    }
  }, [reduced])

  return null
}