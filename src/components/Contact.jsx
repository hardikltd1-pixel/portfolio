import ActionButton from './ActionButton'
import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { profile } from '../config/profile'

const channels = [
  {
    key: 'github',
    label: 'GitHub',
    icon: 'github',
    hint: 'See the code behind this site and my projects',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'linkedin',
    hint: 'Connect with me professionally',
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'mail',
    hint: 'The quickest way to reach me',
    prefix: 'mailto:',
  },
]

export default function Contact() {
  const { contact } = profile

  return (
    <section
      id="contact"
      className="section section--tint contact"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <div className="contact__wrap">
          <SectionHeading
            index="08"
            titleId="contact-title"
            eyebrow="Contact"
            title={contact.heading}
            lead={contact.text}
            className="contact__heading"
          />

          <Reveal
            className="contact__card"
            variant="scale"
            delay={120}
          >
            <ul className="contact__channels">
              {channels.map((channel, index) => {
                const value = profile[channel.key]

                const href = channel.prefix
                  ? channel.prefix + value
                  : value

                return (
                  <Reveal
                    as="li"
                    key={channel.key}
                    delay={index * 110}
                    className="contact__channel"
                  >
                    <ActionButton
                      className="contact__button btn--block"
                      variant="secondary"
                      href={href}
                      configKey={channel.key}
                      icon="arrowUpRight"
                    >
                      <span className="contact__button-label">
                        <Icon name={channel.icon} />
                        <span>{channel.label}</span>
                      </span>
                    </ActionButton>

                    <p className="contact__hint">
                      {channel.hint}
                    </p>
                  </Reveal>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}