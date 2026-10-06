/**
 * ============================================================================
 *  PROFILE CONFIG  —  the ONLY file you need to edit to personalise this site
 * ============================================================================
 *
 *  How placeholders work
 *  ---------------------
 *  Any value written as [SOMETHING IN BRACKETS] is treated as "not filled in
 *  yet". Buttons that point at a placeholder will not navigate anywhere —
 *  instead they show a small notice telling you which line to edit here.
 *  Fill the value in (e.g. github: 'https://github.com/yourhandle') and the
 *  link starts working immediately.
 *
 *  Keep this file free of React/JSX so it stays easy to read and edit.
 */

export const profile = {
  /* ---------------------------------------------------------------- identity */
  name: 'Hardik Goel',
  /** Short name used in the hero heading. Falls back to `name` if left empty. */
  shortName: 'Hardik Goel',
  college: '[YOUR COLLEGE]',
  degree: 'B.Tech',
  year: 'First Year',
  location: '[Delhi, OPTIONAL]',
  /** Optional portrait, e.g. '/me.jpg'. Drop the file in /public. */
  photo: '',

  /**
   * Optional résumé / CV link. Leave '' and the button stays hidden —
   * only set it to a real file in /public.
   */
  resume: '',

  /* ------------------------------------------------------------------ links */
  github: 'https://github.com/hardikltd1-pixel',
  linkedin: 'https://www.linkedin.com/in/hardik-goel-841920387/',
  email: 'hardikltd1work@gmail.com',

  /* ------------------------------------------------------------------- hero */
  hero: {
    status: 'Currently building & learning',
    roles: ['B.Tech Student', 'Developer', ' Learner'],
    intro:
      "I'm a first-year B.Tech student learning by building real projects with C and Python.",
    highlight: 'Currently learning. Constantly building.',
    terminal: [
      { prompt: 'who_am_i', value: 'Hardik Goel' },
      { prompt: 'focus', value: 'learning + building' },
      { prompt: 'currently', value: 'C / Python' },
      { prompt: 'goal', value: 'build something useful' },
    ],
  },

  /* ------------------------------------------------------------------ about */
  about: {
    heading: 'About Me',
    paragraphs: [
      "I'm a first-year B.Tech student exploring software development and learning by building projects. I'm currently strengthening my fundamentals in C and Python while exploring web development and practical problem solving.",
      'I like understanding how things actually work under the hood — writing the code, breaking it, fixing it, and rebuilding it properly. Most of what I know so far, I learned by making small things that did not work at first.',
    ],
    cards: [
      {
        index: '01',
        title: 'Learning by building',
        body: 'Concepts stick when I ship something small and real, not when I only read about them.',
      },
      {
        index: '02',
        title: 'Exploring technology',
        body: 'Staying curious across systems, tools and languages instead of chasing one tool.',
      },
      {
        index: '03',
        title: 'Growing every project',
        body: 'Each project teaches me something the last one did not. That is the whole plan so far.',
      },
    ],
  },

  /* ----------------------------------------------------------------- skills */
  /**
   * `status` is shown as a small pill. Honest wording only:
   * 'Learning' | 'Practising' | 'Exploring'
   *
   * `exploring: true` moves a card into the "Exploring" group.
   *
   * `focus` (0–1) only controls the width of the little bar on each card.
   * It is a visual weight, NOT a claimed proficiency — set it to whatever
   * looks right, or delete the line and the bar falls back to the status.
   */
  skills: [
    {
      id: 'c',
      name: 'C',
      status: 'Practising',
      icon: 'terminal',
      focus: 0.78,
      description:
        'The language I am grounding myself in — pointers, memory, data structures and writing programs that actually compile.',
    },
    {
      id: 'python',
      name: 'Python',
      status: 'Practising',
      icon: 'python',
      focus: 0.72,
      description:
        'My main tool for scripts, automation and experiments. Where most of my project work starts.',
    },
    {
      id: 'git',
      name: 'Git',
      status: 'Learning',
      icon: 'git',
      focus: 0.5,
      description:
        'Branches, clean commits, and understanding that version history is documentation.',
    },
    {
      id: 'github',
      name: 'GitHub',
      status: 'Learning',
      icon: 'github',
      focus: 0.55,
      description:
        'Where I keep my code, notes and the record of what I have been working on.',
    },
    {
      id: 'html',
      name: 'HTML',
      status: 'Exploring',
      icon: 'code',
      focus: 0.45,
      description:
        'Structure and semantics first — building the markup before worrying about looks.',
      exploring: true,
    },
    {
      id: 'css',
      name: 'CSS',
      status: 'Exploring',
      icon: 'layers',
      focus: 0.48,
      description:
        'Layout, responsive design and the animation work behind this very site.',
      exploring: true,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      status: 'Exploring',
      icon: 'braces',
      focus: 0.42,
      description:
        'Logic in the browser, DOM events, and the interactivity you are scrolling through.',
      exploring: true,
    },
  ],

  /* ---------------------------------------------------------------- project */
  projects: [
    {
      id: 'crop-disease-detection',
      featured: true,
      label: 'Featured Project',
      name: 'Crop Disease Detection App',
      shortName: 'crop-disease',
      team: 'Built with my team',
      description:
        'A crop-focused application developed with my team for Smart India Hackathon, exploring technology to help identify crop diseases using image-based analysis.',
      /** Only list a tag if it is genuinely true for the project. */
      tags: ['Python'],
      highlights: [
        'Our team was selected in the first round of Smart India Hackathon.',
        'The work is ongoing — this is the version we started with.',
      ],

      /** Live website URL */
      liveUrl: 'https://hardikltd1-pixel.github.io/crop_app/',

      /** GitHub repository URL */
      repoUrl: 'https://github.com/hardikltd1-pixel/crop_app',

      /**
       * Optional: drop a screenshot in /public and reference it here, e.g. '/project-crop.png'.
       * When empty, a built-in SVG cover is rendered instead.
       */
      image: '',
      year: '2026',
    },
  ],

  /* ------------------------------------------------------------ achievement */
  achievement: {
    heading: 'Built for Smart India Hackathon',
    badge: 'Smart India Hackathon',
    title: 'Team selected in SIH Round 1',
    description:
      'Our team was selected in the first round of Smart India Hackathon for the crop disease detection app. That is where the project is right now — the next round is not something I can claim yet, so I am not claiming it.',
    steps: [
      { id: 'build', label: 'Build', state: 'done' },
      { id: 'submit', label: 'Submit', state: 'done' },
      { id: 'selected', label: 'Selected — Round 1', state: 'accent' },
    ],
    year: '2026',
  },

  /* --------------------------------------------------------------- journey */
  journey: {
    heading: 'My Journey',
    lead: 'The beginning of the story, not the whole of it.',
    entries: [
      {
        year: '2026',
        title: 'Started learning C & Python',
        body: 'Picked up the fundamentals properly — syntax, logic, debugging, and writing small programs end to end.',
      },
      {
        year: '2026',
        title: 'B.Tech Begins',
        body: 'Started my degree at [YOUR COLLEGE]. Lots of theory ahead; I am trying to keep building alongside it.',
      },
      {
        year: '2026',
        title: 'Built the Crop Disease Detection project',
        body: 'Joined a team for Smart India Hackathon and worked on a crop disease detection app using image-based analysis.',
      },
      {
        year: '2026',
        title: 'Team selected in SIH Round 1',
        body: 'Our team cleared the first round. Real feedback from real reviewers — the useful kind of pressure.',
      },
      {
        year: 'Next',
        title: 'More coming…',
        body: 'Sharpen the fundamentals, finish the project properly, and keep shipping things I can explain.',
        upcoming: true,
      },
    ],
  },

  /* ------------------------------------------------------- learning now */
  currentlyLearning: {
    heading: 'Currently Learning',
    lead: 'What my time is going into right now.',
    cycle: ['Learning', 'Building', 'Improving'],
    items: [
      {
        id: 'c-programming',
        icon: 'terminal',
        title: 'C Programming',
        body: 'Pointers, memory, and data structures done properly instead of quickly.',
      },
      {
        id: 'python',
        icon: 'python',
        title: 'Python',
        body: 'Writing cleaner scripts, using modules properly, and moving past tutorial-sized code.',
      },
      {
        id: 'problem-solving',
        icon: 'braces',
        title: 'Problem Solving',
        body: 'Breaking large problems into small ones, and getting comfortable with the hard ones.',
      },
      {
        id: 'web-development',
        icon: 'code',
        title: 'Web Development',
        body: 'HTML, CSS and JavaScript — including the code behind this portfolio.',
      },
    ],
  },

  /* -------------------------------------------------------------- github */
  githubSection: {
    heading: 'Find My Code',
    text: "I use GitHub to document what I'm learning and the projects I'm building.",
    note: 'Some repositories are still a work in progress — that is the point of putting them up early.',
  },

  /* ------------------------------------------------------------- contact */
  contact: {
    heading: "Let's Connect",
    text: "I'm always interested in learning, building, and connecting with people who enjoy technology.",
  },

  /* -------------------------------------------------------------- footer */
  footer: {
    line: 'Built while learning.',
    note: 'Designed and coded from scratch — no template.',
  },
};

/** Navigation — add or remove items freely; ids must match section ids below. */
export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'project', label: 'Project' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

/** Ordered ids of every section on the page — used by the scroll-spy. */
export const sectionIds = [
  'home',
  'about',
  'skills',
  'project',
  'achievement',
  'journey',
  'learning',
  'github',
  'contact',
];