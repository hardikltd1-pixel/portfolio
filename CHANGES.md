# Mobile + performance fix

## Why the phone was broken
1. The pinned "zoom into the monitor" hero was built for a wide window. On a tall
   phone the monitor in the picture is wider than the screen, so only the middle
   of the page showed, between strips of the room image.
2. Every `.reveal` on the page had its own scrubbed GSAP ScrollTrigger (dozens of
   them), plus Lenis smooth-scroll on top of native touch scrolling.
3. The room layer used blur filters, blend modes and ~20 animated dust motes,
   and was re-rendered at a new scale on every scroll tick. The video and the
   animations also kept running after the room was no longer visible.

## What changed
- `src/lib/device.js` (new): decides "lite" (phone / touch / width <= 900px) vs
  full. Change `LITE_QUERY` there (and in `index.html`) to move the line.
- Lite devices: still room picture + normal hero, native scrolling, one-shot CSS
  reveals, skill bars fill once, no backdrop blur on the navbar.
- Laptops: same zoom intro, but per-frame values are written directly to the few
  elements that need them, the frame is GPU-promoted only while moving, blur and
  blend modes are gone, 10 dust motes instead of 20, and the room + video pause
  once hidden.
- Smaller mobile room image: `public/images/room-m.webp` (37 KB).
