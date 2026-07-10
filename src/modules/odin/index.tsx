import type { Module } from "../../content/types";
import { Code, CodeTabs } from "../../components/CodeBlock";

function WhyOdin() {
  return (
    <div className="prose">
      <p>
        Odin is a systems language: no garbage collector, no hidden allocations, no runtime between
        you and the machine. Compared to C++ it has a clean, small syntax; compared to C it has
        slices, proper arrays, <code>defer</code>, and real modules. For graphics that combination
        is ideal — you control memory precisely, but the code stays readable.
      </p>
      <p>Coming from TypeScript, here's the Rosetta Stone:</p>
      <table className="rosetta">
        <thead><tr><th>Concept</th><th>TypeScript</th><th>Odin</th></tr></thead>
        <tbody>
          <tr><td>Variable</td><td><code>const x = 5</code></td><td><code>x := 5</code></td></tr>
          <tr><td>Typed var</td><td><code>let x: number = 5</code></td><td><code>x: f32 = 5</code></td></tr>
          <tr><td>Function</td><td><code>{`function f(a: number): number`}</code></td><td><code>{`f :: proc(a: f32) -> f32`}</code></td></tr>
          <tr><td>Struct/interface</td><td><code>interface P {"{ x: number }"}</code></td><td><code>{`P :: struct { x: f32 }`}</code></td></tr>
          <tr><td>Fixed array</td><td><code>number[]</code> (dynamic)</td><td><code>[3]f32</code> (exactly 3)</td></tr>
          <tr><td>Dynamic array</td><td><code>number[]</code></td><td><code>[dynamic]f32</code></td></tr>
          <tr><td>Slice / view</td><td><code>arr.slice()</code></td><td><code>[]f32</code></td></tr>
          <tr><td>Cleanup</td><td><code>try/finally</code></td><td><code>defer</code></td></tr>
        </tbody>
      </table>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "hello.odin",
            code: `package main
import "core:fmt"

Player :: struct { name: string, hp: int }

main :: proc() {
    p := Player{ name = "Villager", hp = 100 }
    for i in 0..<3 {
        fmt.printf("%s has %d hp\\n", p.name, p.hp)
        p.hp -= 10
    }
}`,
          },
          {
            label: "TypeScript (for comparison)", lang: "ts",
            code: `interface Player { name: string; hp: number }

function main() {
  const p: Player = { name: "Villager", hp: 100 };
  for (let i = 0; i < 3; i++) {
    console.log(\`\${p.name} has \${p.hp} hp\`);
    p.hp -= 10;
  }
}`,
          },
        ]}
      />
    </div>
  );
}

function DOD() {
  return (
    <div className="prose">
      <p>
        This is the biggest mental shift from web dev. React trains you to think in{" "}
        <strong>objects and components</strong>: an array of <code>Enemy</code> objects, each a
        little bag of fields and methods. The GPU — and your cache — hate that. They want{" "}
        <strong>contiguous arrays of plain numbers</strong>.
      </p>
      <p>
        This is <strong>Data-Oriented Design (DOD)</strong>. Instead of an "array of structs"
        (AoS), you often want a "struct of arrays" (SoA), so that when you loop over one field, the
        values you need are packed tightly in memory — one cache line brings in the next several.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Array of Structs (OOP-ish)", lang: "odin",
            code: `// Each Entity is a bag of fields. Positions are scattered
// across memory, interleaved with everything else.
Entity :: struct {
    pos:    [3]f32,
    vel:    [3]f32,
    health: f32,
    name:   string,
}
entities: [dynamic]Entity

// Updating just positions still drags whole structs through cache.
for &e in entities { e.pos += e.vel * dt }`,
          },
          {
            label: "Struct of Arrays (DOD)", lang: "odin",
            code: `// Positions live together, contiguously. Perfect for the CPU
// cache AND for uploading straight to a GPU vertex buffer.
World :: struct {
    pos:    [dynamic][3]f32,
    vel:    [dynamic][3]f32,
    health: [dynamic]f32,
}

// Tight loop over packed floats — the layout the hardware loves.
for i in 0..<len(world.pos) {
    world.pos[i] += world.vel[i] * dt
}`,
          },
        ]}
      />
      <div className="notice">
        <span className="lbl">Why it matters here</span>
        A GPU vertex buffer is just a big <code>[]f32</code>. When your data is already laid out as
        contiguous floats, "uploading to the GPU" is a single <code>memcpy</code>. When it's an
        array of objects with pointers (like JS), you'd have to gather and repack it every frame.
      </div>
    </div>
  );
}

