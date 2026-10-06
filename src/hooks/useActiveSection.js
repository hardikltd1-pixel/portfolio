import { useEffect, useState } from 'react'

/**
 * Works out which section is currently the "active" one for the
 * navbar indicator.
 *
 * Uses a band across the upper-middle of the viewport: whichever section
 * crosses it wins. Recomputed on scroll (rAF-throttled) and on resize.
 */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0])
  const key = ids.join('|')

  useEffect(() => {
    const sectionList = ids
    if (!sectionList.length) return undefined

    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.34
      let current = sectionList[0]

      for (const id of sectionList) {
        const node = document.getElementById(id)
        if (!node) continue
        if (node.getBoundingClientRect().top - 84 <= line) current = id
      }

      // Pin the last section once the page is scrolled to the bottom.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
        current = sectionList[sectionList.length - 1]
      }

      setActiveId((previous) => (previous === current ? previous : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}