import type { Module } from "../../content/types";
import { M } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";

function Profiling() {
  return (
    <div className="prose">
      <p>
        The first rule of optimization: <strong>measure before you change anything</strong>. Intuition
        about what's slow is almost always wrong. A frame has a budget — at 60 fps you get{" "}
        <M>{`16.6\\,\\text{ms}`}</M>, at 120 fps just <M>{`8.3\\,\\text{ms}`}</M> — split between the CPU
        (building and submitting work) and the GPU (executing it). The key question is which one you're{" "}
        <strong>bound</strong> by.
      </p>
      <ul>
        <li>
          <strong>CPU-bound</strong>: the GPU sits idle waiting for commands. Usually too many draw calls
          or expensive per-frame CPU work. Fix on the CPU side (batching, culling).
        </li>
        <li>
          <strong>GPU-bound</strong>: the CPU finishes early and blocks on present. Usually overdraw,
          heavy fragment shaders, or bandwidth. Fix in shaders / resolution / fill.
        </li>
      </ul>
      <Code
        lang="odin" filename="timer.odin"
        code={`import "core:time"

// Coarse CPU timing around a phase. For real work, prefer a
// sampling profiler; this catches gross regressions in a pinch.
start := time.now()
build_frame()
dt := time.duration_milliseconds(time.since(start))
if dt > 4.0 do fmt.printf("frame build slow: %.2f ms\\n", dt)`}
      />
      <div className="notice">
        <span className="lbl">Use the GPU's own tools</span>
        Metal's <strong>GPU capture</strong> (from the Metal module) and Xcode's frame debugger give you
        real per-pass GPU timings and counters — the ground truth a CPU timer can't see. Chrome/WebGPU
        expose timestamp queries for the same purpose.
      </div>
    </div>
  );
}

function Batching() {
  return (
    <div className="prose">
      <p>
        Every draw call has fixed CPU overhead: state validation, encoding, driver work. Ten thousand
        objects issued as ten thousand draws will bury the CPU regardless of how simple each object is.
        The cure is to do <strong>more work per call</strong>.
      </p>
      <ul>
        <li>
          <strong>Batching</strong> — merge objects that share material/state into one buffer and one
          draw. The terrain chunk is a batch: thousands of triangles, one draw.
        </li>
        <li>
          <strong>Instancing</strong> — draw the <em>same</em> mesh many times in one call, with a
          per-instance buffer of transforms. Perfect for the repeated wall segments and props in a
          Tiny-Glade-style scene.
        </li>
      </ul>
      <CodeTabs
        tabs={[
          {
            label: "Odin (instanced draw)", lang: "odin",
            code: `// One mesh, N transforms, ONE draw call.
enc->setVertexBuffer(mesh_buf,      0, 0)
enc->setVertexBuffer(instance_buf,  0, 1)   // per-instance model matrices
enc->drawIndexedPrimitives(
    .Triangle, index_count, .UInt16, index_buf, 0,
    instance_count,        // <- the whole crowd in one call
)`,
          },
          {
            label: "WGSL (read instance data)", lang: "wgsl",
            code: `struct Instance { model : mat4x4<f32> };
@group(0) @binding(1) var<storage> instances : array<Instance>;

@vertex
fn vs(@location(0) pos : vec3<f32>,
      @builtin(instance_index) i : u32) -> @builtin(position) vec4<f32> {
  return camera.viewproj * instances[i].model * vec4<f32>(pos, 1.0);
}`,
          },
        ]}
      />
      <div className="notice warn">
        <span className="lbl">Don't batch blindly</span>
        Batching only helps when objects share pipeline state (shader, blend, textures). Merging objects
        that need different state forces state changes mid-batch and defeats the purpose. Group by
        material first, then batch within each group.
      </div>
    </div>
  );
}