function Memory() {
  return (
    <div className="prose">
      <p>
        The GPU reads raw bytes at fixed offsets. So you must know exactly how big your types are
        and where each field sits. Odin makes this explicit.
      </p>
      <ul>
        <li><code>f32</code> = 4 bytes. <code>[3]f32</code> = 12 bytes, laid out x, y, z.</li>
        <li><code>[dynamic]f32</code> is a growable buffer (pointer + length + capacity + allocator).</li>
        <li>A <strong>slice</strong> <code>[]f32</code> is a view: pointer + length. No copy.</li>
      </ul>
      <Code
        lang="odin" filename="layout.odin"
        code={`Vertex :: struct {
    position: [3]f32,   // offset 0,  12 bytes
    color:    [3]f32,   // offset 12, 12 bytes
}                       // size 24 bytes, tightly packed

verts := [3]Vertex{
    {{ 0.0,  0.7, 0}, {1, 0.5, 0.3}},
    {{-0.7, -0.6, 0}, {0.3, 0.7, 1}},
    {{ 0.7, -0.6, 0}, {0.3, 0.8, 0.5}},
}

// The GPU sees this as 72 contiguous bytes. The vertex descriptor
// tells Metal: attribute 0 is a float3 at offset 0, attribute 1
// is a float3 at offset 12, stride 24. That's the whole handshake.
buf := device->newBuffer(&verts, size_of(verts), .StorageModeShared)`}
      />
      <div className="notice warn">
        <span className="lbl">Alignment gotcha</span>
        GPUs pad things. A <code>float3</code> in a uniform buffer is often aligned to 16 bytes, not
        12. When your uniforms come out garbled, alignment is the usual culprit — match the layout
        rules of the shading language exactly.
      </div>
    </div>
  );
}

function Linalg() {
  return (
    <div className="prose">
      <p>
        Don't rewrite vector math — Odin ships it in <code>core:math/linalg</code>. It uses the same
        column-major, right-handed conventions as Metal, so values pass through unchanged. Reuse it
        everywhere.
      </p>
      <Code
        lang="odin" filename="camera.odin"
        code={`import "core:math"
import "core:math/linalg"

Vec3 :: [3]f32
Mat4 :: matrix[4,4]f32

eye    := Vec3{0, 1.6, 5}
target := Vec3{0, 0, 0}
up     := Vec3{0, 1, 0}

view := linalg.matrix4_look_at(eye, target, up)
proj := linalg.matrix4_perspective(
    math.to_radians_f32(60),  // fovy
    f32(width) / f32(height), // aspect
    0.1, 100.0,               // near, far
)

model := linalg.matrix4_rotate_f32(angle, {0, 1, 0})
mvp   := proj * view * model     // matrices multiply with '*'`}
      />
      <p>
        The array types double as math vectors: <code>a + b</code>, <code>2 * a</code>, and{" "}
        <code>proj * view</code> all just work. This is the same MVP chain you toggled in the Linear
        Algebra module — now in the language your engine actually runs.
      </p>
    </div>
  );
}

function CallingMetal() {
  return (
    <div className="prose">
      <p>
        Odin's <code>vendor:darwin/Metal</code> binding lets you call Metal directly — no C++ shim.
        The one rule you must respect: Metal objects are <strong>reference counted</strong>, and
        Odin has no automatic reference counting. You manage lifetimes yourself, mostly with an{" "}
        <strong>autorelease pool</strong> and <code>defer</code>.
      </p>
      <Code
        lang="odin" filename="main.odin"
        code={`import NS "core:sys/darwin/Foundation"
import MTL "core:sys/darwin/Metal"

main :: proc() {
    // One pool per thread / per frame. Drains on scope exit.
    pool := NS.AutoreleasePool_alloc()->init()
    defer pool->release()

    device := MTL.CreateSystemDefaultDevice()
    defer device->release()

    queue := device->newCommandQueue()
    defer queue->release()

    // ... build pipeline, buffers, encode a frame ...
}`}
      />
      <div className="notice">
        <span className="lbl">The lifetime rule</span>
        If you get an object from a method starting with <code>alloc</code>, <code>new</code>, or{" "}
        <code>copy</code>, you own it and must <code>release()</code> it (pair it with{" "}
        <code>defer</code> immediately). Everything else is autoreleased — the pool cleans it up.
        Set <code>OBJC_DEBUG_MISSING_POOLS=YES</code> to catch leaks from a missing pool.
      </div>
      <p>
        Because there's no full Xcode on this machine (only Command Line Tools), you'll compile
        shaders <strong>at runtime from a source string</strong> rather than a precompiled{" "}
        <code>.metallib</code>. The Metal module covers exactly that path.
      </p>
    </div>
  );
}

