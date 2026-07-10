# Forge — an interactive engineering academy

Forge is an interactive learning platform with three tracks:

- **3D Game Engine** — build a renderer by hand in **Odin + Metal**, from a single
  triangle to procedural, Tiny-Glade-style terrain. Live demos run in the browser
  with **WebGPU**; every lesson also shows the equivalent Odin + Metal code.
- **Data Structures & Algorithms** — complexity, the core data structures, and the
  algorithmic patterns behind them.
- **Mathematics** — functions, limits, calculus, curves, and vector calculus — the
  math underneath both other tracks.

23 modules / 110 lessons in all, each with rigorous prose, KaTeX math, code, and
auto-graded quizzes.

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

## Accounts & cloud sync (optional)

With Firebase configured, Forge adds **Google sign-in** and syncs your progress
(completions, quiz scores, notes, bookmarks, reminders) to **Firestore**, so it
follows you across devices. Copy `.env.example` to `.env` and fill the
`VITE_FIREBASE_*` values from your Firebase web app config (enable Authentication →
Google and Firestore). Without them, the app runs fully on localStorage — single
device, no sign-in. Cloud state is merged with local on sign-in (union of
completions, best scores, newest notes).

## Curriculum

Three tracks, each a set of modules topologically sorted by their `dependsOn`
edges (defined in `src/content/tracks.ts`; modules tagged with a `track`):

**3D Game Engine** — Linear Algebra · Odin · Procedural Math · Physics · Metal ·
Rendering Capstone · Lighting & Shading · Textures & Sampling · Optimization & Profiling

**Data Structures & Algorithms** — Complexity & Big-O · Arrays & Strings ·
Hashing & Maps · Linked Lists/Stacks/Queues · Trees & Heaps · Graphs ·
Sorting & Searching · Recursion & Dynamic Programming

**Mathematics** — Functions & Graphs · Limits & Continuity · Derivatives ·
Integrals · Curves & Parametric Geometry · Vector Calculus

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
  content/      # Module/Lesson/Track types, tracks.ts, and the registry that orders the curriculum
  modules/      # one folder per module; each exports a Module descriptor (dsa/ and math/ are barrels)
  components/   # LessonLayout, CodeBlock (WGSL|MSL|Odin tabs), Quiz, Exercise, Math, WebGPUCanvas
  widgets/      # interactive teaching widgets (vectors, matrices, noise, splines, shader editor, 3D)
  engine/       # shared math (vec/mat), noise, spline, and WebGPU helpers
  lib/          # progress + notes stores, reminder scheduler, Gemini client, study coach,
                # firebase (auth + Firestore sync)
odin-examples/  # runnable Odin+Metal programs (not built by the site)
```

The `engine/` math mirrors Odin's `core:math/linalg` conventions (column-major,
right-handed) so the browser demos and the shown Odin code agree.
