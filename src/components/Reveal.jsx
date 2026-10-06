import { useInView } from '../hooks/useInView'
import { useScrollReveal } from '../hooks/useScrollReveal'

/**
 * Wraps content in the shared scroll-reveal animation.
 *
 * Two engines sit behind the same component:
 *   1. GSAP ScrollTrigger — reversible, driven by scroll position. Used
 *      whenever motion is allowed.
 *   2. `useInView` + CSS transitions — one-shot fallback for reduced-motion
 *      visitors, missing IntersectionObserver, or no JavaScript at all.
 *
 * @param {string}  as          element to render (default 'div')
 * @param {string}  variant     'up' | 'left' | 'right' | 'scale' | 'zoom' | 'fade'
 * @param {number}  delay       stagger delay in ms
 * @param {boolean} animate     set false for content that must never animate
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  animate = true,
  className = '',
  style,
  children,
  ...rest
}) {
  const { ref, isInView } = useInView({ enabled: animate })

  /* Scrubbed, reversible reveal — no-op when motion is reduced. */
  useScrollReveal(ref, { variant, delay })

  return (
    <Tag
      ref={ref}
      className={['reveal', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-in-view={isInView}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}