import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { CodeTabs } from "../../components/CodeBlock";
import { VectorPlayground } from "../../widgets/VectorPlayground";
import { MatrixTransform2D } from "../../widgets/MatrixTransform2D";
import { TransformPipeline3D } from "../../widgets/TransformPipeline3D";

function Vectors() {
  return (
    <div className="prose">
      <p>
        In most everyday code a "position" is a couple of numbers you never think about together. In
        3D, position and direction are first-class values called <strong>vectors</strong> — an ordered
        tuple of numbers. A point in space is <M>{`(x, y, z)`}</M>. A direction is <em>also</em>{" "}
        <M>{`(x, y, z)`}</M> — the difference is only in how you use it.
      </p>
      <p>The four operations you'll use constantly:</p>
      <ul>
        <li><strong>Add</strong> <M>{`a + b`}</M> — walk along a, then along b.</li>
        <li><strong>Scale</strong> <M>{`s \\cdot a`}</M> — stretch or shrink a direction.</li>
        <li><strong>Length</strong> <M>{`|a| = \\sqrt{x^2 + y^2 + z^2}`}</M> — how long the arrow is.</li>
        <li><strong>Normalize</strong> <M>{`\\hat{a} = a / |a|`}</M> — same direction, length 1. Directions in graphics are almost always normalized.</li>
      </ul>
      <VectorPlayground />
      <p>
        Drag the arrows above. Notice the readout: those numbers are exactly what your shader
        computes millions of times per frame. Here's the same math in the three languages you'll
        move between:
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "vec.odin",
            code: `import "core:math/linalg"

a := [3]f32{2, 1, 0}
b := [3]f32{-1, 2, 0}

sum   := a + b                 // component-wise, built into the array type
scaled := 2 * a
len_a := linalg.length(a)
dir_a := linalg.normalize(a)   // unit-length direction`,
          },
          {
            label: "Metal (MSL)", lang: "cpp", filename: "shader.metal",
            code: `#include <metal_stdlib>
using namespace metal;

float3 a = float3(2, 1, 0);
float3 b = float3(-1, 2, 0);

float3 sum    = a + b;
float3 scaled = 2.0 * a;
float  len_a  = length(a);
float3 dir_a  = normalize(a);`,
          },
          {
            label: "WGSL", lang: "wgsl", filename: "shader.wgsl",
            code: `let a = vec3<f32>(2.0, 1.0, 0.0);
let b = vec3<f32>(-1.0, 2.0, 0.0);

let sum    = a + b;
let scaled = 2.0 * a;
let len_a  = length(a);
let dir_a  = normalize(a);`,
          },
        ]}
      />
      <div className="notice">
        <span className="lbl">The shift from web</span>
        There is no <code>Vector</code> class with methods. A vector is raw numbers laid out in
        memory. Odin's <code>[3]f32</code>, Metal's <code>float3</code>, and WGSL's{" "}
        <code>vec3&lt;f32&gt;</code> are the same 12 bytes — which is exactly why you can hand them
        straight to the GPU.
      </div>
    </div>
  );
}

function DotProduct() {
  return (
    <div className="prose">
      <p>
        The dot product collapses two vectors into a single number that encodes the angle between
        them:
      </p>
      <MBlock>{`a \\cdot b = a_x b_x + a_y b_y + a_z b_z = |a|\\,|b|\\cos\\theta`}</MBlock>
      <p>Read it geometrically:</p>
      <ul>
        <li><M>{`a \\cdot b > 0`}</M> → the vectors point <em>roughly the same way</em> (&lt; 90°).</li>
        <li><M>{`a \\cdot b = 0`}</M> → they are <strong>perpendicular</strong>.</li>
        <li><M>{`a \\cdot b < 0`}</M> → they point <em>away</em> from each other (&gt; 90°).</li>
      </ul>
      <p>
        This one formula powers lighting. If <M>{`\\hat{n}`}</M> is a surface normal and{" "}
        <M>{`\\hat{l}`}</M> points toward the light, then <M>{`\\max(0, \\hat{n} \\cdot \\hat{l})`}</M>{" "}
        is how brightly that surface is lit — the classic <em>Lambert</em> term. A slope facing the
        sun gets a big dot product; one facing away gets zero.
      </p>
      <VectorPlayground />
      <div className="notice">
        <span className="lbl">Try it</span>
        Rotate <code>b</code> until <code>a · b</code> hits 0 in the readout — that's the moment the
        two arrows form a right angle.
      </div>
    </div>
  );
}

