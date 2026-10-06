import { useEffect } from 'react'
import ActionButton from './ActionButton'
import TerminalCard from './TerminalCard'
import TypingRoles from './TypingRoles'
import { navigation, profile } from '../config/profile'
import { heroElapsed } from '../lib/clock'
import { isPlaceholder } from '../lib/links'

/**
 * HeroContent — the real hero, with no section wrapper.
 *
 * This is the markup that lives INSIDE the monitor screen. During the intro it is
 * scaled down to look like a website on a screen; as the scroll zoom finishes it
 * scales back to 1:1 and simply becomes the page. One component, so the content
 * is never cloned or forked into two variants that could drift apart.
 *
 * The copy on the screen is unmounted in the same commit that mounts this one as
 * the page, so at no point are both in the document — one set of ids, one set of
 * timers. Everything timed inside takes its position from the shared hero clock
 * (lib/clock) rather than from its own mount, so the swap lands on the frame the
 * screen was already showing instead of rewinding.
 *
 * The mini navigation strip at the top is a non-interactive visual echo of the
 * real Navbar, which slides in from the top at the moment the zoom completes.
 * It is aria-hidden and holds no links, so there is only one navigation on the
 * page for assistive tech and keyboard users.
 */

export default function HeroContent() {
  const { hero } = profile

  /* Hands the CSS-driven loops (the status ping, the terminal caret) their
     position on the shared clock. Every timed thing in the hero is seeded this
     way; these two are the ones a stylesheet owns. */
  useEffect(() => {
    document.documentElement.style.setProperty('--hero-clock', `${-heroElapsed()}ms`)
  }, [])

  /* Same monogram rule the real Navbar uses, so the preview strip matches it
     pixel for pixel when the zoom finishes. */
  const displayName = profile.shortName || profile.name
  const initials = isPlaceholder(displayName)
    ? '>'
    : displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

  return (
    <div className="hero__inner container">
      {/* Visual echo of the navbar. Hidden from assistive tech. */}
      <div className="screen-nav" aria-hidden="true">
        <span className="screen-nav__brand">
          <span className="screen-nav__mark mono">{initials}</span>
          <span className="screen-nav__name">{profile.shortName || profile.name}</span>
        </span>
        <span className="screen-nav__links">
          {navigation.slice(0, 4).map((item) => (
            <span key={item.id} className="screen-nav__link mono">
              {item.label}
            </span>
          ))}
        </span>
        <span className="screen-nav__pill">
          <span className="screen-nav__pill-dot" />
        </span>
      </div>

      <p className="hero__status">
        <span className="hero__dot" aria-hidden="true" />
        {hero.status}
      </p>

      <h1 id="hero-title" className="hero__title">
        Hi, I&rsquo;m <span className="hero__name">{profile.shortName || profile.name}.</span>
      </h1>

      <p className="hero__roles">
        <TypingRoles words={hero.roles} />
      </p>

      <span className="hero__rule" aria-hidden="true" />

      <div className="hero__body">
        <div className="hero__copy">
          <p className="hero__intro">{hero.intro}</p>

          <p className="hero__highlight">{hero.highlight}</p>

          <div className="hero__actions">
            <ActionButton variant="primary" scrollTo="project" icon="arrowUpRight">
              View My Work
            </ActionButton>

            <ActionButton variant="secondary" href={profile.github} configKey="github" icon="arrowUpRight">
              GitHub
            </ActionButton>

            {/* Appears only once profile.resume is filled in. */}
            {!isPlaceholder(profile.resume) && (
              <ActionButton variant="secondary" href={profile.resume} configKey="resume" icon="arrowUpRight">
                Résumé
              </ActionButton>
            )}
          </div>

          <ul className="hero__meta">
            <li>
              <span className="hero__meta-key mono">edu</span>
              <span className="hero__meta-value">{profile.college}</span>
            </li>
            {profile.location && !isPlaceholder(profile.location) && (
              <li>
                <span className="hero__meta-key mono">loc</span>
                <span className="hero__meta-value">{profile.location}</span>
              </li>
            )}
            <li>
              <span className="hero__meta-key mono">year</span>
              <span className="hero__meta-value">
                {profile.degree} · {profile.year}
              </span>
            </li>
          </ul>
        </div>

        <div className="hero__terminal">
          <TerminalCard />
        </div>
      </div>
    </div>
  )
}