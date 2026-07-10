import type { Module } from "../../content/types";
import { Code, CodeTabs } from "../../components/CodeBlock";
import { ShaderEditor } from "../../widgets/ShaderEditor";
import { TriangleDemo } from "../../widgets/TriangleDemo";

function GpuModel() {
  return (
    <div className="prose">
      <p>
        A CPU is a few very fast cores that do different things. A GPU is thousands of tiny cores
        that all do the <strong>same</strong> thing to different data — perfect for "run this little
        program on every one of a million vertices, then on every one of two million pixels."
      </p>
      <p>Your job splits cleanly:</p>
      <ul>
        <li>
          <strong>On the CPU (Odin)</strong>: arrange data into tightly packed buffers, describe the
          pipeline, and record commands.
        </li>
        <li>
          <strong>On the GPU (shaders)</strong>: two little programs — a <strong>vertex shader</strong>
          {" "}(runs per vertex, outputs clip-space position) and a <strong>fragment shader</strong>{" "}
          (runs per pixel, outputs color).
        </li>
      </ul>
      <p>
        The CPU and GPU run asynchronously and communicate through <strong>buffers</strong>. This is
        exactly why the Odin module hammered on Data-Oriented Design: the GPU can only consume flat,
        contiguous arrays of numbers.
      </p>
      <div className="notice">
        <span className="lbl">Metal vs WebGPU</span>
        The live demos here use <strong>WebGPU</strong> because Metal can't run in a browser. The
        two are conceptually the same API — device, queue, pipeline, buffers, encoder — so every
        idea transfers. Where it helps, code samples show all three of{" "}
        <strong>WGSL</strong>, <strong>Metal (MSL)</strong>, and <strong>Odin</strong>.
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <div className="prose">
      <p>
        Rendering a frame in Metal is a fixed dance of objects. Learn these seven and you understand
        the whole API:
      </p>
      <ol>
        <li><strong>Device</strong> — your GPU. Everything is created from it.</li>
        <li><strong>CommandQueue</strong> — where you submit work; created once.</li>
        <li><strong>Buffer</strong> — GPU memory holding your vertices/uniforms.</li>
        <li><strong>Library / Function</strong> — compiled shader code.</li>
        <li><strong>RenderPipelineState</strong> — the "how to draw" config (which shaders, vertex layout, pixel format). Built once, reused every frame.</li>
        <li><strong>CommandBuffer</strong> — one frame's worth of commands.</li>
        <li><strong>RenderCommandEncoder</strong> — records draw calls into the command buffer.</li>
      </ol>
      <Code
        lang="odin" filename="frame.odin"
        code={`// --- once, at startup ---
device := MTL.CreateSystemDefaultDevice()
queue  := device->newCommandQueue()
// ... build pipeline_state and vertex_buffer ...

// --- every frame ---
render_frame :: proc() {
    pool := NS.AutoreleasePool_alloc()->init()
    defer pool->release()

    drawable := layer->nextDrawable()
    pass := MTL.RenderPassDescriptor_renderPassDescriptor()
    color := pass->colorAttachments()->object(0)
    color->setTexture(drawable->texture())
    color->setLoadAction(.Clear)
    color->setClearColor(MTL.ClearColor{0.03, 0.04, 0.06, 1.0})
    color->setStoreAction(.Store)

    cmd := queue->commandBuffer()
    enc := cmd->renderCommandEncoderWithDescriptor(pass)
    enc->setRenderPipelineState(pipeline_state)
    enc->setVertexBuffer(vertex_buffer, 0, 0)
    enc->drawPrimitives(.Triangle, 0, 3)
    enc->endEncoding()

    cmd->presentDrawable(drawable)
    cmd->commit()
}`}
      />
      <TriangleDemo />
      <p>The triangle above is the WebGPU mirror of that exact sequence — the "hello world" of the GPU.</p>
    </div>
  );
}