function CrossProduct() {
  return (
    <div className="prose">
      <p>
        The cross product takes two vectors and returns a third one that is{" "}
        <strong>perpendicular to both</strong>:
      </p>
      <MBlock>{`a \\times b = (a_y b_z - a_z b_y,\\; a_z b_x - a_x b_z,\\; a_x b_y - a_y b_x)`}</MBlock>
      <p>
        This is how you compute a <strong>normal</strong> — the direction a triangle faces. Given a
        triangle with corners <M>{`p_0, p_1, p_2`}</M>, its normal is:
      </p>
      <MBlock>{`\\hat{n} = \\text{normalize}\\big((p_1 - p_0) \\times (p_2 - p_0)\\big)`}</MBlock>
      <p>
        Every lit surface in your engine needs a normal, and every normal comes from a cross
        product. The <em>length</em> of <M>{`a \\times b`}</M> also equals the area of the
        parallelogram they span (the shaded region in the widget) — useful for triangle areas and
        detecting degenerate geometry.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin",
            code: `// triangle face normal
e1 := p1 - p0
e2 := p2 - p0
normal := linalg.normalize(linalg.cross(e1, e2))`,
          },
          {
            label: "WGSL", lang: "wgsl",
            code: `let e1 = p1 - p0;
let e2 = p2 - p0;
let normal = normalize(cross(e1, e2));`,
          },
        ]}
      />
      <div className="notice warn">
        <span className="lbl">Watch the order</span>
        <M>{`a \\times b = -(b \\times a)`}</M>. Swapping the arguments flips the normal to point the
        other way — which flips whether a face is lit or in shadow. Winding order matters.
      </div>
    </div>
  );
}

function Matrices() {
  return (
    <div className="prose">
      <p>
        A matrix is a machine that transforms space. The cleanest way to understand a{" "}
        <M>{`2\\times2`}</M> matrix: its <strong>columns are where the basis vectors land</strong>.
        Column 1 is where <M>{`\\hat{\\imath} = (1,0)`}</M> goes; column 2 is where{" "}
        <M>{`\\hat{\\jmath} = (0,1)`}</M> goes. Everything else follows by linearity.
      </p>
      <MBlock>{`\\begin{bmatrix} a & c \\\\ b & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = x\\begin{bmatrix} a \\\\ b \\end{bmatrix} + y\\begin{bmatrix} c \\\\ d \\end{bmatrix}`}</MBlock>
      <MatrixTransform2D />
      <p>
        Drag the sliders and watch the grid warp. The orange <M>{`\\hat{\\imath}`}</M> and blue{" "}
        <M>{`\\hat{\\jmath}`}</M> arrows are literally the columns. The <strong>determinant</strong>{" "}
        is the area of the transformed unit square — and if it goes negative, space has been flipped
        inside-out (a mirror).
      </p>
      <div className="notice">
        <span className="lbl">Column-major</span>
        Odin's <code>linalg</code>, Metal, and WGSL all store matrices <strong>column-major</strong>
        {" "}— the first four numbers in memory are the first column. This course's math library uses
        the same convention so the browser demos and the Odin code agree byte-for-byte.
      </div>
    </div>
  );
}

function MVP() {
  return (
    <div className="prose">
      <p>
        To draw a villager standing in a world, seen through a moving camera, on a 2D screen, you
        chain three matrices. This single line is the heart of every 3D renderer ever written:
      </p>
      <MBlock>{`P_{clip} = M_{proj} \\cdot M_{view} \\cdot M_{model} \\cdot v_{local}`}</MBlock>
      <ul>
        <li><strong>Model</strong>: places the object into the world (position/rotation/scale).</li>
        <li><strong>View</strong>: moves the world so the camera sits at the origin looking down −Z. It's the <em>inverse</em> of the camera's transform.</li>
        <li><strong>Projection</strong>: applies perspective — distant things get smaller — and maps everything into the GPU's clip cube.</li>
      </ul>
      <p>Read right-to-left: the vertex is transformed by model first, then view, then projection.</p>
      <TransformPipeline3D />
      <p>
        Toggle each matrix off above to feel what it does. This exact chain runs in the vertex
        shader once per vertex:
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin (CPU side)", lang: "odin",
            code: `model := linalg.matrix4_rotate(angle, {0, 1, 0})
view  := linalg.matrix4_look_at(eye, target, up)
proj  := linalg.matrix4_perspective(fovy, aspect, 0.1, 100)

mvp := proj * view * model         // upload this to the GPU as a uniform`,
          },
          {
            label: "WGSL (vertex shader)", lang: "wgsl",
            code: `struct U { mvp : mat4x4<f32> };
@group(0) @binding(0) var<uniform> u : U;

@vertex
fn vs(@location(0) position : vec3<f32>) -> @builtin(position) vec4<f32> {
  return u.mvp * vec4<f32>(position, 1.0);
}`,
          },
          {
            label: "Metal (vertex shader)", lang: "cpp",
            code: `struct Uniforms { float4x4 mvp; };

vertex float4 vs(const device float3* pos [[buffer(0)]],
                 constant Uniforms& u    [[buffer(1)]],
                 uint vid                [[vertex_id]]) {
  return u.mvp * float4(pos[vid], 1.0);
}`,
          },
        ]}
      />
    </div>
  );
}

