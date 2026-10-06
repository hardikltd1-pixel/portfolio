import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const NoticeContext = createContext(null)

/**
 * When a button points at a placeholder link (anything in [BRACKETS] in
 * config/profile.js) we cannot navigate anywhere real. Instead of shipping a
 * dead button, we say exactly which value is missing and where to put it.
 */
export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null)
  const timeout = useRef(null)

  const showNotice = useCallback((message) => {
    if (timeout.current) clearTimeout(timeout.current)
    setNotice({ id: Date.now(), message })
    timeout.current = setTimeout(() => setNotice(null), 4200)
  }, [])

  const value = useMemo(() => ({ showNotice }), [showNotice])

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div
        className="notice"
        role="status"
        aria-live="polite"
        data-visible={notice ? 'true' : 'false'}
      >
        {notice && (
          <p className="notice__text">
            <span className="notice__dot" aria-hidden="true" />
            {notice.message}
          </p>
        )}
      </div>
    </NoticeContext.Provider>
  )
}

export function useNotice() {
  const context = useContext(NoticeContext)
  // Safe fallback so components never crash outside the provider.
  return context ?? { showNotice: () => {} }
}