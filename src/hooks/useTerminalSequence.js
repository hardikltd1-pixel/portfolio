import { useEffect, useMemo, useRef, useState } from 'react'
import { heroElapsed } from '../lib/clock'
import { prefersReducedMotion } from './useReducedMotion'

const TYPE_MS = 38
const NEXT_LINE_MS = 320
const START_MS = 420

/**
 * Types a list of terminal lines out one after another.
 *
 * All timers live in a ref array so a single cleanup cancels everything —
 * no stray setState after unmount, no orphaned intervals in StrictMode.
 *
 * WHY IT STARTS FROM THE CLOCK INSTEAD OF FROM ZERO
 *   See lib/clock. This one matters more than it looks: the sequence types each
 *   line once and then holds it, so a fresh mount part-way through would retype
 *   the whole card from line one — the most obvious thing there was that could
 *   give the monitor-to-page handoff away. Seeded from the clock, the copy that
 *   takes over as the page is already showing the line the screen was showing.
 *
 * When the visitor prefers reduced motion, every line is shown immediately.
 *
 * @param {Array<{prompt: string, value: string}>} lines
 * @returns {{ typedCount: number, typed: string, done: boolean }}
 */

/**
 * Where the sequence would be if it had run since the page loaded: which line it
 * is on, how much of that line is showing, how many are finished, and how long
 * until its next keystroke.
 *
 * The delays mirror the machine below exactly — START_MS of stillness, then each
 * line a character per TYPE_MS with NEXT_LINE_MS between lines — so walking the
 * lines and spending the time as it goes lands on the right keystroke.
 */
function phaseAt(elapsed, lines) {
  const nothing = { index: 0, character: 0, typedCount: 0, typed: '' }

  let t = elapsed
  if (t < START_MS) {
    return { ...nothing, delay: START_MS - t }
  }
  t -= START_MS

  for (let index = 0; index < lines.length; index += 1) {
    const { value } = lines[index]
    const typing = value.length * TYPE_MS

    if (t < typing) {
      /* +1: the keystroke that lands first is the one being counted, which is
         exactly how the machine steps. */
      const character = Math.floor(t / TYPE_MS) + 1
      return {
        index,
        character,
        typedCount: index,
        typed: value.slice(0, character),
        delay: TYPE_MS - (t % TYPE_MS),
      }
    }
    t -= typing

    const done = { index: index + 1, character: 0, typedCount: index + 1, typed: '' }

    /* The last line: the card holds its finished state from here on. */
    if (index === lines.length - 1) {
      return { ...done, index: lines.length, delay: Infinity }
    }

    if (t < NEXT_LINE_MS) {
      return { ...done, delay: NEXT_LINE_MS - t }
    }
    t -= NEXT_LINE_MS
  }

  return { index: lines.length, character: 0, typedCount: lines.length, typed: '', delay: Infinity }
}

export function useTerminalSequence(lines) {
  /* Read once per mount, not per render — the effect below runs from it. */
  const start = useMemo(
    () => (prefersReducedMotion() || lines.length === 0
      ? { index: 0, character: 0, typedCount: lines.length, typed: '', delay: Infinity }
      : phaseAt(heroElapsed(), lines)),
    [lines],
  )

  const [typedCount, setTypedCount] = useState(start.typedCount)
  const [typed, setTyped] = useState(start.typed)
  const timers = useRef([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (start.delay === Infinity) {
      setTypedCount(lines.length)
      setTyped('')
      return undefined
    }

    let character = start.character
    let index = start.index
    let alive = true

    const schedule = (fn, delay) => {
      timers.current.push(setTimeout(fn, delay))
    }

    const typeCharacter = () => {
      if (!alive) return

      const line = lines[index]
      character += 1
      setTyped(line.value.slice(0, character))

      if (character < line.value.length) {
        schedule(typeCharacter, TYPE_MS)
        return
      }

      // Line finished — pause, then start the next one.
      index += 1
      setTyped('')

      if (index >= lines.length) {
        setTypedCount(lines.length)
        alive = false
        return
      }

      setTypedCount(index)
      schedule(typeCharacter, NEXT_LINE_MS)
    }

    schedule(typeCharacter, start.delay)

    return () => {
      alive = false
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [lines, start])

  return { typedCount, typed, done: typedCount >= lines.length }
}