function Quaternions() {
  return (
    <div className="prose">
      <p>
        Euler angles (yaw/pitch/roll) seem intuitive but bite you: apply three sequential rotations and
        near the poles two axes collapse into one — <strong>gimbal lock</strong> — and you lose a degree
        of freedom. Interpolating them also wobbles. Rotations in a real engine use{" "}
        <strong>quaternions</strong>: a 4-tuple <M>{`q = (w, x, y, z)`}</M> that encodes a rotation of
        angle <M>{`\\theta`}</M> about a unit axis <M>{`\\hat{n}`}</M>.
      </p>
      <MBlock>{`q = \\left(\\cos\\tfrac{\\theta}{2},\\; \\hat{n}\\,\\sin\\tfrac{\\theta}{2}\\right)`}</MBlock>
      <p>
        A <strong>unit</strong> quaternion (length 1) represents a pure rotation. Composing rotations is
        quaternion multiplication (order matters, like matrices); rotating a vector is{" "}
        <M>{`v' = q\\,v\\,q^{-1}`}</M>. The payoff: no gimbal lock, cheap to renormalize against drift,
        and smooth shortest-arc interpolation via <strong>slerp</strong> — essential for cameras and
        animation.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "rotate.odin",
            code: `import "core:math/linalg"

// Axis-angle -> quaternion, then compose and convert to a matrix.
q_yaw   := linalg.quaternion_angle_axis_f32(yaw,   {0, 1, 0})
q_pitch := linalg.quaternion_angle_axis_f32(pitch, {1, 0, 0})
q := linalg.quaternion_mul(q_yaw, q_pitch)   // yaw then pitch

// Smoothly blend toward a target orientation (t in 0..1).
q_smooth := linalg.quaternion_slerp(q_current, q_target, t)

model := linalg.matrix4_from_quaternion(q_smooth)`,
          },
          {
            label: "WGSL (rotate a vector)", lang: "wgsl",
            code: `// q = (x, y, z, w). Rodrigues form avoids a full q*v*q^-1.
fn rotate(q : vec4<f32>, v : vec3<f32>) -> vec3<f32> {
  let u = q.xyz;
  return v + 2.0 * cross(u, cross(u, v) + q.w * v);
}`,
          },
        ]}
      />
      <div className="notice warn">
        <span className="lbl">Renormalize</span>
        Repeated multiplication accumulates floating-point error and the quaternion drifts off the unit
        sphere, shearing your model. Renormalize (<code>q / |q|</code>) periodically — it's far cheaper
        than re-orthonormalizing a 3×3 matrix.
      </div>
    </div>
  );
}

