import Icon from './Icon'
import { useTheme } from '../hooks/useTheme'

/**
 * Sun / moon switch in the navbar.
 *
 * The button renders both glyphs and lets CSS cross-fade + spin between them,
 * which keeps the transition smooth without a re-render mid-animation.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Golden Hour' : 'Switch to Dusk'}
      title={isDark ? 'Golden Hour' : 'Dusk'}
      data-theme-state={theme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        {/* Sun is shown in dark mode (click to go light) */}
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <Icon name="sun" />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <Icon name="moon" />
        </span>
      </span>
    </button>
  )
}