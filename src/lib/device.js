import { useSyncExternalStore } from 'react'

/**
 * "Lite" devices: phones, tablets, touch laptops and any narrow window.
 *
 * The pinned room-zoom intro, the scrubbed scroll animations and the Lenis
 * smooth-scroll layer are built for a big window with a mouse. On a phone they
 * fight the browser's own (already very smooth) touch scrolling, and the
 * monitor in the picture is far wider than the screen. Those devices get a
 * lighter version of the same site instead:
 *
 *   - the hero is a normal section with a still picture of the room
 *   - sections fade in once with plain CSS transitions
 *   - native touch scrolling (no Lenis)
 *
 * Change LITE_QUERY to move the line between the two versions.
 * Keep it in sync with the inline script in index.html.
 */
export const LITE_QUERY = '(max-width: 900px), (hover: none), (pointer: coarse)'

const mql =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(LITE_QUERY)
    : null

export function isLiteDevice() {
  return Boolean(mql && mql.matches)
}

function subscribe(callback) {
  if (!mql) return () => {}
  if (mql.addEventListener) {
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }
  mql.addListener(callback) // very old Safari
  return () => mql.removeListener(callback)
}

/** True on lite devices; re-renders when the window crosses the line. */
export function useLiteMode() {
  return useSyncExternalStore(subscribe, isLiteDevice, () => false)
}

/** Keeps <html data-perf="lite|full"> in sync (CSS uses it). */
export function syncPerfAttribute() {
  if (typeof document === 'undefined') return () => {}
  const apply = () => {
    document.documentElement.dataset.perf = isLiteDevice() ? 'lite' : 'full'
  }
  apply()
  return subscribe(apply)
}