function ClipSpace() {
  return (
    <div className="prose">
      <p>
        The projection matrix doesn't just squash 3D to 2D — it outputs <strong>clip space</strong>, a
        4D homogeneous coordinate <M>{`(x, y, z, w)`}</M> where <M>{`w`}</M> carries depth. The GPU then
        does the <strong>perspective divide</strong>, dividing by <M>{`w`}</M> to reach{" "}
        <strong>normalized device coordinates (NDC)</strong>. That divide is what makes distant things
        small — perspective itself lives in the <M>{`w`}</M> component.
      </p>
      <MBlock>{`\\text{NDC} = \\left(\\tfrac{x}{w},\\, \\tfrac{y}{w},\\, \\tfrac{z}{w}\\right)`}</MBlock>
      <p>
        In NDC, everything visible fits a canonical box. This is where <strong>clipping</strong> and{" "}
        <strong>frustum culling</strong> happen: a point is on-screen only if{" "}
        <M>{`-w \\le x, y \\le w`}</M> and it's within the near/far depth range — a test you can run
        <em>before</em> the divide, cheaply, on whole objects using their bounding volumes.
      </p>
      <div className="notice">
        <span className="lbl">The clip-space box differs by API</span>
        NDC x/y are <M>{`[-1, 1]`}</M> everywhere, but the depth (z) range is{" "}
        <strong>0…1 in Metal, WebGPU, and D3D</strong>, and <strong>−1…1 in OpenGL</strong>. Use the
        matrix builder that matches your target, or your depth buffer will be wrong.
      </div>
      <CodeTabs
        tabs={[
          {
            label: "Odin (frustum check)", lang: "odin",
            code: `// Is a clip-space point inside the view frustum? (before divide)
in_frustum :: proc(c: [4]f32) -> bool {
    w := c.w
    return -w <= c.x && c.x <= w &&
           -w <= c.y && c.y <= w &&
            0 <= c.z && c.z <= w   // Metal/WebGPU depth is 0..w
}`,
          },
          {
            label: "WGSL (implicit divide)", lang: "wgsl",
            code: `@vertex
fn vs(@location(0) p : vec3<f32>) -> @builtin(position) vec4<f32> {
  // Return CLIP space (x,y,z,w). The GPU divides by w for you
  // to produce NDC, then maps to the viewport.
  return u.mvp * vec4<f32>(p, 1.0);
}`,
          },
        ]}
      />
    </div>
  );
}