function RuntimeShaders() {
  return (
    <div className="prose">
      <p>
        Normally you'd precompile <code>.metal</code> files into a <code>.metallib</code> using
        Xcode's <code>metal</code> compiler. But this machine has only the Command Line Tools — no
        <code> xcrun metal</code>. The clean workaround, and honestly a great one for learning, is to
        compile shaders <strong>at runtime from a source string</strong>.
      </p>
      <Code
        lang="odin" filename="shaders.odin"
        code={`shader_src := \`
#include <metal_stdlib>
using namespace metal;

struct VSOut { float4 pos [[position]]; float3 color; };

vertex VSOut vs(uint vid [[vertex_id]],
                const device float* verts [[buffer(0)]]) {
    VSOut o;
    float2 p = float2(verts[vid*5+0], verts[vid*5+1]);
    o.pos   = float4(p, 0.0, 1.0);
    o.color = float3(verts[vid*5+2], verts[vid*5+3], verts[vid*5+4]);
    return o;
}

fragment float4 fs(VSOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}
\`

opts := MTL.CompileOptions_alloc()->init()
defer opts->release()

library, err := device->newLibraryWithSource(
    NS.AT(shader_src), opts,
)
if library == nil {
    fmt.eprintln("shader compile failed:", err->localizedDescription()->odinString())
    return
}
vfn := library->newFunctionWithName(NS.AT("vs"))
ffn := library->newFunctionWithName(NS.AT("fs"))`}
      />
      <div className="notice">
        <span className="lbl">Bonus</span>
        Runtime compilation means you can hot-reload shaders while your engine runs — edit the
        string, recompile, see the change. That's exactly what the live editor below does with WGSL.
      </div>
    </div>
  );
}

function Shaders() {
  return (
    <div className="prose">
      <p>
        Shaders are small programs. The <strong>vertex shader</strong> transforms each vertex into
        clip space; whatever it returns for other fields gets <em>interpolated</em> across the
        triangle and handed to the <strong>fragment shader</strong>, which runs once per pixel and
        returns a color.
      </p>
      <p>
        Data enters shaders through attributes and buffers. In Metal these use attribute syntax like{" "}
        <code>[[stage_in]]</code>, <code>[[buffer(0)]]</code>, <code>[[position]]</code>; WGSL uses{" "}
        <code>@location</code>, <code>@binding</code>, <code>@builtin(position)</code>.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Metal (MSL)", lang: "cpp", filename: "shader.metal",
            code: `struct Uniforms { float4x4 mvp; };
struct VSOut { float4 pos [[position]]; float3 color; };

vertex VSOut vs(uint vid                 [[vertex_id]],
                const device Vertex* v   [[buffer(0)]],
                constant Uniforms& u     [[buffer(1)]]) {
    VSOut o;
    o.pos   = u.mvp * float4(v[vid].position, 1.0);
    o.color = v[vid].color;
    return o;
}

fragment float4 fs(VSOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}`,
          },
          {
            label: "WGSL", lang: "wgsl", filename: "shader.wgsl",
            code: `struct Uniforms { mvp : mat4x4<f32> };
@group(0) @binding(0) var<uniform> u : Uniforms;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) color : vec3<f32>,
};

@vertex
fn vs(@location(0) position : vec3<f32>,
      @location(1) color : vec3<f32>) -> VSOut {
  var o : VSOut;
  o.pos = u.mvp * vec4<f32>(position, 1.0);
  o.color = color;
  return o;
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}`,
          },
        ]}
      />
      <h3>WGSL ↔ Metal Rosetta</h3>
      <table className="rosetta">
        <thead><tr><th>Concept</th><th>WGSL</th><th>Metal (MSL)</th></tr></thead>
        <tbody>
          <tr><td>Vertex output position</td><td><code>@builtin(position)</code></td><td><code>[[position]]</code></td></tr>
          <tr><td>Input attribute</td><td><code>@location(0)</code></td><td><code>[[attribute(0)]]</code> / vertex_id</td></tr>
          <tr><td>Uniform buffer</td><td><code>@group @binding + var&lt;uniform&gt;</code></td><td><code>constant T&amp; [[buffer(n)]]</code></td></tr>
          <tr><td>3-float vector</td><td><code>vec3&lt;f32&gt;</code></td><td><code>float3</code></td></tr>
          <tr><td>4×4 matrix</td><td><code>mat4x4&lt;f32&gt;</code></td><td><code>float4x4</code></td></tr>
          <tr><td>Entry point</td><td><code>@vertex</code> / <code>@fragment</code></td><td><code>vertex</code> / <code>fragment</code></td></tr>
        </tbody>
      </table>
    </div>
  );
}

