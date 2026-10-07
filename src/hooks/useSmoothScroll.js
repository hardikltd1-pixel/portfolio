import { useEffect } from 'react'
import { createSmoothScroll, destroySmoothScroll } from '../lib/lenis'
import { useLiteMode } from '../lib/device'

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
  const lite = useLiteMode()

  useEffect(() => {
    /* Phones scroll natively: the browser's own touch scrolling is already
       smooth, and a JS scroll layer on top of it only adds lag. */
    if (lite) return undefined
    createSmoothScroll()
    return destroySmoothScroll
  }, [lite])
}
