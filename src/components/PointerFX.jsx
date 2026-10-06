import { useEffect } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

/**
 * Pointer-driven hover effect for buttons only — the "magnetic lean".
 *
 *   data-magnetic="0.3"   the element drifts a few px toward the cursor
 *
 * Deliberately FLAT: no rotateX / rotateY / perspective anywhere. Cards stay
 * completely still and react with a plain translateY lift in CSS, so nothing
 * on the page can wobble as a side effect of where the cursor happens to be.
 *
 * Delegating from the document means one listener pair for the whole page
 * instead of one per button, and values are written as CSS custom properties
 * inside a rAF loop — hovering never triggers a React render. The loop stops
 * scheduling itself once every value has settled, so an idle page costs nothing.
 *
 * Skipped entirely for touch pointers and reduced-motion visitors.
 */

/* How quickly the element catches up to the pointer (0–1, per frame). */
const MAGNETIC_EASE = 0.2
/* Once the remaining distance is under this (px), snap and stop the loop. */
const SETTLE_EPSILON = 0.05
/* Hard cap on the drift, so a large strength value can't fling a button. */
const MAX_OFFSET = 10

export default function PointerFX() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined

    let frame = 0
    const active = new Map()

    const animate = () => {
      let settled = true

      active.forEach((state) => {
        const { node, strength, targetX, targetY } = state

        state.x += (targetX - state.x) * MAGNETIC_EASE
        state.y += (targetY - state.y) * MAGNETIC_EASE

        if (Math.abs(targetX - state.x) < SETTLE_EPSILON) state.x = targetX
        if (Math.abs(targetY - state.y) < SETTLE_EPSILON) state.y = targetY
        if (state.x !== targetX || state.y !== targetY) settled = false

        node.style.setProperty('--mag-x', `${(state.x * strength * MAX_OFFSET).toFixed(2)}px`)
        node.style.setProperty('--mag-y', `${(state.y * strength * MAX_OFFSET).toFixed(2)}px`)
      })

      /* Everything arrived — release the frame instead of looping forever. */
      frame = settled ? 0 : window.requestAnimationFrame(animate)
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(animate)
    }

    /* ------------------------------------------------------------ hover in */
    const onPointerOver = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const magnetic = target.closest('[data-magnetic]')
      if (!magnetic || magnetic.contains(event.relatedTarget)) return

      active.set(magnetic, {
        node: magnetic,
        strength: Math.min(Number(magnetic.dataset.magnetic) || 0.3, 1),
        targetX: 0,
        targetY: 0,
        x: Number.parseFloat(magnetic.style.getPropertyValue('--mag-x')) / (MAX_OFFSET * 0.3) || 0,
        y: Number.parseFloat(magnetic.style.getPropertyValue('--mag-y')) / (MAX_OFFSET * 0.3) || 0,
      })
      magnetic.dataset.active = 'true'
      schedule()
    }

    /* --------------------------------------------------------- pointer move */
    const onPointerMove = (event) => {
      if (!active.size) return

      active.forEach((state, node) => {
        const rect = node.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        // -1 … 1 across the element, 0 at its centre.
        state.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1
        state.targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      })

      schedule()
    }

    /* ------------------------------------------------------------ hover out */
    const onPointerOut = (event) => {
      if (!(event.target instanceof Element)) return

      active.forEach((state, node) => {
        if (node.contains(event.relatedTarget)) return
        state.targetX = 0
        state.targetY = 0
        delete node.dataset.active
      })

      if (active.size) schedule()
    }

    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut)

    return () => {
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      if (frame) window.cancelAnimationFrame(frame)
      active.forEach(({ node }) => {
        node.style.removeProperty('--mag-x')
        node.style.removeProperty('--mag-y')
      })
      active.clear()
    }
  }, [])

  return null
}