function LiveShader() {
  return (
    <div className="prose">
      <p>
        Time to write a shader and watch it run. The editor below compiles your WGSL fragment shader
        on every keystroke and paints the result across a full-screen triangle — the same
        edit-recompile loop you'd wire up in Odin with <code>newLibraryWithSource</code>.
      </p>
      <ShaderEditor />
      <p>Things to try in the <code>shade(uv, t)</code> function:</p>
      <ul>
        <li>Return <code>vec3&lt;f32&gt;(uv.x, uv.y, 0.0)</code> — a coordinate gradient.</li>
        <li>Use <code>sin(t)</code> to animate color over time.</li>
        <li>
          Make circles with <code>length(uv - vec2&lt;f32&gt;(0.5, 0.5))</code> and a{" "}
          <code>step()</code>.
        </li>
      </ul>
      <div className="notice warn">
        <span className="lbl">Errors are your friend</span>
        Break the syntax on purpose — the status line shows the compiler error with a line number,
        just like Metal's <code>newLibraryWithSource</code> returns an <code>NSError</code>.
      </div>
    </div>
  );
}

export const metal: Module = {
  id: "metal",
  title: "Metal",
  icon: "🔩",
  blurb: "The GPU mental model, Metal's pipeline objects, runtime shader compilation, and MSL/WGSL shaders you can edit live.",
  dependsOn: ["odin", "linear-algebra"],
  lessons: [
    {
      id: "gpu-model", title: "The GPU Mental Model", minutes: 11,
      summary: "Thousands of cores running the same tiny program on different data.",
      Body: GpuModel,
      quiz: {
        questions: [
          { q: "A GPU is best described as…", choices: ["A faster CPU", "Thousands of cores doing the same op on different data (SIMD)", "A storage device", "A network card"], answer: 1, explain: "GPUs excel at data-parallel work — the same shader over millions of elements." },
          { q: "The CPU and GPU communicate mainly through…", choices: ["Function calls", "Buffers of contiguous data", "The file system", "Shared classes"], answer: 1, explain: "You pack data into buffers and hand them to the GPU — hence Data-Oriented Design." },
        ],
      },
    },
    {
      id: "pipeline", title: "Metal Pipeline Objects", minutes: 15,
      summary: "Device, queue, buffer, library, pipeline state, command buffer, encoder.",
      Body: Pipeline,
      quiz: {
        questions: [
          { q: "Which object is built once and reused every frame?", choices: ["CommandBuffer", "RenderCommandEncoder", "RenderPipelineState", "Drawable"], answer: 2, explain: "The pipeline state (shaders + vertex layout + formats) is expensive to build — create it once." },
          { q: "Where do you record draw calls?", choices: ["The Device", "The RenderCommandEncoder", "The Library", "The Buffer"], answer: 1, explain: "The encoder records commands (set pipeline, set buffers, draw) into the command buffer." },
        ],
      },
    },
    {
      id: "runtime-shaders", title: "Runtime Shader Compilation", minutes: 12,
      summary: "newLibraryWithSource — required here (no full Xcode), great for hot-reload.",
      Body: RuntimeShaders,
      quiz: {
        questions: [
          { q: "Why compile shaders from a source string at runtime here?", choices: ["It's faster to draw", "Only Command Line Tools are installed — no offline metal compiler", "Metal requires it", "To hide the code"], answer: 1, explain: "Without full Xcode there's no `xcrun metal`, so we use newLibraryWithSource at runtime." },
          { q: "A side benefit of runtime compilation is…", choices: ["Smaller binaries", "Hot-reloading shaders while the app runs", "No shaders needed", "Automatic lighting"], answer: 1, explain: "You can edit and recompile shaders live — exactly what the editor demo does." },
        ],
      },
    },
    {
      id: "shaders", title: "Vertex & Fragment Shaders", minutes: 14,
      summary: "How data flows through shaders; the WGSL ↔ Metal Rosetta table.",
      Body: Shaders,
      quiz: {
        questions: [
          { q: "The fragment shader runs…", choices: ["Once per vertex", "Once per pixel/fragment", "Once per frame", "Once at startup"], answer: 1, explain: "Fragment shaders execute per rasterized pixel, receiving interpolated vertex outputs." },
          { q: "WGSL's @builtin(position) corresponds to Metal's…", choices: ["[[buffer(0)]]", "[[stage_in]]", "[[position]]", "[[vertex_id]]"], answer: 2, explain: "Both mark the clip-space output position of the vertex shader." },
        ],
      },
    },
    {
      id: "live-shader", title: "Write a Shader (live)", minutes: 15,
      summary: "Edit a WGSL fragment shader and watch it recompile on a canvas.",
      Body: LiveShader,
      quiz: {
        questions: [
          { q: "In the editor, 'uv' ranges over…", choices: ["Pixels (0..512)", "Roughly 0..1 across the canvas", "-1..1", "World space"], answer: 1, explain: "uv is normalized 0..1 so shaders are resolution-independent." },
        ],
      },
    },
  ],
};
