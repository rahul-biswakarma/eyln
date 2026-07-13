import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { CodeTabs, Code } from "../../components/code-block";
import { NoiseExplorer } from "../../widgets/NoiseExplorer";
import { SplineEditor } from "../../widgets/SplineEditor";

function Noise() {
  return (
    <div className="prose">
      <p>
        A grid of pure math is flat and sterile. Nature has bumps, ridges, and cliffs. You get them
        from <strong>noise</strong>: functions that look random but are smooth and repeatable—given the same coordinate input, they always return the same output.
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

      <h3>Mathematics of Gradient (Perlin) Noise</h3>
      <p>
        Unlike Value noise, which simply interpolates random values at grid corners, <strong>Perlin noise</strong> assigns a pseudo-random unit gradient vector <M>{`g_i`}</M> to each grid lattice point. 
        For any input coordinate <M>{`p`}</M>:
      </p>
      <ol>
        <li>Identify the cell coordinates containing <M>{`p`}</M>, finding the <M>{`2^d`}</M> surrounding integer lattice corners (4 corners in 2D, 8 in 3D).</li>
        <li>For each corner <M>{`c_i`}</M>, compute the offset vector <M>{`d_i = p - c_i`}</M>.</li>
        <li>Calculate the dot product of each corner's gradient vector and its corresponding offset vector: <M>{`v_i = g_i \\cdot d_i`}</M>. This product is zero at the corner itself, and rises or falls along the gradient's direction.</li>
        <li>Interpolate these dot products across the cell using a smoothing function.</li>
      </ol>

      <h3>Quintic Smoothing and <M>{`C^2`}</M> Continuity</h3>
      <p>
        Simple linear interpolation (<M>{`s(t) = t`}</M>) leaves sharp corners at cell boundaries. Originally, Perlin noise used the cubic Hermite curve:
        <MBlock>{`s(t) = 3t^2 - 2t^3`}</MBlock>
        While this makes the noise continuous (<M>{`C^0`}</M>) and smooths the first derivative (<M>{`C^1`}</M> continuity), its second derivative (<M>{`s''(t) = 6 - 12t`}</M>) is discontinuous at boundaries. 
        When this noise is used to generate terrain or normal maps, this discontinuity shows up as faint, ugly creases under diffuse or specular lighting.
      </p>
      <p>
        In 2002, Ken Perlin updated the noise to use a quintic smoothing polynomial:
        <MBlock>{`s(t) = 6t^5 - 15t^4 + 10t^3`}</MBlock>
        Because the first and second derivatives of this polynomial are zero at the boundaries (<M>{`t=0`}</M> and <M>{`t=1`}</M>), it guarantees <strong><M>{`C^2`}</M> continuity</strong> (continuous second derivatives). 
        This prevents visible crease lines and lighting artifacts on procedurally generated surfaces.
      </p>

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
        polynomial curve.
      </p>

      <h3>Approximating vs. Interpolating Curves</h3>
      <p>
        Splines are grouped into two primary classes:
      </p>
      <ul>
        <li>
          <strong>Interpolating Splines</strong> (e.g., <strong>Catmull-Rom</strong>): The curve passes <strong>directly through</strong> every control point. This makes them ideal for user-drawn paths where the wall or road must lie exactly where the player clicked.
        </li>
        <li>
          <strong>Approximating Splines</strong> (e.g., <strong>Bézier</strong>): The curve is pulled <strong>toward</strong> the interior control points, acting as attractors, but generally does not touch them (except at the endpoints). This is the model behind vector pen tools and font outlines.
        </li>
      </ul>

      <h3>Catmull-Rom Tangents and Formulas</h3>
      <p>
        A Catmull-Rom spline segment between points <M>{`p_1`}</M> and <M>{`p_2`}</M> uses four control points (<M>{`p_0, p_1, p_2, p_3`}</M>). 
        To make the transition between adjacent segments smooth, we calculate a tangent vector at each control point. 
        The tangent vector <M>{`m_i`}</M> at control point <M>{`p_i`}</M> is half the vector between its two neighbors:
      </p>
      <MBlock>{`m_i = \\frac{p_{i+1} - p_{i-1}}{2}`}</MBlock>
      <p>
        This tangent choice ensures that where two segments meet, their slopes match, providing first-derivative (<M>{`C^1`}</M>) continuity. 
        The resulting polynomial position <M>{`p(t)`}</M> for <M>{`t \\in [0, 1]`}</M> is:
      </p>
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
        A spline is just a 1D line. A wall or track requires <em>width</em> and <em>height</em>. 
        To turn a 1D spline into a 3D polygonal mesh, we must <strong>extrude</strong> a 2D profile along the curve.
      </p>

      <h3>3D Coordinate Frames and Twisting</h3>
      <p>
        To extrude a profile in 3D, we need a local coordinate frame (a set of three perpendicular vectors: Tangent <M>{`\\hat{t}`}</M>, Normal <M>{`\\hat{n}`}</M>, and Binormal <M>{`\\hat{b}`}</M>) at every point along the spline. 
        There are two primary ways to compute this frame:
      </p>
      <ul>
        <li>
          <strong>Frenet-Serret Frame</strong>: Uses the curve's derivatives. The normal is calculated from the direction of acceleration. 
          <br />
          <em>The Trap:</em> If the curve has an inflection point (where it goes from curving left to curving right, i.e., zero acceleration), the normal vector suddenly flips by 180°, causing the extruded wall to twist or pinch violently.
        </li>
        <li>
          <strong>Rotation Minimizing Frame (RMF) / Parallel Transport</strong>: 
          Instead of computing each frame independently, we start with an initial frame and slide (transport) it along the curve step-by-step, rotating it by the absolute minimum amount needed to align with the changing tangent. 
          This yields a smooth, twist-free extrusion.
        </li>
      </ul>
      <p>
        For a flat 2D ground curve, the normal is simply the tangent vector rotated 90°: <M>{`\\hat{n} = (-\\hat{t}_y, \\hat{t}_x)`}</M>. 
        We then step left and right along this normal to generate vertex pairs for our mesh:
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
