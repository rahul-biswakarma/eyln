# Forge — Learn to build a 3D game engine (Odin + Metal)

An interactive course that takes a programmer from a single triangle to
procedural, Tiny-Glade-style terrain and walls — built by hand in **Odin + Metal**
on macOS. Live demos run in the browser with **WebGPU** (conceptually ~1:1 with
Metal); every lesson also shows the equivalent **Odin + Metal** code to run locally.

## Run the site

```bash
pnpm install
pnpm dev       # http://localhost:5175
pnpm build     # type-check + production build
```

Live 3D demos need a WebGPU-capable browser (Chrome/Edge, or Safari 18+ on macOS).
2D widgets, math, quizzes, and code work everywhere.

## AI coaching (optional)

Forge has an optional AI layer — open-ended answer grading, "explain my mistake"
on quizzes, a proactive study coach on the dashboard, and a per-lesson Q&A tutor.
It uses the Gemini API. Copy `.env.example` to `.env` and set:

```bash
VITE_GEMINI_API_KEY=your_key   # from https://aistudio.google.com/apikey
```

Without a key the whole course still works — those features fall back to
rule-based grading/guidance. Note: a browser-embedded key is visible in devtools,
so this is intended for local/personal use (all state is in localStorage).

## Notes, bookmarks & reminders

Bookmark any lesson (☆), capture notes (✎) — optionally quoting highlighted text
and tagging them — and schedule review reminders. Everything is browsable on the
**Notes** page and persisted to localStorage. Due reminders surface as a badge on
the top-nav bell and, if you grant permission, as browser notifications.

## Curriculum

Nine modules, ordered by dependency:

1. **Linear Algebra** — vectors, dot/cross products, matrices, MVP, quaternions, clip space
2. **Odin** — the systems language, data-oriented design, memory, allocators & arenas, calling Metal
3. **Procedural Math** — noise, fBm, Voronoi, splines, extrusion
4. **Physics** — game loop, integration, forces, collision
5. **Metal** — GPU model, pipeline objects, runtime shaders, live WGSL/MSL editor
6. **Rendering Capstone** — triangle → 3D camera → terrain → spline walls
7. **Lighting & Shading** — normals, diffuse/specular, a PBR primer
8. **Textures & Sampling** — UVs, samplers/filtering, mipmaps & atlases
9. **Optimization & Profiling** — frame budget, batching/instancing, culling

Modules are topologically sorted by their `dependsOn` edges, so the curriculum
always reads in a valid order even as modules are added.

## Local Odin + Metal examples

Runnable companions to the capstone live in [`odin-examples/`](./odin-examples).
They compile shaders **at runtime** (`newLibraryWithSource`), so they need only the
Xcode Command Line Tools — no full Xcode. See that folder's README.

```bash
cd odin-examples/01-triangle && odin run .
```

## Structure

```
src/
  content/      # Module/Lesson types + the registry that orders the curriculum
  modules/      # one folder per module; each exports a Module descriptor
  components/   # LessonLayout, CodeBlock (WGSL|MSL|Odin tabs), Quiz, Exercise, Math, WebGPUCanvas
  widgets/      # interactive teaching widgets (vectors, matrices, noise, splines, shader editor, 3D)
  engine/       # shared math (vec/mat), noise, spline, and WebGPU helpers
  lib/          # progress + notes stores, reminder scheduler, Gemini client, study coach
odin-examples/  # runnable Odin+Metal programs (not built by the site)
```

The `engine/` math mirrors Odin's `core:math/linalg` conventions (column-major,
right-handed) so the browser demos and the shown Odin code agree.
