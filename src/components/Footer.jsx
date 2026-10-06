import Icon from './Icon'
import { profile } from '../config/profile'
import { isPlaceholder } from '../lib/links'
import { scrollToSection } from '../lib/scroll'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const name = profile.shortName || profile.name
  const githubPlaceholder = isPlaceholder(profile.github)

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__left">
          <p className="footer__name">
            <span className="footer__dot" aria-hidden="true" />
            {name} <span aria-hidden="true">&copy;</span>
            <span className="visually-hidden">copyright</span> {YEAR}
          </p>
          <p className="footer__line">{profile.footer.line}</p>
          <p className="footer__note">{profile.footer.note}</p>
        </div>

        <div className="footer__right">
          <a
            className="footer__icon"
            href={githubPlaceholder ? undefined : profile.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={githubPlaceholder}
            title={githubPlaceholder ? 'Set github in src/config/profile.js' : 'GitHub'}
          >
            <Icon name="github" />
            <span className="visually-hidden">GitHub profile</span>
          </a>

          <button type="button" className="footer__top" onClick={() => scrollToSection('home')}>
            Back to top
            <Icon name="arrowUpRight" />
          </button>
        </div>
      </div>

      <p className="footer__built mono">
        <span aria-hidden="true">// </span>last updated while learning
      </p>
    </footer>
  )
}