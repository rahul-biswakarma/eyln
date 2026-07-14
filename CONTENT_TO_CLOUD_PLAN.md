# Course content → Cloud (ProseMirror JSON + TipTap v3)

**Goal:** all course material and quizzes live as data in the cloud, not in code. Each
piece of content is a **ProseMirror/TipTap JSON document**, rendered by TipTap v3 with
custom nodes for code blocks, math, notices, widgets/playgrounds, etc. The `.tsx` module
files (`src/modules/*`) are deleted; the app fetches JSON and renders it.

## Feasibility findings (from the current code)

- Content today is `Body: React.FC` JSX using `<M>`/`<MBlock>` (KaTeX), `<Code>` (Shiki),
  `<Notice>`, and **9 interactive widgets** (`src/widgets/*`). → become custom PM nodes.
- Quizzes are already pure data (`{ q, choices, answer, explain }`). → PM node or sidecar.
- Exercises: **233 of 234 `validate()` fns are identical** numeric tolerance checks
  (`Math.abs(parseFloat(s) - EXPECTED) < TOL`); the last is equivalent. → fully serializable
  to `{ expected, tolerance, correctMsg, wrongMsg }`. The 22 `open`/`code-open` exercises are
  LLM-graded (no fn). **So even grading becomes data.**
- Only the 9 widgets must remain as code, referenced by `ref` id from the JSON.

Net: **100% of content, quizzes, and exercise grading serialize to JSON.** Nothing about the
content plane needs to stay in code except the 9 widget implementations.

## Rendering: TipTap v3 static renderer (not a live editor)

The app only *displays* content. Use `@tiptap/static-renderer` (`renderToReactElement`) which
turns PM JSON → React **without instantiating an editor** — smaller bundle, no editing weight.
A live `useEditor` (editable) instance is only needed later if we build an authoring tool.

- Packages (v3, currently `3.27.4`): `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`,
  `@tiptap/starter-kit`, `@tiptap/static-renderer`.
- Custom nodes are mapped via the renderer's `nodeMapping` (node name → React component).

## The document / node model

One PM JSON doc **per lesson**. Standard nodes (`doc`, `paragraph`, `heading`, `bulletList`,
`listItem`, `text`, marks `bold`/`italic`/`code`) come from StarterKit. Custom nodes:

| Node (`name`) | Replaces | `attrs` |
|---|---|---|
| `mathInline` | `<M>` | `{ tex }` |
| `mathBlock` | `<MBlock>` | `{ tex }` |
| `codeSample` | `<Code>` | `{ lang, filename, code, tabs? }` |
| `notice` | `<Notice>` | `{ variant: "info"\|"warn", label }` + inline content |
| `widget` | `src/widgets/*` (atom) | `{ ref: "vector-playground", props }` |
| `exercise` | `<Exercise>` (atom) | `{ id, kind, prompt, starter, hint, rubric, expected?, tolerance?, correctMsg?, wrongMsg? }` |
| `quiz` | `<Quiz>` (atom) | `{ id, questions: [{ q, choices, answer, explain }] }` |

`widget`, `exercise`, `quiz` are **atom** nodes (`atom: true`, no editable content). `notice`
holds inline content. Each custom node is one file in `src/content/nodes/*` defining the Node
extension (for parse/validation + future editor) **and** its static-renderer mapping + React
component.

### Widget registry (the only surviving code coupling)

```ts
// src/content/nodes/widget-registry.ts
export const WIDGETS: Record<string, React.FC<Record<string, unknown>>> = {
  "vector-playground": VectorPlayground,
  "matrix-transform-2d": MatrixTransform2D,
  // ...9 total
};
```

The `widget` node renders `WIDGETS[attrs.ref]`. Widget code stays in the app; the JSON only
carries the ref + props.

## Cloud storage model

**Firestore** (catalog + metadata — used to list courses/modules, and holds version):
```
tracks/{trackId}      → { title, blurb, icon, accent, order }
modules/{moduleId}    → { trackId, title, blurb, icon, dependsOn[], order,
                          lessons: [{ id, title, minutes, summary }],  // lesson index only
                          version, updatedAt, contentPath }
```

**Firebase Storage** (the actual PM JSON bodies — the heavy content):
```
content/{moduleId}/v{version}/{lessonId}.json    → PM JSON doc for one lesson
```
Versioned path = immutable + cacheable + trivial rollback.

**IndexedDB** (browser cache, per your sync design):
```
DB "eyln-content":
  modules  (key id)  → { id, version, updatedAt, lessons: PMJson-by-lessonId }
  meta               → catalog snapshot + lastSyncedAt
```

### Sync flow
1. App load / open curriculum → read `modules` from Firestore, render list from metadata.
2. Open a module/lesson → check IndexedDB. If missing **or** `idb.version < firestore.version`
   → fetch lesson JSON from Storage → write to IndexedDB → render. Else render cached.
