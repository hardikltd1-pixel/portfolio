# Personal Developer Portfolio

A single-page portfolio for a first-year B.Tech student learning by building.
React + Vite, plain CSS, and **GSAP + ScrollTrigger** for scroll-linked motion.

Ships with a full **light and dark theme**, driven by your system preference on
first visit and remembered afterwards. All colour comes from design tokens, so
the whole palette can be re-skinned from one file.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Theming

### Changing the accent colour

Every accent is derived from four brand tokens at the top of
**`src/styles/tokens.css`**:

```css
:root {
  --brand-indigo: #6366f1;
  --brand-violet: #8b5cf6;
  --brand-coral:  #fb7185;
  --brand-amber:  #f59e0b;
}
```

Change those four values and the gradients, glows, meters, buttons, focus rings
and highlights all follow. Everything else — surfaces, text, borders, shadows —
is a semantic token (`--bg-base`, `--text-1`, `--line`, …) defined once for dark
and overridden once for light.

### Light and dark

- `src/hooks/useTheme.js` resolves the initial theme from
  `localStorage["portfolio-theme"]`, falling back to `prefers-color-scheme`.
- `index.html` runs a tiny pre-paint script so there is no flash of the wrong
  theme before React mounts.
- The choice persists and survives reloads; `<meta name="theme-color">` follows.
- Colours transition over 0.4s when the theme is switched.

---

## Animation

GSAP is registered once in `src/lib/gsap.js` (ScrollTrigger included). The rest
is split so nothing fights over the same transform:

| File | Role |
| --- | --- |
| `src/hooks/useScrollReveal.js` | Per-element reveals, scrubbed to scroll position so they reverse when you scroll back up |
| `src/components/ScrollFX.jsx` | Section-level effects: hero fade/scale, skill meters, timeline draw, contact float |
| `src/styles/fx.css` | Cursor glow, magnetic buttons, card tilt, hero blobs, loader, theme toggle |
| `src/components/Reveal.jsx` | Wrapper that picks GSAP or the plain `IntersectionObserver` fallback |

Everything animated is `transform`/`opacity` only, so motion stays on the
compositor and never triggers layout.

### Reduced motion

`src/hooks/useReducedMotion.js` is respected by every effect. With
`prefers-reduced-motion: reduce`:

- reveals resolve immediately instead of animating,
- the page loader, cursor glow and hero typing are skipped,
- skill meters render at their final width,
- the roles line shows as static text.

### Without JavaScript

Reveal styles are gated behind `.has-gsap`, which is only added when GSAP loads.
With JS off the content is simply visible rather than stuck at `opacity: 0`.

---

## Editing it — one file first

**`src/config/profile.js` is the only file you need to touch to make this yours.**

Any value written as `[SOMETHING IN BRACKETS]` is treated as "not filled in
yet". A button pointing at a placeholder will not navigate anywhere — it shows a
small notice telling you exactly which key to set:

```
This link is still a placeholder. Open src/config/profile.js and set github to your real URL.
```

Fill the value in and the link starts working immediately. Nothing else to change.

### The keys you probably want to edit

| Key | What it drives |
| --- | --- |
| `name`, `shortName` | Hero heading, footer, `<title>` |
| `college`, `degree`, `year`, `location` | Hero meta strip + About signature |
| `github`, `linkedin`, `email` | Every GitHub / LinkedIn / Email button on the page |
| `photo` | Optional portrait in About. Drop the file in `public/`, use `'/me.jpg'`. Empty = hidden |
| `resume` | Optional "Résumé" button in the hero. Empty = hidden |
| `hero.*` | Status pill, role line, intro, highlight line, terminal commands |
| `about.*` | About paragraphs and the three numbered cards |
| `skills[]` | Skill cards. `status` is shown as a pill — keep it honest (`Learning`, `Practising`, `Exploring`) |
| `projects[]` | The featured project card |
| `achievement.*` | SIH section |
| `journey.entries[]` | Timeline entries |
| `currentlyLearning.*` | "Currently Learning" cards |
| `githubSection.*` | GitHub section copy |
| `contact.*`, `footer.*` | Contact + footer copy |

### Things the site deliberately does **not** contain

No invented statistics, no GitHub commit/repo/star counts, no testimonials, no
employers, no "years of experience", no invented technologies on the project.
The SIH entry says **team selected in Round 1** and nothing more, because that
is what happened.

If you add a technology you actually used, add it to `projects[0].tags` — the
card renders whatever you list, and nothing else.

---

## Project structure

