import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

let current = null

/**
 * Returns the actual Lenis instance.
 *
 * Important:
 * `current` also stores the GSAP ticker callback, so never return the
 * wrapper object from here. Components that need to call Lenis methods
 * such as scrollTo() need the actual Lenis instance.
 */
export function getLenis() {
  return current?.lenis ?? null
}

/**
 * Starts smooth scrolling.
 *
 * Safe to call more than once.
 */
export function createSmoothScroll() {
  if (typeof window === 'undefined') return null
  if (current) return current.lenis
  if (prefersReducedMotion()) return null

  // Keep touch scrolling native. Lenis is useful on a mouse/trackpad desktop,
  // but adding a second scroll animation layer on phones makes touch input
  // feel delayed, especially while scroll-linked effects are active.
  if (window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches) {
    return null
  }

  const lenis = new Lenis({
    duration: 0.72,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const tick = (time) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(tick)

  gsap.ticker.lagSmoothing(0)

  const root = document.documentElement
  root.classList.add('has-lenis')

  current = {
    lenis,
    tick,
  }

  return lenis
}

/**
 * Stops smooth scrolling and removes the GSAP ticker callback.
 */
export function destroySmoothScroll() {
  if (!current) return

  gsap.ticker.remove(current.tick)
  current.lenis.destroy()

  current = null

  document.documentElement.classList.remove('has-lenis')
}