import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Marks the document as GSAP-driven.
 *
 * `.reveal` has a CSS-transition fallback that runs when JavaScript or the
 * observer is unavailable. Once ScrollTrigger owns the elements this class
 * removes that transition, so the two systems never fight over opacity.
 */
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('has-gsap')
}

export { gsap, ScrollTrigger }

/** Shared tuning — change these to adjust the feel of the whole site. */
export const SCROLL_FX = {
  /**
   * How long ScrollTrigger takes to catch up with the scrollbar.
   * 0.8–1 feels heavy and deliberate; below ~0.5 it starts to feel loose.
   */
  scrub: 0.45,
  /** Distance a piece of content travels while revealing. */
  distance: 44,
  /** Extra distance per 1ms of stagger delay, so siblings cascade. */
  staggerPx: 0.34,
  /** Viewport fraction where a reveal starts / finishes. */
  startAt: 0.86,
  endAt: 0.52,
}