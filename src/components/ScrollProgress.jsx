import { useEffect, useRef } from 'react'
import { getScrollProgress } from '../lib/scroll'

/**
 * Very thin reading-progress bar pinned to the top of the viewport.
 *
 * The value is written straight to the element inside a single
 * requestAnimationFrame loop — no React re-renders while scrolling, and
 * only `transform` is animated (compositor-friendly, no layout).
 */
export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return undefined

    let frame = 0

    const paint = () => {
      frame = 0
      bar.style.transform = `scale3d(${getScrollProgress()}, 1, 1)`
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} className="scroll-progress__bar" />
    </div>
  )
}