import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

export default function CurrentlyLearning() {
  const { currentlyLearning } = profile

  return (
    <section
      id="learning"
      className="section section--deep learning"
      aria-labelledby="learning-title"
    >
      <div className="container">
        <div className="learning__header">
          <SectionHeading
            index="06"
            titleId="learning-title"
            eyebrow="In progress"
            title={currentlyLearning.heading}
            lead={currentlyLearning.lead}
            className="learning__heading"
          />

          <Reveal className="learning__cycle-wrap" variant="scale" delay={140}>
            <LearningCycle words={currentlyLearning.cycle} />
          </Reveal>
        </div>

        <ul className="learning__grid">
          {currentlyLearning.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              className="learning__card card card--hover card--sheen"
              delay={index * 90}
            >
              <span className="icon-frame learning__icon">
                <Icon name={item.icon} />
              </span>

              <h3 className="learning__title">{item.title}</h3>
              <p className="learning__body">{item.body}</p>

              <span className="learning__sweep" aria-hidden="true">
                <span className="learning__sweep-bar" />
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** The small rotating "Learning → Building → Improving" indicator. */
function LearningCycle({ words }) {
  return (
    <div className="learning__cycle">
      <span className="visually-hidden">Currently: {words.join(' → ')}</span>

      {words.map((word, index) => (
        <span
          key={word}
          className="learning__cycle-part"
          data-index={index}
          aria-hidden="true"
        >
          <span className="learning__cycle-word">{word}</span>
          {index < words.length - 1 && (
            <Icon name="arrowUpRight" className="learning__cycle-arrow" />
          )}
        </span>
      ))}

      <span className="learning__cycle-dot" aria-hidden="true" />
    </div>
  )
}