/**
 * One clock for everything in the hero that moves on its own.
 *
 * The hero's content is mounted twice over the life of the page: first on the
 * monitor screen, then as the page itself. The handoff unmounts the copy on the
 * screen and mounts the real one in the same React commit. If the timed pieces
 * inside it counted from their own mount times, the text would visibly start
 * retyping at the exact moment the swap is supposed to stop being noticeable —
 * measured at a mean of 8/255 across 6.6% of the frame, which reads clearly as a
 * jump.
 *
 * So every timed animation in the hero takes its position from here rather than
 * from when it happened to mount. Both copies are then always showing the same
 * frame of one timeline, and the handoff has nothing to give away.
 *
 * `Date.now()` rather than `performance.now()` on purpose: it has to keep making
 * sense across the React subtree being torn down and built again.
 */

/** When this page session's hero began. Fixed for the lifetime of the page. */
export const HERO_ORIGIN = Date.now()

/** Milliseconds since the hero started. */
export function heroElapsed() {
  return Date.now() - HERO_ORIGIN
}
