import { profile } from '../config/profile'
import { useTerminalSequence } from '../hooks/useTerminalSequence'

/**
 * Small animated terminal card used as the hero's memorable detail.
 * Lines type out one by one; reduced-motion visitors get the full text.
 */
export default function TerminalCard() {
  const lines = profile.hero.terminal
  const { typedCount, typed, done } = useTerminalSequence(lines)

  const visible = lines.slice(0, typedCount)

  return (
    <div className="terminal">
      <div className="terminal__bar" aria-hidden="true">
        <span className="terminal__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal__path mono">~/portfolio</span>
      </div>

      <div className="terminal__body" aria-hidden="true">
        {visible.map((line, index) => {
          const isLast = index === visible.length - 1
          return (
            <p className="terminal__line" key={line.prompt}>
              <span className="terminal__prompt">$</span>
              <span className="terminal__command">{line.prompt}</span>
              <span className="terminal__value">{isLast && !done ? typed : line.value}</span>
              {isLast && <span className="terminal__caret" />}
            </p>
          )
        })}
      </div>

      {/* The same information as plain text, for screen readers. */}
      <ul className="visually-hidden">
        {lines.map((line) => (
          <li key={line.prompt}>
            {line.prompt}: {line.value}
          </li>
        ))}
      </ul>
    </div>
  )
}