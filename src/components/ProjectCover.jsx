import { useInView } from '../hooks/useInView'

/**
 * Project preview panel.
 *
 * If `image` is set in config/profile.js it renders a real screenshot.
 * Otherwise it renders a designed abstract cover — a crop leaf inside a
 * scan frame — clearly labelled as a graphic placeholder so it never reads
 * as a real screenshot it isn't.
 */
export default function ProjectCover({ name, year, image, shortName }) {
  const { ref, isInView } = useInView({ threshold: 0.3 })

  if (image) {
    return (
      <figure className="project__media" ref={ref}>
        <div className="project__media-inner">
          <img
            src={image}
            alt={`Screenshot of the ${name} project interface`}
            loading="lazy"
            decoding="async"
            data-in-view={isInView}
          />
        </div>
        <figcaption className="project__media-caption mono">{shortName}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="project__media" ref={ref}>
      <div className="project__mock" data-in-view={isInView}>
        <span className="project__mock-grid" aria-hidden="true" />

        {/* corner brackets */}
        <span className="project__mock-corner project__mock-corner--tl" aria-hidden="true" />
        <span className="project__mock-corner project__mock-corner--tr" aria-hidden="true" />
        <span className="project__mock-corner project__mock-corner--bl" aria-hidden="true" />
        <span className="project__mock-corner project__mock-corner--br" aria-hidden="true" />

        <svg className="project__mock-leaf" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 19c0-8 4.6-13 15-13 0 9.4-4.6 13.6-11 13.6a5.4 5.4 0 0 1-4-.6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 19c2.4-3.4 5.2-6 9-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M9.5 14.4 9 10.8M13 11.6l-.4-3.2M15.6 12.4l3.4.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>

        <span className="project__mock-scan" aria-hidden="true" />

        <figcaption className="project__mock-caption">
          <span className="mono">{shortName}/</span>
          <span className="mono project__mock-meta">
            image-based analysis · {year}
          </span>
          <span className="project__mock-note">graphic placeholder</span>
        </figcaption>
      </div>
      <figcaption className="project__media-caption mono">
        Add a real screenshot → drop it in <code>/public</code> and set{' '}
        <code>projects[].image</code> in <code>src/config/profile.js</code>.
      </figcaption>
    </figure>
  )
}