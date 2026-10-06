import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-theme'
/* The values are the light / dark system names; the themes are called
   Golden Hour (light, default) and Dusk (dark) in the UI. */
const THEMES = ['light', 'dark']

/** Browser chrome / status-bar colour per theme. */
const THEME_COLOR = { light: '#fff6ea', dark: '#141a3a' }

/** Length of the colour cross-fade, kept in sync with --theme-dur in tokens.css. */
const ANIM_MS = 400

function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(value) ? value : null
  } catch {
    // Private mode / storage disabled — the default stands.
    return null
  }
}

/**
 * Resolves the theme to use: a saved choice always wins, otherwise the site
 * opens in Golden Hour. Also mirrors the value onto <html data-theme> and the
 * <meta name="theme-color"> tag.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => readStored() ?? 'light')

  /* Apply the theme to the document. */
  useEffect(() => {
    const root = document.documentElement
    const meta = document.getElementById('theme-color')

    // `theme-anim` is only present during the switch, so the 0.4s cross-fade
    // never slows down ordinary hover transitions.
    root.classList.add('theme-anim')
    root.dataset.theme = theme
    if (meta) meta.content = THEME_COLOR[theme]

    const timer = window.setTimeout(() => root.classList.remove('theme-anim'), ANIM_MS + 40)
    return () => window.clearTimeout(timer)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Nothing to do — the theme still changes for this session.
      }
      return next
    })
  }, [])

  return { theme, toggleTheme, isDark: theme === 'dark' }
}