function Culling() {
  return (
    <div className="prose">
      <p>
        The cheapest work is work you never do. <strong>Culling</strong> discards geometry the camera
        can't see before it costs anything downstream:
      </p>
      <ul>
        <li>
          <strong>Frustum culling</strong> — skip whole objects whose bounding volume falls outside the
          view frustum (the clip-space test from the linear-algebra module, run per-object on a sphere or
          AABB). This is your biggest early win in an open scene.
        </li>
        <li>
          <strong>Backface culling</strong> — the GPU drops triangles facing away from the camera (based
          on winding order) for free; make sure your winding is consistent so it doesn't drop the wrong
          ones.
        </li>
        <li>
          <strong>Occlusion culling</strong> — skip objects fully hidden behind others. Powerful but
          costlier to determine; save it for dense scenes.
        </li>
      </ul>
      <Code
        lang="odin" filename="cull.odin"
        code={`// Sphere-vs-frustum: keep only objects the camera can see.
visible := make([dynamic]int, 0, len(objects))
defer delete(visible)
for obj, i in objects {
    if sphere_in_frustum(frustum, obj.center, obj.radius) {
        append(&visible, i)
    }
}
// Now build draw commands ONLY for 'visible' — often a 5-10x cut.`}
      />
      <div className="notice">
        <span className="lbl">Order of operations</span>
        Cull first, then batch/instance what survives, then submit. Reversing that — building all the
        draws and hoping the GPU skips them — wastes exactly the CPU time you were trying to save.
      </div>
    </div>
  );
}

export const optimization: Module = {
  id: "optimization",
  title: "Optimization & Profiling",
  icon: "⚡",
  blurb: "Find the bottleneck, then batch, instance, and cull — turning a slideshow into a smooth frame.",
  dependsOn: ["odin", "metal"],
  lessons: [
    {
      id: "profiling", title: "Measure First: The Frame Budget", minutes: 12,
      summary: "CPU-bound vs GPU-bound, and how to tell which you are.",
      Body: Profiling,
      quiz: {
        questions: [
          { q: "The frame budget at 60 fps is about…", choices: ["1 ms", "16.6 ms", "100 ms", "60 ms"], answer: 1, explain: "1000/60 ≈ 16.6 ms per frame." },
          { q: "If the GPU sits idle waiting for commands, you are…", choices: ["GPU-bound", "CPU-bound", "memory-bound only", "not bound by anything"], answer: 1, explain: "The CPU can't feed work fast enough — a CPU bottleneck." },
        ],
      },
      exercises: [
        {
          id: "bound-open", kind: "open",
          prompt: "Your game runs at 30 fps. A profiler shows the CPU busy the whole frame while GPU utilization is 40%. Are you CPU- or GPU-bound, and name one concrete fix to try first.",
          starter: "",
          rubric: "Full credit: CPU-bound (CPU saturated, GPU underused); a valid CPU-side fix such as reducing/batching draw calls, instancing, or frustum culling. Partial: correct diagnosis but a GPU-side fix, or vice versa.",
          hint: "Which processor is at 100%?",
        },
      ],
    },
    {
      id: "batching", title: "Batching & Instancing", minutes: 14,
      summary: "Fewer, bigger draw calls — and drawing one mesh many times.",
      Body: Batching,
      quiz: {
        questions: [
          { q: "Instancing lets you…", choices: ["Draw many copies of one mesh in a single call", "Compress textures", "Skip the vertex shader", "Avoid buffers"], answer: 0, explain: "One draw, N per-instance transforms — ideal for repeated props." },
          { q: "Batching helps only when objects share…", choices: ["The same color", "Pipeline state (shader/blend/textures)", "The same position", "The same name"], answer: 1, explain: "Different state mid-batch forces state changes and defeats batching." },
        ],
      },
    },
    {
      id: "culling", title: "Culling: Don't Draw the Invisible", minutes: 13,
      summary: "Frustum, backface, and occlusion culling — and the right order.",
      Body: Culling,
      quiz: {
        questions: [
          { q: "Frustum culling discards objects that are…", choices: ["Too colorful", "Outside the camera's view volume", "Facing the camera", "Fully lit"], answer: 1, explain: "Objects whose bounds fall outside the frustum can't be seen — skip them." },
          { q: "Backface culling uses a triangle's… to decide it faces away.", choices: ["Color", "Winding order", "UV coordinates", "Texture"], answer: 1, explain: "Consistent winding lets the GPU drop back-facing triangles for free." },
          { q: "The right pipeline order is…", choices: ["Submit, then cull", "Cull, then batch survivors, then submit", "Batch everything, never cull", "Cull after drawing"], answer: 1, explain: "Cull first so you only spend effort building draws for what's visible." },
        ],
      },
    },
  ],
};
