import type { Module } from "../../content/types";
import { Code } from "../../components/CodeBlock";
import { M, MBlock } from "../../components/Math";
import { TriangleDemo } from "../../widgets/TriangleDemo";
import { TransformPipeline3D } from "../../widgets/TransformPipeline3D";
import { TerrainField } from "../../widgets/TerrainField";
import { SplineEditor } from "../../widgets/SplineEditor";

function Step1() {
  return (
    <div className="prose">
      <p>
        This is it — the "Hello, World" of graphics. It feels humble, but drawing one triangle forces
        you to stand up the <em>entire</em> pipeline correctly: open a window, get a Metal layer,
        compile shaders, make a vertex buffer, and record a draw call. Everything after this is
        variations on this theme.
      </p>

      <h3>Swap Chains & Double/Triple Buffering</h3>
      <p>
        If you render directly to the screen's active buffer, the user will see your objects being drawn shape-by-shape, causing intense flickering. 
        To solve this, graphics APIs use a <strong>swap chain</strong> containing multiple framebuffers:
      </p>
      <ul>
        <li>
          <strong>Double Buffering</strong>: Uses two buffers — a <em>Front Buffer</em> (currently displayed on the monitor) and a <em>Back Buffer</em> (where the GPU is drawing the next frame). 
          Once the GPU finishes, the buffers swap roles during the monitor's Vertical Blanking Interval (VSync). 
          If the GPU finishes early, it must block and wait for VSync, wasting CPU/GPU time.
        </li>
        <li>
          <strong>Triple Buffering</strong>: Adds a second <em>Back Buffer</em>. The GPU can immediately start drawing the next frame in the third buffer while the first back buffer waits for VSync, eliminating GPU stalls and keeping throughput high.
        </li>
      </ul>

      <TriangleDemo />
      <p>Locally, in Odin, the skeleton is:</p>
      <Code
        lang="odin" filename="odin-examples/01-triangle/main.odin"
        code={`package main

import "vendor:glfw"
import NS  "core:sys/darwin/Foundation"
import MTL "core:sys/darwin/Metal"
import CA  "core:sys/darwin/QuartzCore"

main :: proc() {
    glfw.Init(); defer glfw.Terminate()
    glfw.WindowHint(glfw.CLIENT_API, glfw.NO_API)
    window := glfw.CreateWindow(800, 600, "01 - Triangle", nil, nil)

    device := MTL.CreateSystemDefaultDevice()
    queue  := device->newCommandQueue()

    // CAMetalLayer bridges the window to Metal (see full example in repo).
    layer := CA.MetalLayer_layer()
    layer->setDevice(device)
    layer->setPixelFormat(.BGRA8Unorm)

    // Vertices: x, y, r, g, b   (interleaved, tightly packed)
    verts := [?]f32{
         0.0,  0.7,  1.0, 0.48, 0.27,
        -0.7, -0.6,  0.31, 0.7, 1.0,
         0.7, -0.6,  0.35, 0.83, 0.55,
    }
    vbuf := device->newBufferWithBytes(&verts, size_of(verts), .StorageModeShared)

    // ... compile shaders with newLibraryWithSource (see Metal module) ...
    // ... build MTLRenderPipelineState ...

    for !glfw.WindowShouldClose(window) {
        glfw.PollEvents()
        // acquire drawable, encode a render pass, draw 3 vertices, commit
    }
}`}
      />
      <div className="notice">
        <span className="lbl">Milestone</span>
        Run <code>odin run odin-examples/01-triangle</code>. A window opens with a colored triangle.
        You now own a working GPU pipeline — the hardest 100 lines you'll write.
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="prose">
      <p>
        A triangle is 2D. To enter 3D you feed the vertex shader the <strong>MVP matrix</strong> from
        the Linear Algebra module, turn the triangle into a cube (36 vertices), and add a{" "}
        <strong>depth buffer</strong> so near faces cover far ones. Then wire up a camera you can
        fly with the mouse and <kbd>WASD</kbd>.
      </p>

      <h3>Look-At View Matrix Derivation</h3>
      <p>
        To render a 3D scene, we need a <strong>View Matrix</strong> that transforms world coordinates into camera-local space. 
        Given camera position <M>{`e`}</M>, camera look target <M>{`g`}</M>, and world up vector <M>{`v_{\\text{up}}`}</M>:
      </p>
      <ol>
        <li>
          Compute the camera's forward look axis vector <M>{`w`}</M> (pointing in the opposite direction of gaze, since camera Z is negative in right-handed systems):
          <MBlock>{`w = \\frac{e - g}{\\|e - g\\|}`}</MBlock>
        </li>
        <li>
          Compute the camera's right axis vector <M>{`u`}</M> via the cross product:
          <MBlock>{`u = \\frac{v_{\\text{up}} \\times w}{\\|v_{\\text{up}} \\times w\\|}`}</MBlock>
        </li>
        <li>
          Compute the camera's up axis vector <M>{`v`}</M> to complete the orthonormal basis:
          <MBlock>{`v = w \\times u`}</MBlock>
        </li>
        <li>
          The view transform combines rotation <M>{`R`}</M> (mapping the axes to standard coordinates) and translation <M>{`T`}</M> (shifting origin to the camera):
          <MBlock>{`V = R \\cdot T = \\begin{bmatrix} u_x & u_y & u_z & 0 \\\\ v_x & v_y & v_z & 0 \\\\ w_x & w_y & w_z & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} 1 & 0 & 0 & -e_x \\\\ 0 & 1 & 0 & -e_y \\\\ 0 & 0 & 1 & -e_z \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} = \\begin{bmatrix} u_x & u_y & u_z & -(u \\cdot e) \\\\ v_x & v_y & v_z & -(v \\cdot e) \\\\ w_x & w_y & w_z & -(w \\cdot e) \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}`}</MBlock>
        </li>
      </ol>

      <TransformPipeline3D />
      <p>
        The camera is just an <code>eye</code> position and a <code>target</code>; a fly-cam updates
        them from input each frame and rebuilds the view matrix:
      </p>
      <Code
        lang="odin" filename="odin-examples/02-cube-camera/camera.odin"
        code={`Camera :: struct { pos: [3]f32, yaw, pitch: f32 }

view_matrix :: proc(c: Camera) -> matrix[4,4]f32 {
    dir := [3]f32{
        math.cos(c.pitch) * math.sin(c.yaw),
        math.sin(c.pitch),
        math.cos(c.pitch) * math.cos(c.yaw),
    }
    return linalg.matrix4_look_at(c.pos, c.pos + dir, {0, 1, 0})
}

update_camera :: proc(c: ^Camera, dt: f32, input: Input) {
    speed :: 5.0
    fwd := forward(c^);  right := linalg.cross(fwd, [3]f32{0,1,0})
    if input.w do c.pos += fwd   * speed * dt
    if input.s do c.pos -= fwd   * speed * dt
    if input.d do c.pos += right * speed * dt
    if input.a do c.pos -= right * speed * dt
    c.yaw   += input.mouse_dx * 0.002
    c.pitch  = clamp(c.pitch - input.mouse_dy * 0.002, -1.5, 1.5)
}`}
      />
      <div className="notice warn">
        <span className="lbl">Don't forget the depth buffer</span>
        Without a depth attachment, triangles draw in submission order and the cube looks
        inside-out. Add a <code>depth24plus</code> texture and set{" "}
        <code>depthCompare = .Less</code> in the pipeline.
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="prose">
      <p>
        Now generate a <strong>heightfield</strong>: a grid of thousands of vertices whose Y comes
        from the <code>fbm</code> Perlin noise you built in Procedural Math. Compute a normal per
        vertex (finite differences) so it can be lit, and suddenly you have rolling hills.
      </p>

      <h3>Finite Differences for Heightfield Normals</h3>
      <p>
        To shade the terrain, we need normal vectors. Since we sample height from a noise function <M>{`H(x, z)`}</M> instead of a smooth mathematical surface with analytic derivatives, we use the method of <strong>finite differences</strong> to estimate the slopes.
      </p>
      <p>
        At any grid coordinate <M>{`(x, z)`}</M>, we calculate the central difference slopes along the X and Z directions:
      </p>
      <MBlock>{`\\frac{\\partial H}{\\partial x} \\approx \\frac{H(x + \\Delta x, z) - H(x - \\Delta x, z)}{2 \\Delta x}`}</MBlock>
      <MBlock>{`\\frac{\\partial H}{\\partial z} \\approx \\frac{H(x, z + \\Delta z) - H(x, z - \\Delta z)}{2 \\Delta z}`}</MBlock>
      <p>
        These partial derivatives represent tangent directions. Taking their cross product gives the perpendicular surface normal vector:
      </p>
      <MBlock>{`n = \\text{normalize}\\left( \\begin{bmatrix} -\\frac{\\partial H}{\\partial x} \\\\ 1 \\\\ -\\frac{\\partial H}{\\partial z} \\end{bmatrix} \\right)`}</MBlock>

      <TerrainField />
      <p>Drag the sliders — you're re-generating ~15,000 triangles of terrain in real time.</p>
      <Code
        lang="odin" filename="odin-examples/03-terrain/terrain.odin"
        code={`N :: 128   // N x N grid

generate_terrain :: proc() -> [dynamic]Vertex {
    verts: [dynamic]Vertex
    height :: proc(i, j: int) -> f32 {
        return fbm(f32(i)/N, f32(j)/N, 5, 3, 2, 0.5) * 8.0
    }
    for j in 0..<N {
        for i in 0..<N {
            // two triangles per grid cell
            add_quad(&verts, i, j, height)
        }
    }
    return verts   // upload as one big vertex buffer
}`}
      />
      <div className="notice">
        <span className="lbl">Performance note</span>
        This is where Data-Oriented Design pays off: the terrain is one contiguous vertex buffer,
        uploaded once, drawn in a single call. No per-object overhead.
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="prose">
      <p>
        The finale. Let the player click on the terrain (a ray–plane test from Physics) to drop
        points. Fit a <strong>Catmull-Rom spline</strong> through them, then <strong>extrude</strong>{" "}
        it into a wall mesh — the exact pipeline you practiced in Procedural Math, now in 3D and
        placed on your generated landscape.
      </p>

      <h3>CSG Polygon Clipping Math for Wall Junctions</h3>
      <p>
        When two extruded walls meet, simple intersecting results in flickering overlapping polygons. 
        To clean this up, we apply 2D Constructive Solid Geometry (CSG) clipping on the ground plane:
      </p>
      <ol>
        <li>
          Treat each wall segment as a polygon ribbon bounded by a left line and a right line.
        </li>
        <li>
          For intersecting segments, solve the 2D segment-segment intersection equation. Given two segments from <M>{`A`}</M> to <M>{`B`}</M> and <M>{`C`}</M> to <M>{`D`}</M>, find parameter values <M>{`s`}</M> and <M>{`t`}</M> such that:
          <MBlock>{`A + s(B - A) = C + t(D - C)`}</MBlock>
        </li>
        <li>
          The intersection point <M>{`P`}</M> is the junction center. We adjust the inner edge vertices of both wall meshes to snap exactly to <M>{`P`}</M>, forming a clean, mitered junction.
        </li>
        <li>
          Any vertex coordinates falling inside the overlapping intersection polygon are pruned from the vertex buffers, preventing double-drawing and rasterizer artifacts.
        </li>
      </ol>

      <SplineEditor />
      <p>
        Every click adds a control point; the curve re-fits and the wall mesh regenerates instantly.
        In 3D you'd also give the wall height (a second row of vertices lifted along +Y) and drape it
        onto the terrain height under each point.
      </p>
      <Code
        lang="odin" filename="odin-examples/04-spline-wall/wall.odin"
        code={`build_wall :: proc(control_pts: [][3]f32, height, half_w: f32) -> [dynamic]Vertex {
    // 1. Smooth the clicked points into a dense centerline.
    center := catmull_rom_chain(control_pts, steps_per_seg = 16)

    // 2. Offset along normals -> left/right base edges (see Procedural Math).
    left, right := extrude_ribbon(center, half_w)

    // 3. Loft upward by 'height' and stitch quads into triangles:
    //    base-left, base-right, top-left, top-right per segment.
    verts: [dynamic]Vertex
    for i in 0..<len(center)-1 {
        emit_wall_segment(&verts, left[i], right[i], left[i+1], right[i+1], height)
    }
    return verts
}`}
      />
      <div className="notice warn">
        <span className="lbl">Boss level: seamless corners (the Tiny Glade secret)</span>
        When two walls meet, don't let them interpenetrate. Detect the intersection, recompute the
        vertices at the junction, cut the hidden interior, and stitch a clean corner —{" "}
        <strong>dynamic vertex generation / CSG</strong>. This is the frontier that separates a demo
        from Tiny Glade. Study Anastasia Opara's talks for how to make it feel <em>believable</em>,
        not just correct.
      </div>
      <p>
        If you've reached here with all four examples running, you have — from scratch, in Odin and
        Metal — a windowing layer, a GPU pipeline, a 3D camera, procedural terrain, and a
        spline-driven procedural wall generator. That's a real engine. Go build worlds.
      </p>
    </div>
  );
}

