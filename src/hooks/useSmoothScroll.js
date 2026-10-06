import { useEffect } from 'react'
import { createSmoothScroll, destroySmoothScroll } from '../lib/lenis'

/**
 * Starts Lenis for the lifetime of the app.
 *
 * Kept as a hook rather than a side effect at module scope so that React's
 * StrictMode double-mount in development starts and stops it cleanly, and so a
 * future route change can turn it off deliberately.
 *
 * It is a no-op for visitors who prefer reduced motion — `createSmoothScroll`
 * checks that itself and returns null.
 */
export function useSmoothScroll() {
  useEffect(() => {
    createSmoothScroll()
    return destroySmoothScroll
  }, [])
}
