import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { CodeTabs, Code } from "../../components/CodeBlock";
import { NoiseExplorer } from "../../widgets/NoiseExplorer";
import { SplineEditor } from "../../widgets/SplineEditor";

function Noise() {
  return (
    <div className="prose">
      <p>
        A grid of pure math is flat and sterile. Nature has bumps, ridges, and cliffs. You get them
        from <strong>noise</strong>: functions that look random but are smooth and repeatable —
        given the same input, always the same output.
      </p>
      <p>Three flavors, in increasing quality:</p>
      <ul>
        <li>
          <strong>Value noise</strong> — random values on a grid, smoothly interpolated between.
          Fast, but has a blocky, axis-aligned feel.
        </li>
        <li>
          <strong>Perlin noise</strong> — interpolates random <em>gradients</em> instead of values.
          The organic hills you know from a thousand games. Ken Perlin, 1983.
        </li>
        <li>
          <strong>Simplex noise</strong> — Perlin's later design on a triangular grid. Fewer
          directional artifacts, scales better to higher dimensions.
        </li>
      </ul>
      <NoiseExplorer />
      <p>
        Switch the type in the widget and watch the heightmap change character. Value noise looks
        grid-locked; Perlin and Simplex feel more natural. The right panel shades the same data as
        terrain.
      </p>
      <div className="notice">
        <span className="lbl">North star</span>
        <a href="https://iquilezles.org/articles/" target="_blank" rel="noreferrer">Inigo Quilez</a>{" "}
        has the clearest write-ups of noise anywhere — start with his "value noise" and "gradient
        noise" articles. <strong>Anastasia Opara</strong> (Tiny Glade) shows how to turn noise into{" "}
        <em>believable</em> art rather than just terrain.
      </div>
    </div>
  );
}

function Fbm() {
  return (
    <div className="prose">
      <p>
        One octave of noise is smooth and boring. Real terrain has detail at many scales: mountain
        ranges, hills on the ranges, rocks on the hills. You get that by summing several octaves of
        noise, each at higher frequency and lower amplitude. This is{" "}
        <strong>fractal Brownian motion (fBm)</strong>:
      </p>
      <MBlock>{`\\text{fbm}(p) = \\sum_{i=0}^{n-1} g^i \\, \\text{noise}(l^i \\, p)`}</MBlock>
      <p>
        <M>{`l`}</M> is <strong>lacunarity</strong> (frequency multiplier, ~2 — each octave twice as
        detailed) and <M>{`g`}</M> is <strong>gain</strong> (amplitude multiplier, ~0.5 — each
        octave half as strong).
      </p>
      <NoiseExplorer />
      <p>
        Crank <strong>octaves</strong> up and watch fine detail appear. Toggle{" "}
        <strong>ridged</strong> — folding each octave with <M>{`1 - |2n-1|`}</M> — to turn rolling
        hills into sharp mountain ridges.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "terrain.odin",
            code: `fbm :: proc(x, y: f32, octaves: int, freq, lacunarity, gain: f32) -> f32 {
    sum, amp, f, norm : f32 = 0, 1, freq, 0
    for i in 0..<octaves {
        sum  += amp * perlin(x * f, y * f)
        norm += amp
        amp  *= gain
        f    *= lacunarity
    }
    return sum / norm
}`,
          },
          {
            label: "WGSL", lang: "wgsl", filename: "terrain.wgsl",
            code: `fn fbm(p: vec2<f32>, octaves: i32, freq: f32, lac: f32, gain: f32) -> f32 {
  var sum = 0.0; var amp = 1.0; var f = freq; var norm = 0.0;
  for (var i = 0; i < octaves; i = i + 1) {
    sum = sum + amp * perlin(p * f);
    norm = norm + amp;
    amp = amp * gain;
    f = f * lac;
  }
  return sum / norm;
}`,
          },
        ]}
      />
    </div>
  );
}

