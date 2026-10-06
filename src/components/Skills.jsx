import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

const primary = profile.skills.filter((skill) => !skill.exploring)
const exploring = profile.skills.filter((skill) => skill.exploring)

/** Falls back to the status pill when a skill has no explicit `focus` value. */
const FOCUS_FALLBACK = { Practising: 0.75, Learning: 0.5, Exploring: 0.42 }

function SkillCard({ skill, index }) {
  const focus = typeof skill.focus === 'number' ? skill.focus : (FOCUS_FALLBACK[skill.status] ?? 0.5)

  return (
    <Reveal
      as="li"
      className="skill card card--hover card--sheen"
      delay={index * 85}
    >
      <div className="skill__top">
        <span className="icon-frame skill__icon">
          <Icon name={skill.icon} />
        </span>
        <span className={`pill ${skill.exploring ? 'pill--accent' : ''}`}>{skill.status}</span>
      </div>

      <h3 className="skill__name">{skill.name}</h3>
      <p className="skill__description">{skill.description}</p>

      {/* Visual weight only — set `focus` in src/config/profile.js.
          ScrollFX scales this bar in as the card scrolls into view. */}
      <div className="skill__meter" aria-hidden="true">
        <span className="skill__meter-fill" data-meter-fill={focus} style={{ '--meter': focus }} />
      </div>
    </Reveal>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          index="02"
          titleId="skills-title"
          eyebrow="Skills"
          title="Things I'm Learning"
          lead="A short list, kept honest. These are the tools I actually use right now — not a full stack of claims."
        />

        <ul className="skills__grid">
          {primary.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
        </ul>

        {exploring.length > 0 && (
          <>
            <Reveal as="div" className="skills__divider" variant="fade" delay={80}>
              <span className="skills__divider-label mono">Exploring next</span>
              <span className="skills__divider-line" aria-hidden="true" />
              <span className="skills__divider-note">
                Used to build this site — still learning them properly.
              </span>
            </Reveal>

            <ul className="skills__grid skills__grid--compact">
              {exploring.map((skill, index) => (
                <SkillCard key={skill.id} skill={skill} index={index} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}