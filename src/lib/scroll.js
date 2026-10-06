import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { getLenis } from './lenis'

/**
 * Height of the sticky header, used to offset scroll targets.
 */
export const NAV_OFFSET = 84

/**
 * Smoothly scrolls to a section.
 *
 * Uses Lenis when available, otherwise falls back to native scrolling.
 *
 * This function is used by:
 * - Navbar links
 * - View My Work
 * - Skip introduction
 * - Back to top
 */
export function scrollToSection(id) {
  if (typeof window === 'undefined') return

  const target = document.getElementById(id)

  if (!target) {
    console.warn(`scrollToSection: section "#${id}" was not found.`)
    return
  }

  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    NAV_OFFSET

  const y = Math.max(top, 0)

  const lenis = getLenis()

  /**
   * Lenis smooth scrolling.
   */
  if (lenis) {
    lenis.scrollTo(y, {
      duration: 1.15,
      immediate: false,
    })

    return
  }

  /**
   * Native fallback.
   */
  window.scrollTo({
    top: y,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
}

/**
 * Reads the current vertical scroll progress of the document.
 * Returns a value from 0 → 1.
 */
export function getScrollProgress() {
  if (typeof window === 'undefined') return 0

  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight

  if (scrollable <= 0) return 0

  return Math.min(
    Math.max(window.scrollY / scrollable, 0),
    1,
  )
}