function Voronoi() {
  return (
    <div className="prose">
      <p>
        Perlin gives you smooth blobs. But cliffs, cracked rock, and stone walls need{" "}
        <strong>cells</strong>. That's <strong>Voronoi / cellular noise</strong>: scatter feature
        points, then for each pixel find the distance to the nearest one.
      </p>
      <MBlock>{`F_1(p) = \\min_i \\, \\|p - c_i\\| \\qquad F_2(p) = \\text{second nearest}`}</MBlock>
      <p>
        <M>{`F_1`}</M> gives you rounded cells. The difference <M>{`F_2 - F_1`}</M> lights up the
        <em> borders</em> between cells — exactly the fractured, blocky cliff edges you see in Tiny
        Glade. Combine that with a heightfield and you get stable rock faces that look carved.
      </p>
      <Code
        lang="wgsl" filename="voronoi.wgsl"
        code={`// Cellular noise: distance to nearest feature point in each grid cell.
fn voronoi(p: vec2<f32>) -> f32 {
  let cell = floor(p);
  var d = 1e9;
  for (var y = -1; y <= 1; y = y + 1) {
    for (var x = -1; x <= 1; x = x + 1) {
      let g = cell + vec2<f32>(f32(x), f32(y));
      let feature = g + hash2(g);       // random point inside neighbor cell
      d = min(d, distance(p, feature));
    }
  }
  return d;   // F1. Use a second 'd2' for F2-F1 edges.
}`}
      />
      <div className="notice">
        <span className="lbl">Tiny Glade connection</span>
        Blocky cliff-sides come from Voronoi cells: each cell becomes a chunk of rock, and the
        cell boundaries become the fracture lines. Deforming the ground just moves the feature
        points, and the cracks re-stitch naturally.
      </div>
    </div>
  );
}

function Splines() {
  return (
    <div className="prose">
      <p>
        When a player draws a path or a wall, they click a few points and expect a{" "}
        <strong>smooth curve</strong> through them. A <strong>spline</strong> is a piecewise
        polynomial that does exactly that.
      </p>
      <ul>
        <li>
          <strong>Catmull-Rom</strong> passes <em>through</em> every control point, using neighbors
          to pick a natural tangent. Perfect for "draw a line through my clicks."
        </li>
        <li>
          <strong>Bézier</strong> is pulled <em>toward</em> its inner control points but doesn't
          pass through them — the model behind pen tools and font outlines.
        </li>
      </ul>
      <p>Catmull-Rom, for the segment between <M>{`p_1`}</M> and <M>{`p_2`}</M>, at <M>{`t \\in [0,1]`}</M>:</p>
      <MBlock>{`p(t) = \\tfrac12 \\big[ 2p_1 + (p_2 - p_0)t + (2p_0 - 5p_1 + 4p_2 - p_3)t^2 + (-p_0 + 3p_1 - 3p_2 + p_3)t^3 \\big]`}</MBlock>
      <SplineEditor />
      <p>Drag the control points and watch the smooth curve track them.</p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "spline.odin",
            code: `catmull_rom :: proc(p0, p1, p2, p3: [2]f32, t: f32) -> [2]f32 {
    t2 := t * t
    t3 := t2 * t
    return 0.5 * (
        2*p1 +
        (-p0 + p2) * t +
        (2*p0 - 5*p1 + 4*p2 - p3) * t2 +
        (-p0 + 3*p1 - 3*p2 + p3) * t3
    )
}`,
          },
          {
            label: "TypeScript (this site)", lang: "ts", filename: "spline.ts",
            code: `export function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t*t, t3 = t2*t;
  const f = (a,b,c,d) =>
    0.5*(2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t2 + (-a+3*b-3*c+d)*t3);
  return [f(p0[0],p1[0],p2[0],p3[0]), f(p0[1],p1[1],p2[1],p3[1])];
}`,
          },
        ]}
      />
    </div>
  );
}

function Extrusion() {
  return (
    <div className="prose">
      <p>
        A spline is just a line — one-dimensional. A wall has <em>width</em> and{" "}
        <em>height</em>. To turn the spline into a mesh you <strong>extrude</strong> it: at each
        point along the curve, step left and right along the <strong>normal</strong> (the tangent
        rotated 90°) to get two edge vertices. Connect consecutive pairs into quads, split each quad
        into two triangles, and you have a ribbon — a wall footprint.
      </p>
      <SplineEditor />
      <p>
        Turn on <strong>show mesh</strong> and widen the wall. Those cross-lines are the actual
        triangle edges your GPU will draw. The readout counts the generated triangles — this is a
        <strong> procedural mesh</strong>, built in RAM from a handful of clicks, not loaded from a
        file.
      </p>
      <Code
        lang="odin" filename="extrude.odin"
        code={`// Offset each centerline point along its normal to get wall edges.
extrude_ribbon :: proc(center: [][2]f32, half_w: f32) -> (left, right: [dynamic][2]f32) {
    for p, i in center {
        prev := center[max(0, i-1)]
        next := center[min(len(center)-1, i+1)]
        t := linalg.normalize(next - prev)   // tangent
        n := [2]f32{ -t.y, t.x }             // normal = tangent rotated 90°
        append(&left,  p + n * half_w)
        append(&right, p - n * half_w)
    }
    return
}`}
      />
      <div className="notice">
        <span className="lbl">The Tiny Glade secret</span>
        When two walls meet, you don't let them intersect like ghosts. You detect where the two
        ribbons overlap, recompute the vertices at the junction, cut away the hidden interior, and
        stitch a seamless corner — <strong>dynamic vertex generation / CSG</strong>. The capstone's
        final lesson builds the extrusion; the corner-stitching is the boss level.
      </div>
    </div>
  );
}

