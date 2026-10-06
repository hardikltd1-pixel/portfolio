import ActionButton from './ActionButton'
import Icon from './Icon'
import ProjectCover from './ProjectCover'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

export default function FeaturedProject() {
  const project = profile.projects.find((item) => item.featured) ?? profile.projects[0]
  if (!project) return null

  return (
    <section id="project" className="section section--deep project" aria-labelledby="project-title">
      <div className="container">
        <SectionHeading
          index="03"
          titleId="project-title"
          eyebrow="Project"
          title="Featured Project"
          lead="The main thing I have built so far — and the reason I started writing serious code."
        />

        {/* Not wrapped in <Reveal>: ScrollFX owns this card's transform so
            the 3D tilt and the entrance are a single scrubbed animation. */}
        <div className="project__card">
          <div className="project__media-col">
            <ProjectCover
              name={project.name}
              shortName={project.shortName}
              year={project.year}
              image={project.image}
            />
          </div>

          <div className="project__body">
            <span className="tag tag--accent project__label">
              <Icon name="sparkle" />
              {project.label}
            </span>

            <h3 className="project__name">{project.name}</h3>

            <p className="project__team mono">{project.team}</p>

            <p className="project__description">{project.description}</p>

            <ul className="project__highlights">
              {project.highlights.map((highlight) => (
                <li key={highlight}>
                  <Icon name="target" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            {project.tags.length > 0 && (
              <ul className="project__tags" aria-label="Technologies used in this project">
                {project.tags.map((tag) => (
                  <li key={tag} className="tag">
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <div className="project__actions">
              <ActionButton
                variant="primary"
                href={project.liveUrl}
                configKey="projects[0].liveUrl"
                icon="arrowUpRight"
              >
                View Project
              </ActionButton>

              <ActionButton
                variant="secondary"
                href={project.repoUrl}
                configKey="projects[0].repoUrl"
                icon="arrowUpRight"
              >
                View Code
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}