3. Offline → serve stale from IndexedDB.

## Migration path

Rather than hand-convert 25 modules, script it. Two tiers depending on fidelity of JSX
parsing — we'll build the AST extractor since the JSX is regular (`<p>`, `<M>`, `<Code>`,
`<Notice>`, widget tags):

`scripts/extract-to-pm.ts`:
- Parse each `Body` component's JSX (via the TS compiler API / ts-morph) → walk elements →
  emit PM nodes. `<p>`→paragraph, `<h3>`→heading, `<ul>/<li>`→lists, `<M>`→mathInline,
  `<MBlock>`→mathBlock, `<Code .../>`→codeSample, `<Notice>`→notice, widget tags→widget.
- quizzes/exercises: read the data objects directly; convert `validate` → `{expected,tolerance}`
  by pattern-matching the tolerance form (233/234 auto; flag any that don't match for manual).
- Output: one `{lessonId}.json` per lesson + a catalog manifest.

`scripts/upload-content.ts`: write JSON blobs to Storage + module/track docs to Firestore.

## Phases

- **P0 — deps + node model.** Add TipTap v3 packages. Define the 7 custom Node extensions +
  their static-renderer mappings + React components (reuse existing `math.tsx`, `code-block.tsx`,
  `Notice`, widgets, `Quiz`, `Exercise` internals). Build `widget-registry.ts`. No cloud yet;
  unit-render a hand-written sample doc to verify parity.
- **P1 — cloud layer.** `lib/content-store.ts` (IndexedDB), `lib/content-catalog.ts` (Firestore
  tracks/modules), `lib/content-sync.ts` (version check + Storage fetch). Firestore rules +
  Storage rules (public read for content, admin-only write).
- **P2 — LessonRenderer.** `<LessonRenderer doc={pmJson}/>` using `renderToReactElement` +
  nodeMapping. Wire lesson-page + questionary to fetch via sync layer and render. Keep progress/
  tutor/notes integrations (they key off moduleId/lessonId, unaffected).
- **P3 — extraction + upload scripts.** Convert all 25 modules → JSON, seed Firestore + Storage.
  Diff-verify rendered output against current app (screenshot or text compare) per lesson.
- **P4 — cut over.** Registry (`content/registry.ts`, `tracks.ts`) reads from catalog instead of
  static imports. Delete `src/modules/*` and `Body`/`validate` fields from `types.ts`. Widgets
  stay. `challenges.ts` (code challenges) — decide: same JSON treatment or leave as-is (separate
  from lesson content; recommend a follow-up).

## Decisions (locked)

1. **Authoring:** JSON is the source of truth from P4. A **TipTap editor admin page** (`useEditor`,
   `editable`) is a **follow-up** — this migration ships only the read-only static renderer.
2. **Granularity in Storage:** one JSON per **lesson** (lazy-load per lesson).
3. **Code challenges** (`challenges.ts` + `tests[]`): **in scope now** — migrated in the same pass.
4. **Widget props:** widgets keyed purely by `ref` (+ optional `props`); no per-instance code.

## Code challenges (now in scope)

`challenges.ts` / `challenges/*.ts` are already `CodeChallenge` data (`prompt, fnName, starter,
tests[], hint, solution`). Migrate to:
```
Firestore: challenges/{challengeId} → { title, difficulty, topic, practiceTrack, source,
                                        tags, moduleTitle?, version, contentPath }
Storage:   challenges/v{version}/{challengeId}.json → full CodeChallenge (prompt + tests[])
```
`prompt` can stay HTML string (as today) or become a small PM doc — recommend keeping it a string
for challenges since prompts are short and already HTML. Cached in IndexedDB alongside modules.
No `validate` code involved — grading runs `tests[]` against `fnName` in the existing runner.

## Revised phases

- **P0 — deps + node model.** TipTap v3 packages + 7 custom Node extensions + static-renderer
  mappings + React components + `widget-registry.ts`. Verify against a hand-written sample doc.
- **P1 — cloud layer.** `content-store.ts` (IndexedDB), `content-catalog.ts` (Firestore),
  `content-sync.ts` (version sync + Storage fetch). Firestore + Storage rules.
- **P2 — LessonRenderer + wiring.** Render lessons/quizzes/exercises from fetched JSON in
  lesson-page + questionary.
- **P3 — extraction + upload.** Convert 25 modules **and** all code challenges → JSON; seed
  Firestore + Storage; diff-verify per lesson.
- **P4 — cut over.** Catalog-driven registry; delete `src/modules/*`, `Body`/`validate` from
  `types.ts`, and static challenge data. Widgets remain.
- **P5 (follow-up) — TipTap editor admin page** for authoring.