```
portfolio/
├── index.html                 Document shell, fonts, <noscript> fallback
├── vite.config.js
├── public/
│   └── favicon.svg            Swap for your own mark if you want
└── src/
    ├── main.jsx
    ├── App.jsx                Section order + stylesheet imports
    │
    ├── config/
    │   └── profile.js         ← all personal content lives here
    │
    ├── components/            One component per section
    │   ├── Navbar.jsx             sticky nav, scroll-spy, mobile drawer
    │   ├── ScrollProgress.jsx     top reading-progress bar
    │   ├── Hero.jsx               hero + staggered entrance
    │   ├── TerminalCard.jsx       typing terminal
    │   ├── About.jsx
    │   ├── Skills.jsx
    │   ├── FeaturedProject.jsx
    │   ├── ProjectCover.jsx       screenshot, or a designed abstract cover
    │   ├── Achievement.jsx        SIH
    │   ├── Timeline.jsx
    │   ├── CurrentlyLearning.jsx
    │   ├── GithubSection.jsx
    │   ├── Contact.jsx
    │   ├── Footer.jsx
    │   ├── ActionButton.jsx       one button, three behaviours
    │   ├── Reveal.jsx             scroll-reveal wrapper
    │   ├── SectionHeading.jsx
    │   └── Icon.jsx               inline SVG icon set
    │
    ├── hooks/
    │   ├── useInView.js            IntersectionObserver reveal
    │   ├── useReducedMotion.js     prefers-reduced-motion
    │   ├── useActiveSection.js     navbar scroll-spy
    │   ├── useScrolled.js          navbar solid/blur state
    │   ├── useTerminalSequence.js  typewriter
    │   └── useNotice.jsx           placeholder-link notices
    │
    ├── lib/
    │   ├── links.js                placeholder detection
    │   └── scroll.js               smooth scroll + progress maths
    │
    └── styles/
        ├── tokens.css              every colour, font, radius, easing
        ├── base.css                reset + typography + utilities
        ├── ui.css                  buttons, cards, tags, reveal, notice
        └── <one file per section>
```

### How a button works

`ActionButton` picks its behaviour from its props, so no button can be dead:

| Props | Behaviour |
| --- | --- |
| `scrollTo="project"` | Smooth-scrolls to a section on this page |
| `href="https://…"` | Opens the real link in a new tab |
| `href="[PLACEHOLDER]"` | Explains which config key to set |
| `href` missing | Same as above, with a sensible `configKey` |

### How the animations work

- `.reveal` starts transparent and offset; `useInView` flips `data-in-view`
  when the element first crosses the viewport, then **stops observing** — so
  scrolling back up never re-plays a burst of animation, and fast scrolling
  never queues a backlog.
- Staggering comes from `--reveal-delay` (a CSS custom property), not from JS
  timers.
- Only `opacity` and `transform` animate, so everything stays on the
  compositor.
- Variants: `up` (default), `left`, `right`, `scale`, `zoom`, `fade`. Under
  860px the sideways ones fall back to `up` so nothing pushes off-canvas.

---

## Customising the look

Almost everything visual is a token in `src/styles/tokens.css`:

```css
--brand-indigo: #6366f1;  /* accent pair, stop 1 */
--brand-violet: #8b5cf6;  /* accent pair, stop 2 */
--brand-coral:  #fb7185;  /* warm accent, stop 1 */
--brand-amber:  #f59e0b;  /* warm accent, stop 2 */

--bg-base: #0f1020;       /* dark page background */
--text-1: #eceef8;        /* dark primary text */
--fs-display: clamp(...);/* fluid heading sizes */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Swap the brand pair for a cyan (`#5eead4`), a rose, anything — the gradients,
glows, meters and buttons all follow. Section backgrounds use `--bg-base`,
`--bg-raised` and `--bg-inset` so chapters stay visually distinct. The light
theme overrides the same semantic names under `:root[data-theme='light']`.

Typography: Space Grotesk (headings) + Inter (body) + JetBrains Mono (code),
loaded from Google Fonts with system-font fallbacks.

---

## Accessibility

- Semantic landmarks, one `<h1>`, ordered `<h2>`/`<h3>`, `aria-labelledby` on every section.
- Skip-to-content link, visible 2px accent focus ring on every interactive element.
- Hamburger menu: `aria-expanded`, `aria-controls`, Escape to close, focus returns to the toggle.
- Mobile menu links are removed from the tab order while closed.
- Full `prefers-reduced-motion` support: reveals show immediately, the typewriter
  prints all lines at once, the drifting glow / scanline / floating trophy stop,
  and smooth scrolling becomes instant.
- Works without JavaScript — a `<noscript>` block with your details plus plain
  `.no-js` styles make sure no section stays invisible.

---

## Deploying

```bash
npm run build     # → dist/
```

`dist/` is plain static files. Upload it to Netlify, Vercel, GitHub Pages,
Cloudflare Pages — anything that serves files. There is no server and no
environment variables.

For GitHub Pages, add to `vite.config.js`:

```js
base: '/your-repo-name/',
```

---

## Adding a second project

`projects[]` is already an array and the featured card reads
`projects.find(p => p.featured)`. For now there is one project section; to add
more, render them in a loop inside `FeaturedProject.jsx` and set `featured: true`
on whichever should own the big card.