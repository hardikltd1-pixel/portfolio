import Reveal from './Reveal'

/**
 * The eyebrow + big heading + lead paragraph block used by every section,
 * with its own staggered reveal built in.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  titleId,
  className = '',
}) {
  return (
    <div className={['section-head', className].filter(Boolean).join(' ')}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow" variant="fade" delay={0}>
          {eyebrow}
        </Reveal>
      )}

      <Reveal as="h2" className="section-head__title" id={titleId} delay={70}>
        {index && <span className="section-head__index">{index}</span>}
        <span>{title}</span>
      </Reveal>

      {lead && (
        <Reveal as="p" className="lead" delay={150}>
          {lead}
        </Reveal>
      )}
    </div>
  )
}