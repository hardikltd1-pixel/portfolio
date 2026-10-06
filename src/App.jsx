import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import PageLoader from './components/PageLoader'
import PointerFX from './components/PointerFX'
import ScrollFX from './components/ScrollFX'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import FeaturedProject from './components/FeaturedProject'
import Achievement from './components/Achievement'
import Timeline from './components/Timeline'
import CurrentlyLearning from './components/CurrentlyLearning'
import GithubSection from './components/GithubSection'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { NoticeProvider } from './hooks/useNotice'
import { useSmoothScroll } from './hooks/useSmoothScroll'

import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/fx.css'
import './styles/navbar.css'
import './styles/hero.css'
import './styles/room.css'
import './styles/about.css'
import './styles/skills.css'
import './styles/project.css'
import './styles/achievement.css'
import './styles/timeline.css'
import './styles/learning.css'
import './styles/github.css'
import './styles/contact.css'
import './styles/footer.css'

export default function App() {
  useSmoothScroll()

  return (
    <NoticeProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <PageLoader />

      {/* Scroll-linked (reversible) animation and pointer hover FX. */}
      <ScrollFX />
      <PointerFX />

      <ScrollProgress />
      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <Skills />
        <FeaturedProject />
        <Achievement />
        <Timeline />
        <CurrentlyLearning />
        <GithubSection />
        <Contact />
      </main>

      <Footer />
    </NoticeProvider>
  )
}