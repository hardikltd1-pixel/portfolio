import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'
import { isPlaceholder } from '../lib/links'

export default function About() {
  const { about } = profile
  const showPhoto = !isPlaceholder(profile.photo)

  return (
    <section id="about" className="section section--tint about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__heading">
          <SectionHeading
            index="01"
            titleId="about-title"
            eyebrow="About"
            title={about.heading}
            lead={about.paragraphs[0]}
          />
        </div>

        {/* Text slides in from the left, cards from the right. */}
        <div className="about__grid">
          <Reveal as="div" className="about__text" variant="left" delay={120}>
            {showPhoto && (
              <figure className="about__photo">
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.shortName || profile.name}`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            )}

            {about.paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}

            <div className="about__signature">
              <span className="about__signature-line" aria-hidden="true" />
              <span className="mono">
                {profile.degree} · {profile.year} · {profile.college}
              </span>
            </div>
          </Reveal>

          {/* Cards slide in from the side, one after another. */}
          <ul className="about__cards">
            {about.cards.map((card, index) => (
              <Reveal
                as="li"
                key={card.index}
                className="about__card card card--hover card--sheen"
                variant="right"
                delay={index * 110}
              >
                <div className="about__card-top">
                  <span className="about__card-index mono">{card.index}</span>
                  <Icon name="arrowUpRight" className="about__card-icon" />
                </div>
                <h3 className="about__card-title">{card.title}</h3>
                <p className="about__card-body">{card.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}