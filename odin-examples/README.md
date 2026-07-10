# Odin + Metal examples

Runnable companions to the **Rendering Capstone** module. Each is a single,
self-contained `main.odin`. They compile their shaders **at runtime** from a
source string (`newLibraryWithSource`), so they work with just the Xcode
**Command Line Tools** — no full Xcode / `.metallib` step required.

## Requirements

- macOS with a Metal-capable GPU (any Apple Silicon or recent Intel Mac).
- The [Odin compiler](https://odin-lang.org) on your `PATH` (`odin version`).
- Xcode Command Line Tools (`xcode-select --install`).

## Run

From inside an example directory:

```bash
cd 01-triangle
odin run .
```

Or build a binary:

```bash
odin build . -out:triangle
./triangle
```

## The four steps

| Dir | What it teaches | Controls |
| --- | --- | --- |
| `01-triangle` | The whole pipeline: window → device → runtime shaders → vertex buffer → draw. | — |
| `02-cube-camera` | MVP uniforms, a depth buffer, a fly-camera. | `WASD` move, arrow keys look |
| `03-terrain` | Procedural heightfield mesh from Perlin fBm, lit with per-vertex normals. | orbits automatically |
| `04-spline-wall` | Catmull-Rom spline → extruded 3D wall mesh. | `SPACE` cycles preset layouts |

## Where to go next

- **Mouse picking**: cast a ray from the camera through the cursor and intersect
  the terrain (ray–plane / ray–heightfield — see the Physics module) so the
  player can click wall points into the world.
- **Seamless corners (the Tiny Glade secret)**: where two walls meet, detect the
  intersection, recompute the junction vertices, cut the hidden interior, and
  stitch a clean corner — dynamic vertex generation / CSG.
- **Instancing & chunks**: split terrain into chunks and only rebuild what changes.

Shared conventions match `src/engine/` on the website (column-major,
right-handed, `matrix4_perspective`/`matrix4_look_at`) so the browser demos and
this code agree.
