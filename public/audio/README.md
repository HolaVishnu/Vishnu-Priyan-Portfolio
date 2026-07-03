# Soundtrack files

The site expects these six MP3s (all from https://ncs.io — free with attribution).
Filenames must match exactly:

| File | Track | Zone |
|---|---|---|
| `symbolism.mp3` | Symbolism — Electro-Light | Landing screen |
| `dreams.mp3`    | Dreams — Lost Sky | About → Skills (drift & wonder) |
| `comet.mp3`     | Comet — Keepsake & Skybreak | Skills → Projects (energetic surge) |
| `sky.mp3`       | Sky — Sensai & Masopi | Projects → Timeline (serene reflection) |
| `skyline.mp3`   | Skyline — Kovan & Electro-Light | Timeline → Resume (cinematic sweep) |
| `cloud9.mp3`    | Cloud 9 — Itro & Tobu | Resume → Contact (euphoric arrival) |

Without the files the site falls back to its built-in generative ambient drone — nothing breaks.

**Attribution:** NCS requires credit. The HUD shows "Title · Artist · NCS" while a track plays.
Verify exact artist credits on each track's NCS download page and correct the `artist` fields
in `src/data/soundtrack.json` if they differ.
