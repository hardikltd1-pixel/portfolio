import { useEffect, useRef, useState } from 'react'

/**
 * Hides the navbar while the visitor scrolls down and brings it back on the
 * first scroll up — the classic "get out of the way" header.
 *
 * @param {number} threshold  never hide while above this scroll offset
 * @param {number} jitter      px of noise to ignore, so tiny bounces and
 *                             trackpad momentum do not flicker the navbar
 */
export function useHideOnScroll({ threshold = 140, jitter = 6 } = {}) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0

    const read = () => {
      frame = 0
      const y = Math.max(window.scrollY, 0)
      const delta = y - lastY.current
      lastY.current = y

      // Near the top the navbar is always shown.
      if (y <= threshold) {
        setHidden(false)
        return
      }

      if (Math.abs(delta) < jitter) return
      setHidden(delta > 0)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(read)
    }

    lastY.current = Math.max(window.scrollY, 0)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [threshold, jitter])

  return hidden
}