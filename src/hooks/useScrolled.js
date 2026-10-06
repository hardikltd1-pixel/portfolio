import { useEffect, useState } from 'react'

/**
 * Tracks how far the visitor has scrolled past `offset` pixels.
 * Used to switch the navbar from transparent to solid.
 */
export function useScrolled(offset = 12) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0

    const read = () => {
      frame = 0
      setScrolled(window.scrollY > offset)
    }

    const onScroll = () => {
      // Coalesce scroll events into one read per frame.
      if (frame) return
      frame = window.requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [offset])

  return scrolled
}