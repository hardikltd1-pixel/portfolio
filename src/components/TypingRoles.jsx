import { useEffect, useMemo, useRef, useState } from 'react'
import { heroElapsed } from '../lib/clock'

/**
 * Types the roles in `hero.roles` one character at a time, holds, erases, moves
 * to the next word, and loops forever.
 *
 * BUG THIS REPLACES
 *   The old version mixed a ref (`erasing.current`) with state (`text`). The
 *   ref changed without triggering a re-render, so the state machine could lose
 *   track of the phase and get stuck mid-word — it would sit on "De |" of
 *   "Developer" and never finish. This version keeps the entire phase in ONE
 *   piece of state (`{ index, count, erasing }`) and schedules exactly one
 *   timeout per state, so every transition is impossible to miss. The whole
 *   line cycles forever.
 *
 * WHY THE INITIAL STATE IS SEEDED FROM THE CLOCK
 *   See lib/clock. The hero is mounted on the monitor screen first and as the
 *   page second; the second mount has to pick up the line mid-type rather than
 *   start it again, or the handoff shows a visible rewind. `phaseAt` asks where
 *   this endless loop would be by now, and the state machine takes it from there.
 *
 * TUNING
 *   TYPE_MS   delay between characters while typing
 *   ERASE_MS  delay between characters while erasing  (lower = faster erase)
 *   HOLD_MS   pause on the completed word before erasing
 *
 * Accessibility
 *   The animated text is aria-hidden because a region that changes every ~60ms
 *   is unusable with a screen reader. The full joined line is rendered once in
 *   a visually hidden element, so the roles are always announced.
 */

const TYPE_MS = 62
const ERASE_MS = 26
const HOLD_MS = 1600

/* Stable fallback so the memo below never changes identity. */
const NO_WORDS = []

/**
 * Where the machine would be if it had been running since the page loaded, and
 * how long until its next step from there.
 *
 * The delays mirror the state machine exactly: type the word one character per
 * TYPE_MS, hold it, erase it one character per ERASE_MS, move on. Walking the
 * words and spending the time as it goes lands on the current word, how much of
 * it is showing, and whether it is going up or coming down.
 */
function phaseAt(elapsed, words) {
  let t = Math.max(0, elapsed)

  for (let index = 0; index < words.length; index += 1) {
    const typing = words[index].length * TYPE_MS
    const erasing = words[index].length * ERASE_MS

    if (t < typing) {
      return {
        state: { index, count: Math.floor(t / TYPE_MS), erasing: false },
        delay: TYPE_MS - (t % TYPE_MS),
      }
    }
    t -= typing

    if (t < HOLD_MS) {
      return { state: { index, count: words[index].length, erasing: false }, delay: HOLD_MS - t }
    }
    t -= HOLD_MS

    if (t < erasing) {
      return {
        state: {
          index,
          count: words[index].length - Math.floor(t / ERASE_MS),
          erasing: true,
        },
        delay: ERASE_MS - (t % ERASE_MS),
      }
    }
    t -= erasing
  }

  return { state: { index: 0, count: 0, erasing: false }, delay: TYPE_MS }
}

export default function TypingRoles({ words = NO_WORDS }) {
  /* Memoised: if `safeWords` changed identity every render the effect below
     would tear down and reschedule forever. */
  const safeWords = useMemo(() => (words.length ? words : ['']), [words])

  /* Where the endless loop would be right now — see lib/clock. */
  const seeded = useMemo(() => phaseAt(heroElapsed(), safeWords), [safeWords])

  /* One object holds the whole phase machine: which word, how many characters
     of it are showing, and whether we are typing or erasing. */
  const [state, setState] = useState(seeded.state)

  /* Part-way through a step when seeded, so the first timeout after a handoff
     is the remainder of that step rather than a whole one. */
  const owed = useRef(seeded.delay)

  useEffect(() => {
    const word = safeWords[state.index % safeWords.length]
    const finished = !state.erasing && state.count >= word.length
    const delay = state.erasing ? ERASE_MS : finished ? HOLD_MS : TYPE_MS
    const wait = owed.current ?? delay
    owed.current = null

    const id = window.setTimeout(() => {
      setState((prev) => {
        const current = safeWords[prev.index % safeWords.length]

        /* typing -> next character */
        if (!prev.erasing && prev.count < current.length) {
          return { ...prev, count: prev.count + 1 }
        }
        /* typed the whole word -> start erasing */
        if (!prev.erasing) {
          return { ...prev, erasing: true }
        }
        /* erasing -> drop the last character */
        if (prev.count > 0) {
          return { ...prev, count: prev.count - 1 }
        }
        /* fully erased -> advance to the next word and start typing */
        return {
          index: (prev.index + 1) % safeWords.length,
          count: 0,
          erasing: false,
        }
      })
    }, wait)

    return () => window.clearTimeout(id)
  }, [state, safeWords])

  const word = safeWords[state.index % safeWords.length]
  const shown = word.slice(0, state.count)

  return (
    <span className="typing">
      {/* Announced once, in full, by screen readers. */}
      <span className="sr-only">{safeWords.join(' • ')}</span>

      {/* The animated, purely visual copy. */}
      <span className="typing__text" aria-hidden="true">
        {shown}
        <span className="typing__caret" />
      </span>
    </span>
  )
}