import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** Live read of the user's motion preference. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/**
 * Returns true while the visitor has reduced motion enabled, and keeps
 * up to date if they change the OS setting mid-session.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const list = window.matchMedia(QUERY)
    const onChange = (event) => setReduced(event.matches)

    setReduced(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])

  return reduced
}