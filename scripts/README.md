# Content pipeline scripts

Migrates course content from `src/modules/*` and `src/content/challenges*` into
cloud-hosted ProseMirror JSON (see `CONTENT_TO_CLOUD_PLAN.md`).

## extract-to-pm.mjs

Parses the TypeScript AST of each module's `index.tsx` (never regex — tags like
`<f32>` live inside code/math strings) and emits ProseMirror JSON.

```
pnpm content:extract          # all modules + challenges → dist-content/
node scripts/extract-to-pm.mjs dsa-arrays   # one module (no challenges)
```

Output (gitignored):
```
dist-content/
  catalog.json                 # module metadata manifest
  challenges.json              # challenge metadata manifest
  modules/{moduleId}.json      # { meta, lessons[], docs: {lessonId: PMDoc} }
  challenges/{challengeId}.json # full CodeChallenge
```

The run must end with **0 warnings**. Warnings flag unhandled JSX tags or
`validate()` functions that aren't the numeric-tolerance form — investigate and
extend the script rather than shipping lossy content.

## upload-content.mjs

Writes `dist-content/` to Firestore (catalog) + Firebase Storage (bodies) via the
Firebase Admin SDK.

```
pnpm content:upload:dry        # validate without writing
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json \
CONTENT_VERSION=1 \
pnpm content:upload            # publish at v1
```

- **Credentials required:** a service-account JSON with Firestore + Storage write
  access (`GOOGLE_APPLICATION_CREDENTIALS`), or `gcloud auth application-default`.
- **`CONTENT_VERSION`** (default 1): bump to publish an update; clients re-sync
  any module whose catalog `version` exceeds their cached copy.
Content is stored entirely in **Firestore** (free Spark tier — no Storage/Blaze
needed). Largest module is ~55 KB, well under Firestore's 1 MiB/doc limit; the
script aborts if any module content doc would exceed it.

Layout written:
```
Firestore: tracks/{id}, modules/{id}, challenges/{id}
Storage:   content/{moduleId}/v{version}/{lessonId}.json
           challenges/v{version}/{challengeId}.json
```
