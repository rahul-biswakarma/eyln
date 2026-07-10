# Forge — Learn to build a 3D game engine (Odin + Metal)

An interactive course that takes a web developer from a single triangle to
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

## Curriculum

Six modules, ordered by dependency, 28 lessons total:

1. **Linear Algebra** — vectors, dot/cross products, matrices, the MVP pipeline
2. **Odin** — the systems language, data-oriented design, memory, calling Metal
3. **Procedural Math** — noise, fBm, Voronoi, splines, extrusion
4. **Physics** — game loop, integration, forces, collision
5. **Metal** — GPU model, pipeline objects, runtime shaders, live WGSL/MSL editor
6. **Rendering Capstone** — triangle → 3D camera → terrain → spline walls

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
  lib/          # localStorage-backed progress store
odin-examples/  # runnable Odin+Metal programs (not built by the site)
```

The `engine/` math mirrors Odin's `core:math/linalg` conventions (column-major,
right-handed) so the browser demos and the shown Odin code agree.