export const rendering: Module = {
  id: "rendering",
  title: "Rendering Capstone",
  icon: "🏔️",
  blurb: "Put it together: triangle → 3D camera → heightfield terrain → spline-extruded walls. The Tiny-Glade roadmap.",
  dependsOn: ["metal", "procedural-math", "physics"],
  lessons: [
    {
      id: "triangle", title: "Step 1 — Window & Triangle", minutes: 20,
      summary: "Open a window, stand up the pipeline, draw one colored triangle.",
      Body: Step1,
      quiz: {
        questions: [
          { q: "Why is 'draw a triangle' the key first milestone?", choices: ["Triangles are pretty", "It forces the entire pipeline (window, shaders, buffers, draw) to work", "It's required by Odin", "It teaches noise"], answer: 1, explain: "Everything downstream reuses the pipeline you must build to draw one triangle." },
        ],
      },
    },
    {
      id: "camera", title: "Step 2 — 3D Camera", minutes: 22,
      summary: "Feed MVP matrices, draw a cube, add depth, fly with WASD + mouse.",
      Body: Step2,
      quiz: {
        questions: [
          { q: "Without a depth buffer, a 3D cube looks wrong because…", choices: ["Colors are off", "Triangles draw in submission order, not by distance", "It's too small", "The camera breaks"], answer: 1, explain: "Depth testing ensures nearer fragments occlude farther ones." },
        ],
      },
    },
    {
      id: "terrain", title: "Step 3 — Heightfield Terrain", minutes: 20,
      summary: "A grid of thousands of triangles with heights from Perlin fBm.",
      Body: Step3,
      quiz: {
        questions: [
          { q: "Terrain vertex heights come from…", choices: ["Random each frame", "fBm/Perlin noise sampled at grid coordinates", "A texture only", "The camera"], answer: 1, explain: "You sample fBm at each grid point to get a coherent, natural heightfield." },
        ],
      },
    },
    {
      id: "spline-wall", title: "Step 4 — Spline Walls", minutes: 25,
      summary: "Click to drop points, fit a spline, extrude a wall; the CSG frontier.",
      Body: Step4,
      quiz: {
        questions: [
          { q: "Placing wall points by clicking terrain uses which technique from Physics?", choices: ["Sphere collision", "Ray–plane / ray–heightfield intersection", "Verlet integration", "AABB"], answer: 1, explain: "You cast a ray from the camera through the cursor to find the ground point." },
          { q: "Seamless wall corners are achieved by…", choices: ["Importing models", "Dynamic vertex generation / CSG at intersections", "Bigger textures", "More lights"], answer: 1, explain: "The mesh is recomputed and stitched where walls meet — the Tiny Glade approach." },
        ],
      },
    },
  ],
};
