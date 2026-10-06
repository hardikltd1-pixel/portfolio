import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { useInView } from '../hooks/useInView'
import { profile } from '../config/profile'

export default function Timeline() {
  const { journey } = profile
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: '0px 0px -12% 0px' })

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="container">
        <SectionHeading
          index="05"
          titleId="journey-title"
          eyebrow="Journey"
          title={journey.heading}
          lead={journey.lead}
        />

        <div className="journey__layout">
          {/* The vertical line grows from the top as the section enters. */}
          <div className="journey__rail" aria-hidden="true" data-in-view={isInView}>
            <span className="journey__rail-base" />
            <span className="journey__rail-fill" />
          </div>

          <ol className="journey__list" ref={ref}>
            {journey.entries.map((entry, index) => (
              <li className="journey__item" key={`${entry.year}-${entry.title}`}>
                <span className="journey__dot" data-upcoming={entry.upcoming || undefined} />

                <Reveal className="journey__content" delay={index * 140}>
                  <span className="journey__year mono">{entry.year}</span>
                  <div className="journey__text">
                    <h3 className="journey__item-title">{entry.title}</h3>
                    <p className="journey__body">{entry.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}

            <li className="journey__item journey__item--outro">
              <span className="journey__dot journey__dot--outro" />
              <Reveal className="journey__content" delay={journey.entries.length * 140}>
                <p className="journey__outro">
                  <Icon name="arrowDown" />
                  That is where I am. The rest is still being written.
                </p>
              </Reveal>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}