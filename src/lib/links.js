/**
 * Small helpers for working with the placeholder links in `config/profile.js`.
 * A value written as `[ANYTHING IN BRACKETS]` counts as "not filled in yet".
 */

const PLACEHOLDER_PATTERN = /\[.*\]/

/** True when a value is empty or still contains a [PLACEHOLDER]. */
export function isPlaceholder(value) {
  if (typeof value !== 'string') return true
  const trimmed = value.trim()
  return trimmed === '' || PLACEHOLDER_PATTERN.test(trimmed)
}

/** True when an external link is safe to actually follow. */
export function isLiveLink(value) {
  return typeof value === 'string' && /^(https?:|mailto:)/i.test(value.trim())
}

/** Attributes for anchors that open in a new tab. */
export const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}