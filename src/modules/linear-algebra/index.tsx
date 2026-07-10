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
        In web dev, a "position" is usually two CSS numbers you never think about together. In 3D,
        position and direction are first-class values called <strong>vectors</strong> — an ordered
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
    },
  ],
};