export const linearAlgebra: Module = {
  id: "linear-algebra",
  title: "Linear Algebra",
  icon: "📐",
  blurb: "Vectors, dot & cross products, matrices, and the model-view-projection pipeline — the geometric foundation of everything.",
  dependsOn: [],
  lessons: [
    {
      id: "vectors", title: "Vectors", minutes: 12,
      summary: "Positions and directions as raw tuples of numbers.",
      Body: Vectors,
      quiz: {
        questions: [
          { q: "What does normalizing a vector do?", choices: ["Makes all components positive", "Scales it to length 1, keeping direction", "Rounds it to integers", "Reverses its direction"], answer: 1, explain: "Normalize divides by length, giving a unit-length vector pointing the same way." },
          { q: "A vector (3, 4, 0) has length…", choices: ["7", "5", "12", "25"], answer: 1, explain: "√(3² + 4² + 0²) = √25 = 5. The classic 3-4-5 triangle." },
        ],
      },
      exercises: [
        {
          id: "len", kind: "numeric", prompt: "Enter the length of the vector (6, 8, 0).",
          starter: "", hint: "√(6² + 8²).",
          validate: (s) => {
            const v = parseFloat(s);
            return Math.abs(v - 10) < 0.01 ? { pass: true, message: "Correct — √100 = 10." } : { pass: false, message: "Not quite. Compute √(36 + 64)." };
          },
        },
        {
          id: "vec-len2", kind: "numeric", prompt: "Enter the length of the vector (2, 3, 6).",
          starter: "", hint: "√(2² + 3² + 6²) = √49.",
          validate: (s) => Math.abs(parseFloat(s) - 7) < 0.01 ? { pass: true, message: "Correct — √(4 + 9 + 36) = √49 = 7." } : { pass: false, message: "Compute √(4 + 9 + 36)." },
        },
        {
          id: "vec-dist", kind: "numeric", prompt: "Enter the distance between the points (1, 2, 2) and (4, 6, 2).",
          starter: "", hint: "Length of the difference vector (3, 4, 0).",
          validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — the difference is (3, 4, 0), length √25 = 5." } : { pass: false, message: "Subtract to get (3, 4, 0), then take its length." },
        },
        {
          id: "vec-norm", kind: "numeric", prompt: "Normalize the vector (0, 3, 4). Enter its y-component, rounded to 2 decimals.",
          starter: "", hint: "Divide each component by the length 5.",
          validate: (s) => Math.abs(parseFloat(s) - 0.6) < 0.05 ? { pass: true, message: "Correct — 3 / 5 = 0.6." } : { pass: false, message: "Length is 5, so y-component is 3 / 5." },
        },
        {
          id: "vec-scale", kind: "numeric", prompt: "For a = (4, -1, 2), enter the y-component of 3a.",
          starter: "", hint: "Scale each component by 3.",
          validate: (s) => Math.abs(parseFloat(s) - (-3)) < 0.01 ? { pass: true, message: "Correct — 3 · (-1) = -3." } : { pass: false, message: "Multiply the y-component -1 by 3." },
        },
      ],
    },
    {
      id: "dot", title: "Dot Product", minutes: 10,
      summary: "One number that encodes the angle — the engine of lighting.",
      Body: DotProduct,
      quiz: {
        questions: [
          { q: "If a·b = 0, the vectors are…", choices: ["Parallel", "Perpendicular", "Opposite", "Equal"], answer: 1, explain: "cos(90°) = 0, so a zero dot product means a right angle." },
          { q: "In Lambert lighting, we use…", choices: ["n × l", "max(0, n · l)", "|n| + |l|", "n / l"], answer: 1, explain: "The clamped dot of normal and light direction gives diffuse brightness." },
        ],
      },
      exercises: [
        {
          id: "dot", kind: "numeric", prompt: "Compute a·b for a = (2, 3, 1), b = (1, 0, 4).",
          starter: "", hint: "2·1 + 3·0 + 1·4.",
          validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01 ? { pass: true, message: "Correct — 2 + 0 + 4 = 6." } : { pass: false, message: "Recompute: 2·1 + 3·0 + 1·4." },
        },
        {
          id: "dot-2", kind: "numeric", prompt: "Compute a·b for a = (3, -2, 1), b = (4, 1, -2).",
          starter: "", hint: "3·4 + (-2)·1 + 1·(-2).",
          validate: (s) => Math.abs(parseFloat(s) - 8) < 0.01 ? { pass: true, message: "Correct — 12 - 2 - 2 = 8." } : { pass: false, message: "Recompute: 3·4 + (-2)·1 + 1·(-2)." },
        },
        {
          id: "dot-perp", kind: "numeric", prompt: "Enter the dot product of the perpendicular vectors (2, 0, 0) and (0, 5, 0).",
          starter: "", hint: "Perpendicular vectors have a dot product of zero.",
          validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01 ? { pass: true, message: "Correct — 2·0 + 0·5 + 0·0 = 0, a right angle." } : { pass: false, message: "Multiply component-wise and sum; these are perpendicular." },
        },
        {
          id: "dot-angle", kind: "numeric", prompt: "Find the angle in degrees between a = (1, 1, 0) and b = (1, 0, 0). Round to the nearest degree.",
          starter: "", hint: "cos θ = (a·b)/(|a||b|) = 1/√2.",
          validate: (s) => Math.abs(parseFloat(s) - 45) < 0.5 ? { pass: true, message: "Correct — cos θ = 1/√2, so θ = 45°." } : { pass: false, message: "Compute cos θ = (a·b)/(|a||b|), then arccos." },
        },
        {
          id: "dot-proj", kind: "numeric", prompt: "Enter the scalar projection length of a = (3, 4, 0) onto the unit vector b = (1, 0, 0).",
          starter: "", hint: "For a unit b, the projection length is simply a·b.",
          validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01 ? { pass: true, message: "Correct — a·b = 3, and |b| = 1." } : { pass: false, message: "Projection length is (a·b)/|b|; here |b| = 1." },
        },
      ],
    },
    {
      id: "cross", title: "Cross Product & Normals", minutes: 10,
      summary: "A perpendicular vector — how triangles know which way they face.",
      Body: CrossProduct,
      quiz: {
        questions: [
          { q: "The cross product a×b is…", choices: ["A number", "Parallel to a", "Perpendicular to both a and b", "Always zero"], answer: 2, explain: "It returns a vector perpendicular to the plane of a and b." },
          { q: "Swapping to b×a…", choices: ["Gives the same result", "Flips the normal's direction", "Doubles the length", "Is undefined"], answer: 1, explain: "The cross product is anti-commutative: b×a = -(a×b)." },
        ],
      },
      exercises: [
        {
          id: "cross-z", kind: "numeric", prompt: "For a = (1, 0, 0) and b = (0, 1, 0), enter the z-component of a×b.",
          starter: "", hint: "z = a_x b_y − a_y b_x = 1·1 − 0·0.",
          validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01 ? { pass: true, message: "Correct — î × ĵ = k̂, so z = 1." } : { pass: false, message: "z = a_x·b_y − a_y·b_x." },
        },
        {
          id: "cross-x", kind: "numeric", prompt: "For a = (1, 2, 3) and b = (4, 5, 6), enter the x-component of a×b.",
          starter: "", hint: "x = a_y b_z − a_z b_y = 2·6 − 3·5.",
          validate: (s) => Math.abs(parseFloat(s) - (-3)) < 0.01 ? { pass: true, message: "Correct — 12 − 15 = -3." } : { pass: false, message: "x = a_y·b_z − a_z·b_y." },
        },
        {
          id: "cross-y", kind: "numeric", prompt: "For a = (1, 2, 3) and b = (4, 5, 6), enter the y-component of a×b.",
          starter: "", hint: "y = a_z b_x − a_x b_z = 3·4 − 1·6.",
          validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01 ? { pass: true, message: "Correct — 12 − 6 = 6." } : { pass: false, message: "y = a_z·b_x − a_x·b_z." },
        },
        {
          id: "cross-area", kind: "numeric", prompt: "Enter the area of the parallelogram spanned by a = (3, 0, 0) and b = (0, 4, 0). This equals |a×b|.",
          starter: "", hint: "a×b = (0, 0, 12); take its length.",
          validate: (s) => Math.abs(parseFloat(s) - 12) < 0.01 ? { pass: true, message: "Correct — |a×b| = 12." } : { pass: false, message: "Compute a×b, then its magnitude." },
        },
      ],
    },
    {
      id: "matrices", title: "Matrices as Transforms", minutes: 14,
      summary: "Columns are where the basis vectors land; determinant is area scale.",
      Body: Matrices,
      quiz: {
        questions: [
          { q: "The columns of a transform matrix tell you…", choices: ["The determinant", "Where the basis vectors (î, ĵ) land", "The rotation angle only", "Nothing useful"], answer: 1, explain: "Each column is the image of a basis vector — the core intuition." },
          { q: "A negative determinant means…", choices: ["The matrix is invalid", "Space is scaled up", "Space is flipped (mirrored)", "No rotation"], answer: 2, explain: "Negative determinant flips orientation — a reflection." },
        ],
      },
      exercises: [
        {
          id: "mat-det", kind: "numeric", prompt: "Enter the determinant of the 2×2 matrix with rows [2, 3] and [1, 4].",
          starter: "", hint: "det = a·d − b·c = 2·4 − 3·1.",
          validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — 8 − 3 = 5." } : { pass: false, message: "det = (top-left · bottom-right) − (top-right · bottom-left)." },
        },
        {
          id: "mat-trace", kind: "numeric", prompt: "Enter the trace (sum of the diagonal) of the 2×2 matrix with rows [7, 2] and [5, 3].",
          starter: "", hint: "Add the two diagonal entries 7 and 3.",
          validate: (s) => Math.abs(parseFloat(s) - 10) < 0.01 ? { pass: true, message: "Correct — 7 + 3 = 10." } : { pass: false, message: "Sum the top-left and bottom-right entries." },
        },
        {
          id: "mat-mv", kind: "numeric", prompt: "The matrix with rows [2, 0] and [1, 3] multiplies the vector (4, 5). Enter the y-component (second entry) of the result.",
          starter: "", hint: "Second row dotted with the vector: 1·4 + 3·5.",
          validate: (s) => Math.abs(parseFloat(s) - 19) < 0.01 ? { pass: true, message: "Correct — 1·4 + 3·5 = 19." } : { pass: false, message: "Dot the second row [1, 3] with (4, 5)." },
        },
        {
          id: "mat-prod", kind: "numeric", prompt: "Multiply A (rows [1, 2], [3, 4]) by B (rows [5, 6], [7, 8]). Enter the top-left entry of the product AB.",
          starter: "", hint: "Row 1 of A dotted with column 1 of B: 1·5 + 2·7.",
          validate: (s) => Math.abs(parseFloat(s) - 19) < 0.01 ? { pass: true, message: "Correct — 1·5 + 2·7 = 19." } : { pass: false, message: "Dot A's first row [1, 2] with B's first column [5, 7]." },
        },
        {
          id: "mat-detflip", kind: "numeric", prompt: "Enter the determinant of the matrix with rows [0, 1] and [1, 0] (a reflection).",
          starter: "", hint: "det = 0·0 − 1·1.",
          validate: (s) => Math.abs(parseFloat(s) - (-1)) < 0.01 ? { pass: true, message: "Correct — −1: a negative determinant means space is mirrored." } : { pass: false, message: "det = 0·0 − 1·1 = −1." },
        },
      ],
    },
    {
      id: "mvp", title: "The MVP Pipeline", minutes: 15,
      summary: "P_clip = M_proj · M_view · M_model · v — the heart of 3D.",
      Body: MVP,
      quiz: {
        questions: [
          { q: "In P = proj·view·model·v, which transform is applied to the vertex FIRST?", choices: ["Projection", "View", "Model", "They're simultaneous"], answer: 2, explain: "Read right-to-left: model acts on v first, then view, then projection." },
          { q: "The view matrix is essentially…", choices: ["The camera's world transform", "The inverse of the camera's transform", "The projection", "The identity"], answer: 1, explain: "To put the camera at the origin, you transform the world by the camera's inverse." },
        ],
      },
      exercises: [
        {
          id: "mvp-divide-x", kind: "numeric", prompt: "A clip-space coordinate is (x, y, z, w) = (3, -6, 2, 6). After the perspective divide, enter the NDC x-component. Round to 2 decimals.",
          starter: "", hint: "NDC x = x / w = 3 / 6.",
          validate: (s) => Math.abs(parseFloat(s) - 0.5) < 0.05 ? { pass: true, message: "Correct — 3 / 6 = 0.5." } : { pass: false, message: "Divide the clip x by w." },
        },
        {
          id: "mvp-divide-y", kind: "numeric", prompt: "For the clip-space coordinate (3, -6, 2, 6), enter the NDC y-component after the perspective divide. Round to 2 decimals.",
          starter: "", hint: "NDC y = y / w = -6 / 6.",
          validate: (s) => Math.abs(parseFloat(s) - (-1)) < 0.05 ? { pass: true, message: "Correct — -6 / 6 = -1 (bottom edge of the clip cube)." } : { pass: false, message: "Divide the clip y by w." },
        },
        {
          id: "mvp-aspect", kind: "numeric", prompt: "A render target is 1920 by 1080 pixels. Enter its aspect ratio (width / height), rounded to 2 decimals.",
          starter: "", hint: "1920 / 1080.",
          validate: (s) => Math.abs(parseFloat(s) - 1.78) < 0.05 ? { pass: true, message: "Correct — 1920 / 1080 ≈ 1.78." } : { pass: false, message: "Divide width by height." },
        },
        {
          id: "mvp-proj-entry", kind: "numeric", prompt: "For a perspective matrix, entry m[0][0] = 1 / (aspect · tan(fovy/2)). With a 90° vertical FOV and aspect = 2, enter m[0][0]. Round to 2 decimals.",
          starter: "", hint: "tan(45°) = 1, so m[0][0] = 1 / (2 · 1).",
          validate: (s) => Math.abs(parseFloat(s) - 0.5) < 0.05 ? { pass: true, message: "Correct — 1 / (2 · tan45°) = 1 / 2 = 0.5." } : { pass: false, message: "tan(45°) = 1, so compute 1 / (aspect · 1)." },
        },
      ],
    },
    {
      id: "quaternions", title: "Quaternions & Rotation", minutes: 14,
      summary: "Gimbal-lock-free rotation, composition, and smooth slerp.",
      Body: Quaternions,
      quiz: {
        questions: [
          { q: "The main problem with Euler angles that quaternions solve is…", choices: ["They use too much memory", "Gimbal lock — losing a degree of freedom", "They can't rotate at all", "They're slower to store"], answer: 1, explain: "At certain orientations two Euler axes align and you lose a rotational DOF." },
          { q: "A quaternion represents a pure rotation when it is…", choices: ["All positive", "Unit length (|q| = 1)", "Integer-valued", "Equal to (1,0,0,0) only"], answer: 1, explain: "Unit quaternions map one-to-two onto rotations; non-unit ones also scale." },
          { q: "Slerp is used to…", choices: ["Normalize a matrix", "Smoothly interpolate between two orientations", "Compute a cross product", "Cull triangles"], answer: 1, explain: "Spherical linear interpolation blends along the shortest arc on the unit sphere." },
        ],
      },
      exercises: [
        {
          id: "quat-open", kind: "open",
          prompt: "In your own words, explain why we renormalize a quaternion periodically during gameplay, and what visual artifact appears if we don't.",
          starter: "",
          rubric: "Full credit: mentions floating-point error accumulating from repeated multiplication pushing |q| away from 1, and that a non-unit quaternion introduces scaling/shear (model stretching/skewing). Partial: mentions drift OR the artifact but not both.",
          hint: "Think about what repeated multiplication does to |q|, and what a non-unit quaternion does when converted to a matrix.",
        },
        {
          id: "quat-w90", kind: "numeric", prompt: "A quaternion represents a rotation of θ = 90° about a unit axis. Enter its scalar part w = cos(θ/2), rounded to 3 decimals.",
          starter: "", hint: "cos(45°).",
          validate: (s) => Math.abs(parseFloat(s) - 0.707) < 0.01 ? { pass: true, message: "Correct — cos(45°) ≈ 0.707." } : { pass: false, message: "Compute cos(90°/2) = cos(45°)." },
        },
        {
          id: "quat-w180", kind: "numeric", prompt: "For a rotation of θ = 180°, enter the scalar part w = cos(θ/2).",
          starter: "", hint: "cos(90°).",
          validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01 ? { pass: true, message: "Correct — cos(90°) = 0." } : { pass: false, message: "Compute cos(180°/2) = cos(90°)." },
        },
        {
          id: "quat-comp", kind: "numeric", prompt: "A rotation of θ = 90° about the axis (0, 1, 0) gives q = (w, x, y, z). Enter the y-component, y = sin(θ/2)·1, rounded to 3 decimals.",
          starter: "", hint: "sin(45°) times the axis y = 1.",
          validate: (s) => Math.abs(parseFloat(s) - 0.707) < 0.01 ? { pass: true, message: "Correct — sin(45°) ≈ 0.707." } : { pass: false, message: "Compute sin(90°/2) times the axis y-component (1)." },
        },
        {
          id: "quat-w60", kind: "numeric", prompt: "For a rotation of θ = 60°, enter the scalar part w = cos(θ/2), rounded to 3 decimals.",
          starter: "", hint: "cos(30°).",
          validate: (s) => Math.abs(parseFloat(s) - 0.866) < 0.01 ? { pass: true, message: "Correct — cos(30°) ≈ 0.866." } : { pass: false, message: "Compute cos(60°/2) = cos(30°)." },
        },
      ],
    },
    {
      id: "clip-space", title: "Clip Space, NDC & the Frustum", minutes: 13,
      summary: "Homogeneous w, the perspective divide, and where culling happens.",
      Body: ClipSpace,
      quiz: {
        questions: [
          { q: "The perspective divide is…", choices: ["Multiplying by the model matrix", "Dividing (x,y,z) by w to get NDC", "Adding the view matrix", "Normalizing the normal"], answer: 1, explain: "Dividing the clip-space coordinate by w produces normalized device coordinates." },
          { q: "In Metal/WebGPU, the NDC depth (z) range is…", choices: ["−1 to 1", "0 to 1", "0 to 255", "−∞ to ∞"], answer: 1, explain: "Metal, WebGPU, and D3D use 0..1 depth; OpenGL uses −1..1." },
        ],
      },
      exercises: [
        {
          id: "clip-ndc-x", kind: "numeric", prompt: "A clip-space point is (x, y, z, w) = (10, 5, 4, 8). Enter its NDC x-component after the perspective divide. Round to 3 decimals.",
          starter: "", hint: "NDC x = x / w = 10 / 8.",
          validate: (s) => Math.abs(parseFloat(s) - 1.25) < 0.05 ? { pass: true, message: "Correct — 10 / 8 = 1.25 (outside [-1, 1], so this point is clipped in x)." } : { pass: false, message: "Divide clip x by w." },
        },
        {
          id: "clip-ndc-z", kind: "numeric", prompt: "For the clip-space point (10, 5, 4, 8), enter the NDC z-component after the perspective divide. Round to 2 decimals.",
          starter: "", hint: "NDC z = z / w = 4 / 8.",
          validate: (s) => Math.abs(parseFloat(s) - 0.5) < 0.05 ? { pass: true, message: "Correct — 4 / 8 = 0.5, inside the 0..1 depth range." } : { pass: false, message: "Divide clip z by w." },
        },
        {
          id: "clip-inside", kind: "numeric", prompt: "Is the clip-space point (2, -1, 3, 4) inside the x/y clip bounds (−w ≤ x, y ≤ w)? Enter 1 for yes, 0 for no.",
          starter: "", hint: "Check whether both 2 and -1 lie within [-4, 4].",
          validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01 ? { pass: true, message: "Correct — both 2 and -1 lie within [-4, 4], so it passes the x/y test." } : { pass: false, message: "With w = 4, the bounds are [-4, 4]; both x and y fit." },
        },
        {
          id: "clip-outside", kind: "numeric", prompt: "Is the clip-space point (5, 0, 1, 4) inside the x/y clip bounds (−w ≤ x, y ≤ w)? Enter 1 for yes, 0 for no.",
          starter: "", hint: "Is x = 5 within [-4, 4]?",
          validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01 ? { pass: true, message: "Correct — x = 5 exceeds w = 4, so the point is clipped." } : { pass: false, message: "x = 5 is outside [-4, 4], so the answer is 0." },
        },
      ],
    },
  ],
};
