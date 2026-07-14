import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { CodeTabs } from "../../components/code-block";
import { VectorPlayground } from "../../widgets/VectorPlayground";
import { MatrixTransform2D } from "../../widgets/MatrixTransform2D";
import { TransformPipeline3D } from "../../widgets/TransformPipeline3D";
import { Notice } from "../../components/ui";
function Vectors() {
    return (<div className="prose">
      <p>
        In standard programming, coordinates like <code>x</code> and <code>y</code> are often just treated as
        separate variables or fields in an object (e.g., <code>mouse.x</code>, <code>mouse.y</code>). In 3D graphics,
        however, space and motion are first-class citizens. To represent them, we bundle these numbers into a single
        mathematical entity called a <strong>vector</strong>—an ordered sequence (tuple) of numbers representing components
        along coordinate axes.
      </p>
      <p>
        Geometrically, we visualize a vector as a <strong>directed arrow</strong>. This arrow represents two core properties:
      </p>
      <ul>
        <li><strong>Direction</strong>: Where the arrow points in space.</li>
        <li><strong>Magnitude (or Length)</strong>: How long the arrow is. This corresponds to the size of the displacement or speed of a movement.</li>
      </ul>
      <p>
        Because a vector represents a relative movement or displacement rather than a fixed location, 
        <em> it does not have a fixed starting position</em>. You can slide the arrow anywhere in your coordinate system, and as long as its length and direction do not change, it remains the exact same vector.
      </p>

      <h3>Points vs. Vectors</h3>
      <p>
        In 3D code, both positions (locations) and displacements (directions) are represented as 3-tuples <M>{`(x, y, z)`}</M>. However, they represent fundamentally different geometric concepts:
      </p>
      <ul>
        <li>
          A <strong>Point</strong> is an absolute location in space. It is anchored to a specific coordinate system's <strong>origin</strong> <M>{`(0, 0, 0)`}</M>.
        </li>
        <li>
          A <strong>Vector</strong> is a relative displacement (movement) from one location to another. It does not care about the origin.
        </li>
      </ul>
      <p>
        This distinction leads to natural operations that link them:
      </p>
      <ul>
        <li>
          <M>{`\\text{Point} - \\text{Point} = \\text{Vector}`}</M>: Subtracting the starting point <M>{`p_0`}</M> from the ending point <M>{`p_1`}</M> yields a displacement vector <M>{`v = p_1 - p_0`}</M> that represents the movement from <M>{`p_0`}</M> to <M>{`p_1`}</M>.
        </li>
        <li>
          <M>{`\\text{Point} + \\text{Vector} = \\text{Point}`}</M>: Adding a displacement vector <M>{`v`}</M> to a point <M>{`p_0`}</M> shifts it to a new location <M>{`p_1 = p_0 + v`}</M>.
        </li>
        <li>
          <M>{`\\text{Vector} + \\text{Vector} = \\text{Vector}`}</M>: Combining two movements yields a net displacement.
        </li>
        <li>
          Adding two points (<M>{`p_0 + p_1`}</M>) is mathematically meaningless in geometric space because you cannot "add" two absolute locations.
        </li>
      </ul>

      <h3>Fundamental Operations</h3>
      <p>These four basic operations form the building blocks of all vector mathematics:</p>
      <ol>
        <li>
          <strong>Vector Addition</strong> (<M>{`a + b`}</M>):
          <br />
          Algebraically, add the corresponding components: <M>{`a + b = (a_x + b_x, a_y + b_y, a_z + b_z)`}</M>.
          <br />
          Geometrically, place the tail of vector <M>{`b`}</M> at the tip of vector <M>{`a`}</M>. The sum vector points from the start of <M>{`a`}</M> to the end of <M>{`b`}</M> (tip-to-tail method).
        </li>
        <li>
          <strong>Scalar Multiplication/Scaling</strong> (<M>{`s \\cdot a`}</M>):
          <br />
          Algebraically, multiply every component by a scalar number <M>{`s`}</M>: <M>{`s \\cdot a = (s \\cdot a_x, s \\cdot a_y, s \\cdot a_z)`}</M>.
          <br />
          Geometrically, this stretches or shrinks the vector's length by factor <M>{`|s|`}</M>. If <M>{`s < 0`}</M>, it also flips the direction of the arrow to point in the opposite direction.
        </li>
        <li>
          <strong>Length / Magnitude</strong> (<M>{`|a|`}</M>):
          <br />
          This is the distance from the tail to the tip of the arrow (or the Euclidean distance of a point from the origin). In 3D space, we calculate it using the Pythagorean theorem:
          <MBlock>{`|a| = \\sqrt{a_x^2 + a_y^2 + a_z^2}`}</MBlock>
        </li>
        <li>
          <strong>Normalize</strong> (<M>{`\\hat{a}`}</M>):
          <br />
          Dividing a vector by its own length scales it so its magnitude is exactly 1: <M>{`\\hat{a} = a / |a|`}</M>.
          <br />
          This is called a <strong>unit vector</strong>. Unit vectors are used extensively in graphics when we only care about direction (like the direction of a light source, a surface normal, or a camera view ray) and want to ignore scale.
        </li>
      </ol>
      <VectorPlayground />
      <p>
        Drag the arrows above. Notice the readout: those numbers are exactly what your shader
        computes millions of times per frame. Here's the same math in the three languages you'll
        move between:
      </p>
      <CodeTabs tabs={[
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
        ]}/>
      <Notice>
        <span className="lbl">The shift from web</span>
        There is no <code>Vector</code> class with methods. A vector is raw numbers laid out in
        memory. Odin's <code>[3]f32</code>, Metal's <code>float3</code>, and WGSL's{" "}
        <code>vec3&lt;f32&gt;</code> are the same 12 bytes — which is exactly why you can hand them
        straight to the GPU.
      </Notice>
    </div>);
}
function DotProduct() {
    return (<div className="prose">
      <p>
        The dot product (also known as the scalar product) takes two vectors and multiplies them component-by-component,
        summing the results. Instead of returning a new vector, it collapses them into a single scalar value:
      </p>
      <MBlock>{`a \\cdot b = a_x b_x + a_y b_y + a_z b_z`}</MBlock>

      <h3>Geometric Interpretation and Projection</h3>
      <p>
        The dot product has a beautiful geometric definition that links it to the angle <M>{`\\theta`}</M> between the two vectors:
      </p>
      <MBlock>{`a \\cdot b = |a|\\,|b|\\cos\\theta`}</MBlock>
      <p>
        If one of the vectors is normalized (say, a unit vector <M>{`\\hat{b}`}</M> with length 1), the formula simplifies to:
        <MBlock>{`a \\cdot \\hat{b} = |a|\\cos\\theta`}</MBlock>
        This value represents the <strong>scalar projection</strong> of <M>{`a`}</M> onto the direction of <M>{`\\hat{b}`}</M>. Visually, it is the length of the "shadow" that vector <M>{`a`}</M> casts onto a line running along the direction of <M>{`\\hat{b}`}</M>.
      </p>

      <h3>Sign Analysis and Angle Check</h3>
      <p>
        Because the lengths <M>{`|a|`}</M> and <M>{`|b|`}</M> are always non-negative, the sign of the dot product is determined entirely by the cosine of the angle between them:
      </p>
      <ul>
        <li>
          <strong><M>{`a \\cdot b > 0`}</M> (Positive)</strong>: The angle between them is acute (&lt; 90°). The vectors point roughly in the same direction.
        </li>
        <li>
          <strong><M>{`a \\cdot b = 0`}</M> (Zero)</strong>: The angle is exactly 90°. The vectors are <strong>perpendicular</strong> (orthogonal).
        </li>
        <li>
          <strong><M>{`a \\cdot b < 0`}</M> (Negative)</strong>: The angle is obtuse (&gt; 90°). The vectors point roughly in opposite directions.
        </li>
      </ul>

      <h3>Applications in Shaders: Lambert Shading</h3>
      <p>
        This simple multiplication is the engine behind 3D lighting. In diffuse shading (Lambertian reflectance), the brightness of a surface depends on the angle at which light hits it.
      </p>
      <p>
        If <M>{`\\hat{n}`}</M> is the unit surface normal (pointing straight out of the polygon) and <M>{`\\hat{l}`}</M> is the unit vector pointing toward the light source:
      </p>
      <ul>
        <li>
          When the light is directly overhead, the angle is 0°, <M>{`\\cos(0) = 1`}</M>, and the dot product is <M>{`1`}</M> (maximum brightness).
        </li>
        <li>
          As the light slopes away, the dot product decreases.
        </li>
        <li>
          If the light goes below the horizon, the angle exceeds 90°, yielding a negative dot product. Since a surface cannot have "negative brightness," we clamp it to zero using <M>{`\\max(0, \\hat{n} \\cdot \\hat{l})`}</M>.
        </li>
      </ul>
      <VectorPlayground />
      <Notice>
        <span className="lbl">Try it</span>
        Rotate <code>b</code> until <code>a · b</code> hits 0 in the readout — that's the moment the
        two arrows form a right angle.
      </Notice>
    </div>);
}
function CrossProduct() {
    return (<div className="prose">
      <p>
        Unlike the dot product which outputs a scalar, the cross product takes two 3D vectors and returns a 
        <strong> new 3D vector</strong>. This resulting vector has a unique property: it is 
        <strong> perpendicular to both input vectors</strong>.
      </p>
      <MBlock>{`a \\times b = (a_y b_z - a_z b_y,\\; a_z b_x - a_x b_z,\\; a_x b_y - a_y b_x)`}</MBlock>

      <h3>Direction: The Right-Hand Rule</h3>
      <p>
        Since two vectors define a flat plane, there are two possible directions that are perpendicular to that plane (one pointing "up", one pointing "down"). The cross product's direction is determined by the <strong>Right-Hand Rule</strong>:
      </p>
      <p>
        If you curl the fingers of your right hand from <M>{`a`}</M> to <M>{`b`}</M>, your thumb points in the direction of <M>{`a \\times b`}</M>.
      </p>
      <p>
        This means the order of operations is critical: the cross product is anti-commutative. Swapping the inputs flips the direction:
        <MBlock>{`a \\times b = -(b \\times a)`}</MBlock>
      </p>

      <h3>Magnitude: Parallelogram Area</h3>
      <p>
        The length of the resulting cross product vector encodes the sine of the angle between them:
        <MBlock>{`|a \\times b| = |a|\\,|b|\\sin\\theta`}</MBlock>
        Geometrically, this length is exactly equal to the <strong>area of the parallelogram</strong> spanned by the two vectors. 
        If the two vectors are parallel (angle is 0° or 180°), <M>{`\\sin\\theta = 0`}</M> and the cross product is the zero vector <M>{`(0, 0, 0)`}</M>.
      </p>

      <h3>Calculating Surface Normals</h3>
      <p>
        Normals (perpendicular vectors) are how a 3D engine knows which way a flat triangle faces. Given a triangle with three vertices in counter-clockwise order: <M>{`p_0, p_1, p_2`}</M>, we find the face normal by:
      </p>
      <ol>
        <li>Creating two edge vectors sharing a corner: <M>{`e_1 = p_1 - p_0`}</M> and <M>{`e_2 = p_2 - p_0`}</M>.</li>
        <li>Taking their cross product: <M>{`e_1 \\times e_2`}</M>.</li>
        <li>Normalizing the result to unit length.</li>
      </ol>
      <MBlock>{`\\hat{n} = \\text{normalize}\\big((p_1 - p_0) \\times (p_2 - p_0)\\big)`}</MBlock>
      <p>
        If the vertices were wound in clockwise order, the edges would be crossed in reverse, causing the normal to point inside the object (making the surface render black or be culled entirely). Winding order matters!
      </p>
      <CodeTabs tabs={[
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
        ]}/>
      <Notice warn>
        <span className="lbl">Watch the order</span>
        <M>{`a \\times b = -(b \\times a)`}</M>. Swapping the arguments flips the normal to point the
        other way — which flips whether a face is lit or in shadow. Winding order matters.
      </Notice>
    </div>);
}
function Matrices() {
    return (<div className="prose">
      <p>
        A matrix is a grid of numbers, but in graphics, it is best understood as a 
        <strong> machine that transforms space</strong>—warping, rotating, scaling, or shearing vectors from one coordinate system to another.
      </p>

      <h3>Columns are Basis Vector Destinations</h3>
      <p>
        Let's look at standard 2D space. Any vector can be described as a combination of the two standard basis vectors: 
        <M>{`\\hat{\\imath} = (1, 0)`}</M> (pointing along X) and <M>{`\\hat{\\jmath} = (0, 1)`}</M> (pointing along Y).
      </p>
      <p>
        Under any linear transformation, <em>every point in space moves proportionally</em>. This means to know how a matrix transforms 
        <strong> any</strong> vector, we only need to know where it sends the basis vectors <M>{`\\hat{\\imath}`}</M> and <M>{`\\hat{\\jmath}`}</M>.
      </p>
      <p>
        If we put the destination of <M>{`\\hat{\\imath}`}</M> in the first column, and the destination of <M>{`\\hat{\\jmath}`}</M> in the second column, we get a transform matrix:
      </p>
      <MBlock>{`M = \\begin{bmatrix} a & c \\\\ b & d \\end{bmatrix}`}</MBlock>
      <p>
        Multiplying this matrix by a vector <M>{`v = (x, y)`}</M> is algebraically equivalent to scale-and-add:
      </p>
      <MBlock>{`M \\cdot v = \\begin{bmatrix} a & c \\\\ b & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = x \\begin{bmatrix} a \\\\ b \\end{bmatrix} + y \\begin{bmatrix} c \\\\ d \\end{bmatrix}`}</MBlock>
      <p>
        We are scaling the new X basis vector by <M>{`x`}</M>, scaling the new Y basis vector by <M>{`y`}</M>, and adding them together. This is why a matrix is just a container for the new basis vectors of the transformed space.
      </p>
      <MatrixTransform2D />
      <p>
        Drag the sliders and watch the grid warp. The orange <M>{`\\hat{\\imath}`}</M> and blue{" "}
        <M>{`\\hat{\\jmath}`}</M> arrows are literally the columns of the matrix.
      </p>

      <h3>The Determinant: Scaling Space</h3>
      <p>
        The <strong>determinant</strong> of a matrix is a single scalar value. In 2D, it represents how much the area of a unit square scales when transformed:
      </p>
      <ul>
        <li>
          <strong><M>{`\\det(M) = 1`}</M></strong>: Area is preserved (e.g., pure rotations or shears).
        </li>
        <li>
          <strong><M>{`\\det(M) = 0`}</M></strong>: Space has collapsed into a lower dimension (e.g., squashed to a 1D line or 0D point), meaning the transform cannot be inverted.
        </li>
        <li>
          <strong><M>{`\\det(M) < 0`}</M></strong>: The grid has been flipped inside out (like a mirror reflection). The winding order of triangles is reversed.
        </li>
      </ul>

      <Notice>
        <span className="lbl">Column-major Storage</span>
        Odin's <code>linalg</code>, Metal, and WGSL all store matrices <strong>column-major</strong>
        {" "}— the first four numbers in memory are the first column. This course's math library uses
        the same convention so the browser demos and the Odin code agree byte-for-byte.
      </Notice>
    </div>);
}
function MVP() {
    return (<div className="prose">
      <p>
        To render a 3D asset (like a character) standing in a virtual world onto a flat 2D screen, 
        its vertices must travel through a series of coordinate systems. This sequence is controlled by 
        multiplying the vertex position by three distinct matrices. This chain is the heart of 3D pipelines:
      </p>
      <MBlock>{`P_{clip} = M_{proj} \\cdot M_{view} \\cdot M_{model} \\cdot v_{local}`}</MBlock>

      <h3>Evaluating Right-to-Left</h3>
      <p>
        Matrix-vector multiplication evaluates from right to left. The vector <M>{`v_{local}`}</M> is first modified by the model matrix, then the view matrix, and finally the projection matrix:
      </p>
      <ol>
        <li>
          <strong>Model Matrix (<M>{`M_{model}`}</M>)</strong>: 
          Transforms vertices from <strong>Local Space</strong> (relative to the model's pivot point, e.g. the character's feet) to <strong>World Space</strong> (placing the model at a specific position, rotation, and size in the entire virtual map).
        </li>
        <li>
          <strong>View Matrix (<M>{`M_{view}`}</M>)</strong>: 
          Transforms coordinates from World Space to <strong>View Space</strong> (also called camera space). In View Space, the camera is positioned at the origin <M>{`(0,0,0)`}</M>, looking down the negative Z-axis.
          <br />
          <em>Intuition:</em> To position the camera, we do the opposite of moving the camera. The view matrix is the <strong>inverse</strong> of the camera's world transform. If the camera moves up and right, the view matrix shifts the entire world down and left.
        </li>
        <li>
          <strong>Projection Matrix (<M>{`M_{proj}`}</M>)</strong>: 
          Transforms coordinates from View Space to <strong>Clip Space</strong>. It sets up the perspective projection: it divides the coordinate values by distance so that objects further away appear smaller, and maps the visible frustum cone into a standardized box for the GPU.
        </li>
      </ol>
      <TransformPipeline3D />
      <p>
        Toggle each matrix off above to feel what it does. This exact chain runs in the vertex
        shader once per vertex:
      </p>
      <CodeTabs tabs={[
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
        ]}/>
    </div>);
}
function Quaternions() {
    return (<div className="prose">
      <p>
        Rotating 3D objects with simple angles—<strong>Euler angles</strong> (Yaw, Pitch, Roll)—seems intuitive, but has severe limitations:
      </p>
      <ul>
        <li>
          <strong>Gimbal Lock</strong>: When rotating sequentially about three axes, rotating one axis by 90° can align the other two axes. You lose one rotational degree of freedom, and the camera/object becomes stuck or spins unexpectedly.
        </li>
        <li>
          <strong>Interpolation Artifacts</strong>: Blending between two Euler orientations does not follow the shortest path, leading to unnatural speed changes and wobbly rotations.
        </li>
      </ul>

      <h3>What is a Quaternion?</h3>
      <p>
        To solve this, we use <strong>quaternions</strong>. A quaternion is a 4D number representing a rotation in 3D space. 
        For a rotation of angle <M>{`\\theta`}</M> around a normalized 3D axis vector <M>{`\\hat{n} = (n_x, n_y, n_z)`}</M>, the unit quaternion <M>{`q`}</M> is defined as:
      </p>
      <MBlock>{`q = (w,\\; x,\\; y,\\; z) = \\left(\\cos\\tfrac{\\theta}{2},\\; \\hat{n}_x\\sin\\tfrac{\\theta}{2},\\; \\hat{n}_y\\sin\\tfrac{\\theta}{2},\\; \\hat{n}_z\\sin\\tfrac{\\theta}{2}\\right)`}</MBlock>

      <h3>Applying and Composing Rotations</h3>
      <p>
        To rotate a vector <M>{`v`}</M>, we convert it into a quaternion with <M>{`w=0`}</M> and compute the product:
        <MBlock>{`v' = q \\cdot v \\cdot q^{-1}`}</MBlock>
        To avoid expensive quaternion math in shaders, we can use Rodrigues' rotation formula.
      </p>
      <p>
        Combining rotations is simple: multiplying two quaternions <M>{`q_a \\cdot q_b`}</M> yields a single quaternion representing rotation <M>{`b`}</M> followed by rotation <M>{`a`}</M>. Order matters!
      </p>

      <h3>Slerp: Smooth Interpolation</h3>
      <p>
        Quaternions allow for <strong>Slerp</strong> (Spherical Linear Interpolation). Unlike linear interpolation, Slerp traverses the shortest path along the surface of a unit sphere at a constant angular speed. This is crucial for smooth camera transitions and character bone animations.
      </p>
      <CodeTabs tabs={[
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
        ]}/>
      <Notice warn>
        <span className="lbl">Renormalize</span>
        Repeated multiplication accumulates floating-point error and the quaternion drifts off the unit
        sphere, shearing your model. Renormalize (<code>q / |q|</code>) periodically — it's far cheaper
        than re-orthonormalizing a 3×3 matrix.
      </Notice>
    </div>);
}
function ClipSpace() {
    return (<div className="prose">
      <p>
        The output of your vertex shader is a 4D coordinate <M>{`(x, y, z, w)`}</M> in <strong>Clip Space</strong>. 
        It is a homogeneous coordinate where the fourth component, <M>{`w`}</M>, plays a critical role in 3D perspective projection.
      </p>

      <h3>The Perspective Divide</h3>
      <p>
        After the vertex shader runs, the GPU hardware automatically performs the <strong>perspective divide</strong>, dividing the spatial components <M>{`x, y, z`}</M> by <M>{`w`}</M> to transition to <strong>Normalized Device Coordinates (NDC)</strong>:
      </p>
      <MBlock>{`\\text{NDC} = \\left(\\tfrac{x}{w},\\, \\tfrac{y}{w},\\, \\tfrac{z}{w}\\right)`}</MBlock>
      <p>
        This division is what creates the perspective effect: since <M>{`w`}</M> is proportional to depth (how far the vertex is from the camera), dividing by <M>{`w`}</M> makes distant vertices shift closer to the center of the screen, shrinking them.
      </p>

      <h3>Frustum Clipping</h3>
      <p>
        In Clip Space (before the divide), the GPU checks if a coordinate is within the visible volume. A vertex is inside the screen boundaries if:
      </p>
      <MBlock>{`-w \\le x \\le w \\quad \\text{and} \\quad -w \\le y \\le w`}</MBlock>
      <p>
        This check is performed in clip space because it is computationally cheap and avoids division-by-zero or numerical issues for points behind the camera (<M>{`w \\le 0`}</M>).
      </p>

      <h3>Depth Range Convention Warnings</h3>
      <p>
        While NDC horizontal/vertical coordinates <M>{`x`}</M> and <M>{`y`}</M> are mapped to <M>{`[-1, 1]`}</M> across all graphics engines, the depth component <M>{`z`}</M> boundaries vary by API:
      </p>
      <ul>
        <li>
          <strong>Metal, WebGPU, and Direct3D</strong> use a range of <strong>0 to 1</strong> (so a vertex is visible if <M>{`0 \\le z \\le w`}</M> in clip space).
        </li>
        <li>
          <strong>OpenGL</strong> uses a range of <strong>−1 to 1</strong> (so a vertex is visible if <M>{`-w \\le z \\le w`}</M>).
        </li>
      </ul>
      <p>
        Using the wrong projection matrix will result in geometry being clipped incorrectly at the near plane or failing depth testing.
      </p>
      <CodeTabs tabs={[
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
        ]}/>
    </div>);
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
