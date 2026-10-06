/**
 * Minimal inline SVG icon set.
 * All icons share a 24×24 box and inherit `currentColor`, so they can be
 * tinted by CSS. Adding a new icon: add a path here, then reference it by
 * the string key in config/profile.js.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

const paths = {
  terminal: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="3" />
      <path d="M6.5 9.5 9.5 12l-3 2.5" />
      <path d="M12.5 15h5" />
    </>
  ),

  python: (
    <>
      <path d="M12 2.6c-2.6 0-4.6.8-4.6 3v2.2h4.9" />
      <path d="M7.4 7.8V6.6c0-2.2 2-3 4.6-3" />
      <path d="M7.4 16.2v1.2c0 2.2 2 3 4.6 3 2.6 0 4.6-.8 4.6-3v-2.2h-4.9" />
      <path d="M16.6 16.2v1.2c0 2.2-2 3-4.6 3" />
      <circle cx="10" cy="5.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18.5" r=".9" fill="currentColor" stroke="none" />
    </>
  ),

  git: (
    <>
      <circle cx="7" cy="6" r="2.4" />
      <circle cx="7" cy="18" r="2.4" />
      <circle cx="17" cy="10.5" r="2.4" />
      <path d="M7 8.4v7.2" />
      <path d="M7 12.6c3 0 5.6-.8 7.6-1.7" />
    </>
  ),

  github: (
    <>
      <path d="M9 19.5c-4.3 1.3-4.3-2.2-6-2.7m12 5.2v-3.4c0-.9.1-1.3-.4-1.8 2.3-.3 4.6-1.2 4.6-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.8s-.9-.3-2.9 1a9.9 9.9 0 0 0-5.2 0c-2-1.3-2.9-1-2.9-1a3.6 3.6 0 0 0-.1 2.8A3.9 3.9 0 0 0 3 7.8c0 3.8 2.3 4.7 4.6 5-.4.4-.4.8-.4 1.3V22" />
    </>
  ),

  code: (
    <>
      <path d="M9 17 4.5 12 9 7" />
      <path d="M15 7l4.5 5L15 17" />
      <path d="M13.2 4.5 10.8 19.5" />
    </>
  ),

  braces: (
    <>
      <path d="M9 3.5c-1.9 0-2.6.8-2.6 2.2v2.1c0 1.3-.6 2.2-2.2 2.4v1.6c1.6.2 2.2 1.1 2.2 2.4v2.1c0 1.4.7 2.2 2.6 2.2" />
      <path d="M15 3.5c1.9 0 2.6.8 2.6 2.2v2.1c0 1.3.6 2.2 2.2 2.4v1.6c-1.6.2-2.2 1.1-2.2 2.4v2.1c0 1.4-.7 2.2-2.6 2.2" />
    </>
  ),

  layers: (
    <>
      <path d="M12 2.8 2.8 7.2 12 11.6l9.2-4.4L12 2.8Z" />
      <path d="m2.8 12.4 9.2 4.4 9.2-4.4" />
      <path d="m2.8 16.9 9.2 4.4 9.2-4.4" />
    </>
  ),

  /* Crop / agriculture — used for the featured project */
  leaf: (
    <>
      <path d="M5 19c0-8 4.6-13 15-13 0 9.4-4.6 13.6-11 13.6a5.4 5.4 0 0 1-4-.6Z" />
      <path d="M5 19c2.4-3.4 5.2-6 9-8" />
    </>
  ),

  /* SIH achievement */
  trophy: (
    <>
      <path d="M7.5 3.5h9v5.2a4.5 4.5 0 0 1-9 0V3.5Z" />
      <path d="M7.5 5H5a2.2 2.2 0 0 0 2.6 4.2" />
      <path d="M16.5 5H19a2.2 2.2 0 0 1-2.6 4.2" />
      <path d="M12 13.2v3.4" />
      <path d="M8.5 20.5h7" />
      <path d="M9.6 16.6h4.8l1.1 3.9H8.5l1.1-3.9Z" />
    </>
  ),

  mail: (
    <>
      <rect x="2.5" y="4.8" width="19" height="14.4" rx="2.6" />
      <path d="m3.4 7 8.6 6 8.6-6" />
    </>
  ),

  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.6 10.4V17" />
      <path d="M7.6 7.3v.1" />
      <path d="M11.4 17v-3.7a2.3 2.3 0 0 1 4.6 0V17" />
      <path d="M11.4 10.4V17" />
    </>
  ),

  /* Misc UI */
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowDown: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  sparkle: (
    <>
      <path d="M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2 10.3 12.4 4.5 10.7 10.3 9 12 3.2Z" />
      <path d="M18.6 3.4v3M20.1 4.9h-3" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h5.5A2.5 2.5 0 0 1 12 7v13a2 2 0 0 0-2-1.6H4V4.5Z" />
      <path d="M20 4.5h-5.5A2.5 2.5 0 0 0 12 7v13a2 2 0 0 1 2-1.6h6V4.5Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  puzzle: (
    <>
      <path d="M10.4 3.6a1.9 1.9 0 0 1 3.2 1.4v1.2h2.8a1 1 0 0 1 1 1v2.9h1.2a1.9 1.9 0 0 1 0 3.8h-1.2v2.8a1 1 0 0 1-1 1h-2.8v1.2a1.9 1.9 0 0 1-3.2 0v-1.2H7.6a1 1 0 0 1-1-1V15h1.2a1.9 1.9 0 0 0 0-3.8H6.6V8.2a1 1 0 0 1 1-1h2.8V5a1.9 1.9 0 0 1 0-1.4Z" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.2" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" />
      <path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21" />
    </>
  ),

  /* Theme toggle */
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
    </>
  ),
  moon: <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />,

  /* Small glyphs that drift in the hero background */
  symbolAt: <path d="M16.5 8.2 7.9 16.4M13.6 4.6l1.9 1.9M18.5 9.4l1.9 1.9M6.1 12.1l1.9 1.9M4.6 18.5l1.9 1.9" />,
  symbolHash: <path d="M5 9.5h14M5 14.5h14M10 4l-1.5 16M16 4l-1.5 16" />,
  symbolAngle: <path d="M4 20 20 4M20 12.5V4h-8.5" />,
  symbolPlus: <path d="M12 5v14M5 12h14" />,
}

/** Renders an icon by name. Unknown names quietly render nothing. */
export default function Icon({ name, ...rest }) {
  const glyph = paths[name]
  if (!glyph) return null
  return (
    <svg {...base} {...rest}>
      {glyph}
    </svg>
  )
}

/** Names available in this set — handy when editing config files. */
export const iconNames = Object.keys(paths)