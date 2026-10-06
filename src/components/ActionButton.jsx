import Icon from './Icon'
import { useNotice } from '../hooks/useNotice'
import { scrollToSection } from '../lib/scroll'
import { isLiveLink, isPlaceholder } from '../lib/links'

/**
 * One button component for every action on the site, so behaviour is never
 * inconsistent and no button is ever dead.
 *
 * Three modes, chosen by props:
 *   scrollTo="project"       -> smooth-scrolls to a section on this page
 *   href="https://…"         -> opens the real external link in a new tab
 *   href="[YOUR GITHUB URL]" -> still a working button: it explains exactly
 *                               which value in config/profile.js to fill in
 *
 * `data-magnetic` opts the button into the magnetic hover handled by
 * <PointerFX />. The strength is the fraction of the pointer offset it follows.
 */
export default function ActionButton({
  children,
  variant,
  scrollTo,
  href,
  configKey,
  ariaLabel,
  className = '',
  icon,
  type = 'button',
  ...rest
}) {
  const { showNotice } = useNotice()
  const hasHref = typeof href === 'string' && href.trim() !== ''
  const isLive = isLiveLink(href)
  const placeholder = hasHref && (isPlaceholder(href) || !isLive)

  const classes = [
    'btn',
    `btn--${variant || (isLive ? 'secondary' : 'ghost')}`,
    placeholder && 'btn--placeholder',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span>{children}</span>
      {icon && <Icon name={icon} className="btn__arrow" />}
      {/* Gradient shine sweep, painted above the label on hover. */}
      <span className="btn__shine" aria-hidden="true" />
    </>
  )

  // 1 -> jump to a section of this page
  if (scrollTo) {
    return (
      <button
        type="button"
        className={classes}
        data-magnetic="0.28"
        onClick={() => scrollToSection(scrollTo)}
        aria-label={ariaLabel}
        {...rest}
      >
        {content}
      </button>
    )
  }

  // 2 -> a real external destination
  if (hasHref && !placeholder) {
    const isMail = href.trim().toLowerCase().startsWith('mailto:')
    return (
      <a
        className={classes}
        data-magnetic="0.28"
        href={href.trim()}
        aria-label={ariaLabel}
        {...(isMail ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
        {...rest}
      >
        {content}
      </a>
    )
  }

  // 3 -> placeholder: say what is missing instead of navigating nowhere
  return (
    <button
      type={type}
      className={classes}
      data-magnetic="0.28"
      aria-label={ariaLabel}
      onClick={() =>
        showNotice(
          <>
            This link is still a placeholder. Open <code>src/config/profile.js</code> and set{' '}
            <code>{configKey || 'the matching value'}</code> to your real URL.
          </>,
        )
      }
      {...rest}
    >
      {content}
      {placeholder && <Icon name="sparkle" className="btn__arrow" />}
    </button>
  )
}