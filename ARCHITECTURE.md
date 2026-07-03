# Architecture — The Architect's Universe

## Concept model

One world, one camera, one scroll. The entire site is a single WebGL scene
(~310 world units deep) and a single fixed-position canvas. Scrolling does not
move a page — it moves the **camera** along a Catmull-Rom spline. DOM overlays
(the holographic panels) fade in when the camera enters a stop's progress
window. The visitor is never "on a section"; they are *near a place*.

```
progress 0.00 ──────────────────────────────────────────────▶ 1.00
   │        .14        .30        .47        .64      .80      .95
 launch   ORIGIN   CONSTELLATION  FORGE    K-BELT  MONOLITH  LAST MOON
          (about)    (skills)   (projects) (career) (resume) (contact)
```

## Folder structure

```
src/
├── app/
│   ├── layout.tsx            fonts, SEO metadata, viewport
│   ├── page.tsx              renders <Universe/>
│   ├── globals.css           design tokens + recurring surfaces
│   ├── icon.svg              favicon (orbit monogram)
│   ├── resume/               print-optimised resume route (+ PrintButton)
│   └── api/contact/route.ts  transmission endpoint (validated POST)
├── components/
│   ├── Universe.tsx          client shell: canvas + overlay + scroll runway
│   ├── ScrollManager.tsx     Lenis instance → store.progress
│   ├── canvas/               everything inside <Canvas>
│   │   ├── Scene.tsx         composition root (lights, fog, setpieces)
│   │   ├── CameraRig.tsx     spline flight + docking + pointer parallax
│   │   ├── Effects.tsx       bloom, DoF, chromatic aberration, vignette
│   │   ├── Galaxy.tsx        26k-point spiral, differential rotation shader
│   │   ├── Starfield.tsx     3.5k twinkling stars, warp uniform
│   │   ├── Nebula.tsx        additive fbm billboards
│   │   ├── Planet.tsx        reusable procedural planet (+atmosphere, +ring)
│   │   ├── Asteroids.tsx     instanced belt (1 draw call)
│   │   ├── SkillConstellation.tsx  data-driven stars + constellation lines
│   │   ├── Stations.tsx      orbiting project stations (clickable)
│   │   ├── Satellites.tsx    career satellites
│   │   ├── Monolith.tsx      1:4:9 resume artifact
│   │   └── ContactMoon.tsx   moon + transmission beam
│   └── dom/                  everything outside <Canvas>
│       ├── Landing.tsx       boot sequence → name reveal (GSAP) → CTA
│       ├── Hud.tsx           telemetry + journey rail (signature element)
│       ├── SectionShell.tsx  shared panel frame per stop
│       ├── sections/         About, Skills, Projects, Timeline, Resume, Contact
│       ├── ProjectDossier.tsx docking modal
│       ├── MagneticButton.tsx, Cursor.tsx, Achievements.tsx, EasterEggs.tsx
├── lib/
│   ├── journey.ts            stops, world anchors, spline math   ← single source of truth
│   ├── store.ts              zustand state (phase, progress, focus, audio…)
│   ├── useSection.ts         visibility hook (transient subscription)
│   ├── sound.ts              generative Web Audio engine
│   ├── quality.ts            device heuristic (high/low)
│   ├── achievements.ts       achievement definitions
│   └── stationRegistry.ts    per-frame station positions for docking camera
├── shaders/                  GLSL as typed template strings
│   ├── noise.ts              shared 2D/3D value-noise + fbm chunks
│   └── galaxy / starfield / planet / atmosphere / nebula / beam / ring
└── data/                     the "CMS" — profile, skills, projects, timeline, resume
```

## State management

A single zustand store (`lib/store.ts`) is the spine:

- `phase`: `boot → landing → journey` (drives landing overlay, scroll lock, HUD)
- `progress` + `velocity`: written by Lenis ~60×/s, read by the camera rig and HUD
- `activeSection` / `focusedProject`: what's near / what's docked
- `transmission`: `idle → sending → sent` (contact form ↔ 3D beam)
- `quality`, `reducedMotion`, `warp`, `unlocked` achievements

