# The Architect's Universe

An immersive 3D portfolio for **Vishnu Priyan** — Solution & Infrastructure Architect.
The visitor flies a continuous camera path through deep space; six celestial stops tell
the story of a career: an origin planet, a skill constellation, a project forge, a
satellite belt, a monolith, and a last moon with a working transmission relay.

Built with Next.js 16 · React 19 · Three.js / React Three Fiber · GSAP · Framer Motion · Lenis · Tailwind v4.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Edit your content (no code required)

All copy and data live in `src/data/` — the site is CMS-ready by construction:

| File | Controls |
|---|---|
| `profile.json` | Name, role, bio, principles, email, LinkedIn/GitHub URLs |
| `skills.json` | Skill stars, groups/colors, constellation connections |
| `projects.json` | Project stations — challenge, architecture, stack, outcomes, lessons, diagram path |
| `timeline.json` | Career satellites — companies, periods, achievements |
| `resume.json` | Summary, highlights, certifications |

Content is populated from the master resume (July 2026): CBA, Cognizant,
Wipro, Trianz, SoftwareONE and EY/HCL, with the full ITAM toolchain — Flexera
One, FNMS, SaaS Manager, Data Platform, BigFix/ILMT, Tanium, SCCM, Snow.
Diagrams are plain SVGs in `public/diagrams/`; add one per project and
reference it from `projects.json`.

To add a project: append an object to `projects.json`. A new station spawns in
orbit automatically — geometry, docking camera, and dossier included.

## Controls & easter eggs

- **Scroll** = travel. The right-edge rail jumps between stops.
- **Click a station** (or its card) to dock; `Esc` undocks.
- **Konami code** (↑↑↓↓←→←→BA) engages warp.
- Achievements unlock for beginning the journey, reaching the edge, warping, and transmitting.
- **Soundtrack**: five NCS tracks crossfade by journey zone (Symbolism → Dreams →
  Nevada → Skyline → Cloud 9); the HUD shows what's playing with credit. Drop the
  MP3s into `public/audio/` (see the README there) — without them the site falls
  back to a generative Web Audio drone. Sound is off by default.

## Deploy to Vercel

```bash
npm i -g vercel && vercel
```

or push to GitHub and import the repo at vercel.com — zero config needed.
After deploying, set `metadataBase` in `src/app/layout.tsx` to your domain for
correct Open Graph URLs. To receive contact transmissions by email, wire a
provider (e.g. Resend) into `src/app/api/contact/route.ts` at the marked
integration point; until then submissions are logged server-side and the
"hail directly" mailto link covers the gap.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design system, scene graph,
animation model, performance strategy, and accessibility notes.
