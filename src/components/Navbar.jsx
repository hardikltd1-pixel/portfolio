import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import { navigation, profile } from '../config/profile'
import { useActiveSection } from '../hooks/useActiveSection'
import { useHideOnScroll } from '../hooks/useHideOnScroll'
import { useScrolled } from '../hooks/useScrolled'
import { scrollToSection } from '../lib/scroll'
import { isPlaceholder } from '../lib/links'

const NAV_IDS = navigation.map((item) => item.id)

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(16)
  /* Slides the navbar away on scroll-down, back on scroll-up. */
  const hidden = useHideOnScroll({ threshold: 140 })
  const activeId = useActiveSection(NAV_IDS)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  /* Escape closes the mobile menu and returns focus to the toggle. */
  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  /* Never leave the mobile menu open when the layout becomes desktop. */
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 860px)')
    const onChange = (event) => event.matches && setMenuOpen(false)

    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  const go = (id) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  const displayName = profile.shortName || profile.name
  /* Two-letter monogram, or a prompt mark while the name is still a placeholder. */
  const initials = isPlaceholder(displayName)
    ? '>'
    : displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

  /* `data-hidden` drives the slide-away; never hide while the drawer is open.
     While the hero intro is playing, CSS also hides this whole header — see the
     `data-hero-intro` block in navbar.css. It uses `visibility: hidden`, which
     also takes the links out of the tab order, so nothing invisible can be
     focused while the monitor is still zooming. */
  return (
    <header
      className="nav"
      data-scrolled={scrolled}
      data-menu-open={menuOpen}
      data-hidden={hidden && !menuOpen}
    >
      <div className="nav__inner container">
        <a
          className="nav__brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            go('home')
          }}
        >
          <span className="nav__mark" aria-hidden="true">
            {initials}
          </span>
          <span className="nav__brand-name">{displayName}</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {navigation.map((item) => (
            <a
              key={item.id}
              className="nav__link"
              href={`#${item.id}`}
              data-active={activeId === item.id}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault()
                go(item.id)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <ThemeToggle />

          <a
            className="nav__github"
            href={isPlaceholder(profile.github) ? undefined : profile.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={isPlaceholder(profile.github)}
            title={
              isPlaceholder(profile.github)
                ? 'Set github in src/config/profile.js'
                : 'GitHub profile'
            }
          >
            <Icon name="github" />
            <span className="visually-hidden">GitHub profile</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="visually-hidden">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
            <span className="nav__toggle-box" data-open={menuOpen}>
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ mobile drawer */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className="nav__panel"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
      >
        <nav className="nav__panel-list container" aria-label="Mobile">
          {navigation.map((item, index) => (
            <a
              key={item.id}
              className="nav__panel-link"
              href={`#${item.id}`}
              tabIndex={menuOpen ? 0 : -1}
              style={{ '--i': index }}
              data-active={activeId === item.id}
              onClick={(event) => {
                event.preventDefault()
                go(item.id)
              }}
            >
              <span className="nav__panel-index mono">0{index + 1}</span>
              {item.label}
              <Icon name="arrowUpRight" className="nav__panel-arrow" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}