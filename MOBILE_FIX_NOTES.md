# Portfolio mobile + performance fix

## What was fixed

1. **Phone layout**
   - Phones/touch devices no longer run the cinematic sticky monitor intro.
   - The hero becomes a normal document section on mobile, so the whole page can scroll normally.
   - The navbar switches to the hamburger menu for touch devices even when a browser reports a wider CSS viewport.

2. **Slow scrolling**
   - Lenis is disabled on touch/coarse-pointer devices, leaving native touch scrolling in control.
   - Desktop Lenis duration was reduced from 1.15s to 0.72s.
   - Scroll-linked GSAP effects are disabled on touch devices.

3. **Slow/laggy animations**
   - Mobile GSAP reveal animations are skipped and content is shown directly.
   - Desktop scroll-reveal scrub was reduced from 0.9 to 0.45.
   - The hero video uses `preload="metadata"` instead of eagerly loading the full video.
   - The desktop cinematic intro remains available on mouse/trackpad devices.

4. **Responsive navigation**
   - Touch devices always get the mobile navigation behavior.
   - The desktop navigation remains available on normal laptop/desktop pointers.

## Files changed

- `src/hooks/useRoomIntro.js`
- `src/lib/lenis.js`
- `src/lib/gsap.js`
- `src/components/Hero.jsx`
- `src/components/ScrollFX.jsx`
- `src/hooks/useScrollReveal.js`
- `src/styles/navbar.css`
- `src/styles/room.css`
- `src/styles/fx.css`
- `src/styles/base.css`

## Step-by-step

### 1. Back up your current project

Keep your current project folder unchanged until the fixed version is working.

### 2. Replace the project files

Extract this ZIP. Copy its `portfolio` contents into your existing project, replacing the files/folders when prompted.

Do **not** copy the old `node_modules` folder from your original project.

### 3. Install dependencies

Open a terminal in the project folder:

```bash
npm install
```

### 4. Test locally

Run:

```bash
npm run dev
```

Open the local Vite URL on:
- laptop/desktop
- your phone

On the phone, the room/monitor intro is intentionally skipped. The actual portfolio starts immediately, which is the important performance fix.

### 5. Build for production

```bash
npm run build
```

If this succeeds, test the production build:

```bash
npm run preview
```

### 6. Deploy to Vercel

If the project is already connected to Vercel, push the changed files to Git:

```bash
git add .
git commit -m "Fix mobile layout and animation performance"
git push
```

Vercel should redeploy automatically.

## Important

The ZIP intentionally excludes `.git` and `node_modules`. This keeps the project clean and avoids copying platform-specific binaries. Always run `npm install` on the machine where you deploy/build.

The mobile version intentionally removes the heavy cinematic monitor intro. That is deliberate: the intro combines sticky positioning, video, blur/mix-blend effects and scroll-linked JavaScript. Keeping it on touch devices is exactly the kind of work that can make scrolling feel delayed.