Two subscription styles keep it fast:
- **React selectors** for things that should re-render (panels, modals).
- **Transient subscriptions** (`store.subscribe` → write to refs / uniforms)
  for 60 fps consumers: HUD telemetry text, camera rig, star warp uniform.
  Scroll never causes a React render outside visibility flips.

## Animation system

| Layer | Tool | Used for |
|---|---|---|
| Camera | Catmull-Rom spline + `maath` damping | the journey itself; piecewise-linear knot remap makes each stop land exactly at its scroll progress |
| Scroll | Lenis (`lerp 0.09`) | momentum; programmatic `scrollTo` for rail navigation and the post-CTA launch |
| DOM entrances | Framer Motion `AnimatePresence` | section panels, dossier, toasts |
| Landing name | GSAP stagger | per-letter debris-assembly reveal |
| Ambient 3D | `useFrame` + shader `uTime` | rotation, twinkle, orbit, beam pulse |

The **docking sequence** is choreography across layers: click → store.`focusedProject`
→ camera rig re-targets the live station position (registry) → Lenis pauses →
dossier panel enters after a 0.55 s delay so the flight reads before the UI does.

## Design system

Tokens (globals.css, Tailwind v4 `@theme`):
- **Color** — void `#05060F`, midnight `#0C1230`, nebula `#7B5CFF`, magenta `#C86BFF`, cyan `#4FF2FF`, star `#F4F7FF`, dim `#7E87AD`. Aurora gradient = cyan→nebula→magenta, reserved for the headline word and outcome metrics.
- **Type** — Syne (display, architectural), Instrument Sans (body), IBM Plex Mono (telemetry/eyebrows, `0.25–0.35em` tracking).
- **Surfaces** — `.holo-panel` (gradient glass + blur) with `.holo-corners`
  bracket ticks: the telemetry-frame motif that unifies every panel, toast and modal.
- **Signature element** — the mission HUD: live DEST/POS/VEL readouts computed
  from the actual camera spline, plus the journey rail. The interface itself
  insists you are travelling, not scrolling.

## Performance strategy

- Procedural everything: zero textures, zero GLTF, zero Draco payloads — the
  heaviest "asset" is math. First-load 3D cost is code, not downloads.
- `dynamic(() => import(Scene), { ssr: false })`: the WebGL bundle code-splits
  away from the SSR'd document; landing text is server-rendered for SEO/LCP.
- Instanced asteroids (220 rocks = 1 draw call); points-based galaxy/starfield.
- Device heuristic (`quality.ts`) halves particle counts, drops DoF and clamps
  DPR to 1 on low-end/coarse-pointer devices; `AdaptiveDpr` degrades under load.
- `multisampling: 0` + `antialias: false` (bloom hides aliasing), fogExp2 culls
  distant detail perceptually.
- Transient store subscriptions keep scroll off the React commit path.

## SEO & accessibility

- Full metadata (OpenGraph/Twitter), semantic landmarks, static prerender of
  all text content; `/resume` is a crawlable, printable plain document.
- Canvas is `aria-hidden`; every 3D interaction has a DOM equivalent
  (station click ↔ project card, constellation ↔ skill list).
- `prefers-reduced-motion` disables parallax, letter animation and drift.
- Keyboard: journey rail buttons, `Esc` to undock, focus-visible rings,
  `autoFocus` on modal close buttons. Sound is opt-in.

## Deliberate trade-offs

- **Leva** is installed as a dev dependency but not mounted — tuning happened
  during development; shipping a debug panel contradicts the premium brief.
- **Motion One** was dropped in favour of Framer Motion alone: one motion
  vocabulary, less JS.
- Depth of field runs only on `quality: "high"`; on weak GPUs bloom + fog
  carry the cinematic depth at a stable frame rate.