export const proceduralMath: Module = {
  id: "procedural-math",
  title: "Procedural Math",
  icon: "🌱",
  blurb: "Noise, fBm, Voronoi cells, and splines — the math that makes worlds look organic and lets players draw them.",
  dependsOn: ["linear-algebra"],
  lessons: [
    {
      id: "noise", title: "Noise: Value, Perlin, Simplex", minutes: 14,
      summary: "Smooth pseudo-randomness — the source of organic terrain.",
      Body: Noise,
      quiz: {
        questions: [
          { q: "Perlin noise interpolates…", choices: ["Random values on a grid", "Random gradients on a grid", "Pixels from an image", "Nothing — it's pure random"], answer: 1, explain: "Perlin interpolates random gradient directions, which is what gives it its organic look." },
          { q: "Noise functions are 'coherent', meaning…", choices: ["Truly random each call", "Same input always gives the same smooth output", "Only work in 2D", "Require a GPU"], answer: 1, explain: "They're deterministic and smooth — repeatable given the same coordinate." },
        ],
      },
    },
    {
      id: "fbm", title: "fBm & Octaves", minutes: 12,
      summary: "Summing octaves for multi-scale detail; ridged noise for mountains.",
      Body: Fbm,
      quiz: {
        questions: [
          { q: "In fBm, 'gain' of 0.5 means…", choices: ["Each octave is twice as strong", "Each octave contributes half the amplitude of the last", "Frequency halves", "Nothing changes"], answer: 1, explain: "Gain multiplies amplitude per octave; 0.5 halves each octave's contribution." },
          { q: "Lacunarity controls…", choices: ["Amplitude falloff", "Frequency growth per octave", "The seed", "Color"], answer: 1, explain: "Lacunarity (~2) multiplies frequency each octave — finer detail." },
        ],
      },
    },
    {
      id: "voronoi", title: "Voronoi / Cellular Noise", minutes: 11,
      summary: "Cell structures for cracked rock and blocky cliffs.",
      Body: Voronoi,
      quiz: {
        questions: [
          { q: "Voronoi noise is based on…", choices: ["Interpolated gradients", "Distance to the nearest feature point", "Fourier transforms", "Random colors"], answer: 1, explain: "Each pixel's value is the distance to the closest scattered feature point (F1)." },
          { q: "To highlight cell borders (cracks) you use…", choices: ["F1 alone", "F2 − F1", "F1 × 2", "The seed"], answer: 1, explain: "The gap between nearest and second-nearest lights up the boundaries." },
        ],
      },
    },
    {
      id: "splines", title: "Splines & Curves", minutes: 13,
      summary: "Catmull-Rom and Bézier — smooth curves through clicked points.",
      Body: Splines,
      quiz: {
        questions: [
          { q: "Catmull-Rom splines…", choices: ["Miss all control points", "Pass through every control point", "Only work with 4 points total", "Are straight lines"], answer: 1, explain: "Catmull-Rom interpolates — the curve passes through each control point." },
          { q: "Bézier curves…", choices: ["Pass through all control points", "Are pulled toward inner control points but don't pass through them", "Can't be smooth", "Need noise"], answer: 1, explain: "Interior control points act as attractors; the curve doesn't touch them." },
        ],
      },
    },
    {
      id: "extrusion", title: "Extrusion: Spline → Wall", minutes: 12,
      summary: "Offset along normals to turn a curve into a triangle-strip mesh.",
      Body: Extrusion,
      quiz: {
        questions: [
          { q: "To extrude a spline into a wall, you offset each point along its…", choices: ["Tangent", "Normal (tangent rotated 90°)", "Color", "Z axis only"], answer: 1, explain: "Stepping left/right along the normal gives the two edges of the ribbon." },
          { q: "The Tiny-Glade-style seamless corners come from…", choices: ["Pre-made Blender models", "Dynamic vertex generation / CSG at intersections", "Physics", "Textures"], answer: 1, explain: "Meshes are recomputed and stitched where walls meet — not modeled by hand." },
        ],
      },
    },
  ],
};
