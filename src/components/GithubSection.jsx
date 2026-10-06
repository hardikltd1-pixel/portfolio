import ActionButton from './ActionButton'
import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

export default function GithubSection() {
  const { githubSection } = profile

  return (
    <section id="github" className="section github" aria-labelledby="github-title">
      <div className="container">
        <Reveal className="github__panel" variant="scale" delay={60}>
          <Icon name="github" className="github__watermark" aria-hidden="true" />

          <div className="github__content">
            <SectionHeading
              index="07"
              titleId="github-title"
              eyebrow="Open source"
              title={githubSection.heading}
              lead={githubSection.text}
              className="github__heading"
            />

            <p className="github__note">{githubSection.note}</p>

            <div className="github__actions">
              <ActionButton
                variant="primary"
                href={profile.github}
                configKey="github"
                icon="arrowUpRight"
              >
                Visit GitHub
              </ActionButton>
            </div>
          </div>

          <span className="github__badge" aria-hidden="true">
            <Icon name="git" />
            <span className="mono">git push origin main</span>
          </span>
        </Reveal>
      </div>
    </section>
  )
}