export const odin: Module = {
  id: "odin",
  title: "Odin",
  icon: "⚙️",
  blurb: "The systems language: no GC, explicit memory, data-oriented design, and how to call Metal directly.",
  dependsOn: [],
  lessons: [
    {
      id: "why-odin", title: "Why Odin (for web devs)", minutes: 12,
      summary: "A clean systems language, mapped from what you already know.",
      Body: WhyOdin,
      quiz: {
        questions: [
          { q: "In Odin, how do you declare a procedure that takes an f32 and returns an f32?", choices: ["proc f(a: f32): f32", "f :: proc(a: f32) -> f32", "function f(a) -> f32", "f = (a: f32) => f32"], answer: 1, explain: "Odin uses `name :: proc(args) -> return`." },
          { q: "What is [3]f32 in Odin?", choices: ["A dynamic array", "A fixed-size array of exactly 3 floats", "A slice", "A pointer"], answer: 1, explain: "Square-bracket-N means a fixed array of that length — 12 bytes here." },
        ],
      },
    },
    {
      id: "dod", title: "Data-Oriented Design", minutes: 14,
      summary: "The paradigm shift: contiguous arrays of numbers, not objects.",
      Body: DOD,
      quiz: {
        questions: [
          { q: "Why does the GPU prefer 'struct of arrays' over 'array of structs'?", choices: ["It looks cleaner", "Values you loop over are packed contiguously — cache & upload friendly", "Odin requires it", "It uses less code"], answer: 1, explain: "Contiguous same-type data maps directly to cache lines and GPU buffers." },
          { q: "A GPU vertex buffer is fundamentally…", choices: ["A list of objects", "A big contiguous array of numbers", "A JSON document", "A texture"], answer: 1, explain: "It's raw bytes — floats packed tightly, read at fixed offsets." },
        ],
      },
    },
    {
      id: "memory", title: "Memory & Layout", minutes: 12,
      summary: "Sizes, offsets, slices, and alignment — the GPU handshake.",
      Body: Memory,
      quiz: {
        questions: [
          { q: "How many bytes is a struct { position: [3]f32, color: [3]f32 }?", choices: ["6", "12", "24", "48"], answer: 2, explain: "Two float3s = 2 × 12 = 24 bytes, tightly packed." },
          { q: "A common cause of garbled uniform data is…", choices: ["Wrong file name", "Alignment mismatch (float3 padded to 16 bytes)", "Too many vertices", "Missing semicolons"], answer: 1, explain: "GPU uniform layout rules pad vectors; mismatches corrupt the data." },
        ],
      },
      exercises: [
        {
          id: "stride", kind: "numeric",
          prompt: "A vertex has position [3]f32, normal [3]f32, and uv [2]f32. What is its stride in bytes?",
          starter: "", hint: "(3 + 3 + 2) floats × 4 bytes.",
          validate: (s) => Math.abs(parseFloat(s) - 32) < 0.01 ? { pass: true, message: "Correct — 8 floats × 4 = 32 bytes." } : { pass: false, message: "Count the floats (3+3+2) and multiply by 4." },
        },
      ],
    },
    {
      id: "linalg", title: "core:math/linalg", minutes: 10,
      summary: "Reuse Odin's built-in vectors and matrices — don't rewrite them.",
      Body: Linalg,
      quiz: {
        questions: [
          { q: "How do you build a view matrix in Odin?", choices: ["linalg.look_at manually", "linalg.matrix4_look_at(eye, target, up)", "You must write it yourself", "camera.view()"], answer: 1, explain: "core:math/linalg provides matrix4_look_at and matrix4_perspective." },
        ],
      },
    },
    {
      id: "calling-metal", title: "Calling into Metal", minutes: 13,
      summary: "vendor:darwin/Metal, autorelease pools, and the retain/release rule.",
      Body: CallingMetal,
      quiz: {
        questions: [
          { q: "Odin objects are not ARC-managed, so for Metal objects you…", choices: ["Never free anything", "Manage lifetimes with autorelease pools and defer release()", "Let the GC handle it", "Restart the app"], answer: 1, explain: "No GC or ARC — you pair ownership with defer release() and use an AutoreleasePool." },
          { q: "Which prefix means YOU own the returned object (must release it)?", choices: ["get / read", "alloc / new / copy", "make / build", "any method"], answer: 1, explain: "Cocoa's ownership rule: alloc/new/copy transfer ownership to you." },
        ],
      },
    },
  ],
};
