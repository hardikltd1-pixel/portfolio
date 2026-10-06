import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

export default function Achievement() {
  const { achievement } = profile

  return (
    <section
      id="achievement"
      className="section section--tint achievement"
      aria-labelledby="achievement-title"
    >
      <div className="container">
        <SectionHeading
          index="04"
          titleId="achievement-title"
          eyebrow="Achievement"
          title={achievement.heading}
          lead="The one real milestone so far — stated exactly as far as it goes."
        />

        <Reveal
          className="achievement__card card card--hover card--sheen"
          variant="scale"
          delay={80}
        >
          <div className="achievement__mark">
            <span className="achievement__ring" aria-hidden="true" />
            <span className="achievement__trophy">
              <Icon name="trophy" />
            </span>
            <span className="achievement__year mono">{achievement.year}</span>
          </div>

          <div className="achievement__body">
            <span className="tag tag--accent">{achievement.badge}</span>
            <h3 className="achievement__title">{achievement.title}</h3>
            <p className="achievement__description">{achievement.description}</p>
          </div>

          <ol className="achievement__flow" aria-label="How the project got selected">
            {achievement.steps.map((step, index) => (
              <li key={step.id} className="achievement__flow-item" data-state={step.state}>
                <Reveal
                  className="achievement__flow-step"
                  variant="scale"
                  delay={index * 130}
                  as="div"
                >
                  <span className="achievement__flow-label mono">{step.label}</span>
                </Reveal>

                {index < achievement.steps.length - 1 && (
                  <span className="achievement__flow-arrow" aria-hidden="true">
                    <Icon name="arrowDown" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}