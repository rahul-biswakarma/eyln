import type { Module } from "../../content/types";
import { Code, CodeTabs } from "../../components/code-block";
import { M } from "../../components/math";
function WhyOdin() {
    return (<div className="prose">
      <p>
        Odin is a systems language: no garbage collector, no hidden allocations, no runtime between
        you and the machine. Compared to C++ it has a clean, small syntax; compared to C it has
        slices, proper arrays, <code>defer</code>, and real modules. For graphics that combination
        is ideal — you control memory precisely, but the code stays readable.
      </p>
      <p>If you come from a higher-level language like TypeScript, here's the Rosetta Stone:</p>
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
      <CodeTabs tabs={[
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
        ]}/>
    </div>);
}
function DOD() {
    return (<div className="prose">
      <p>
        This is the biggest mental shift from typical high-level programming. Object-oriented habits
        train you to think in <strong>objects</strong>: an array of <code>Enemy</code> objects, each a
        little bag of fields and methods. The GPU — and your cache — hate that. They want{" "}
        <strong>contiguous arrays of plain numbers</strong>.
      </p>
      <p>
        This is <strong>Data-Oriented Design (DOD)</strong>. Instead of an "array of structs"
        (AoS), you often want a "struct of arrays" (SoA), so that when you loop over one field, the
        values you need are packed tightly in memory — one cache line brings in the next several.
      </p>
      <CodeTabs tabs={[
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
        ]}/>
      <div className="notice">
        <span className="lbl">Why it matters here</span>
        A GPU vertex buffer is just a big <code>[]f32</code>. When your data is already laid out as
        contiguous floats, "uploading to the GPU" is a single <code>memcpy</code>. When it's an
        array of objects with pointers (like JS), you'd have to gather and repack it every frame.
      </div>
    </div>);
}
function Memory() {
    return (<div className="prose">
      <p>
        The GPU reads raw bytes at fixed offsets in hardware buffers. To interface with it correctly, 
        you must know exactly how big your data structures are in memory, where each field sits (its offset), 
        and how the compiler aligns them. Odin makes this fully explicit.
      </p>
      <ul>
        <li><code>f32</code> = 4 bytes.</li>
        <li><code>[3]f32</code> = 12 bytes, laid out as three consecutive 4-byte floats (<M>{`x, y, z`}</M>).</li>
        <li>
          <code>[dynamic]f32</code> is a growable buffer on the CPU heap (containing a 64-bit pointer, a 64-bit length, a 64-bit capacity, and an allocator interface struct). 
          <strong>Never</strong> send a dynamic array header itself to the GPU; only send the memory it points to!
        </li>
        <li>
          A <strong>slice</strong> <code>[]f32</code> is a view of contiguous memory (containing a 64-bit pointer and a 64-bit length). 
          Like dynamic arrays, send the elements, not the slice header.
        </li>
      </ul>

      <h3>Struct Alignment & Compiler Padding</h3>
      <p>
        CPUs and GPUs do not access arbitrary memory byte-by-byte. Instead, they read memory in 4, 8, or 16-byte chunks. 
        For efficiency, hardware requires variables to be placed at memory addresses that are multiples of their size. 
        This is called <strong>memory alignment</strong>. For example, a 4-byte <code>f32</code> must begin at an address divisible by 4.
      </p>
      <p>
        To satisfy alignment rules, the compiler inserts unused <strong>padding bytes</strong> inside your structs. Consider this inefficient layout:
      </p>
      <Code lang="odin" filename="alignment_trap.odin" code={`// Inefficient layout:
BadStruct :: struct {
    a: u8,   // size 1, alignment 1. Offset 0.
             // 3 padding bytes inserted here to align 'b' to 4-byte boundary!
    b: f32,  // size 4, alignment 4. Offset 4.
    c: u8,   // size 1, alignment 1. Offset 8.
             // 3 padding bytes inserted at the end so the entire struct size
             // is a multiple of the largest alignment (4).
}            // Total size: 12 bytes (instead of 6 bytes of actual data!)`}/>
      <p>
        You can optimize memory by ordering fields from largest alignment to smallest:
      </p>
      <Code lang="odin" filename="alignment_good.odin" code={`// Optimized layout:
GoodStruct :: struct {
    b: f32,  // size 4, alignment 4. Offset 0.
    a: u8,   // size 1, alignment 1. Offset 4.
    c: u8,   // size 1, alignment 1. Offset 5.
             // 2 padding bytes at the end to round struct size to multiple of 4.
}            // Total size: 8 bytes!`}/>

      <h3>GPU Uniform Buffer Alignment (UBO) Rules</h3>
      <p>
        GPU uniform buffer blocks are subject to much stricter alignment requirements than standard CPU structs. 
        In both WebGPU (WGSL) and Metal (MSL), vectors inside uniform blocks are often padded to match their alignment:
      </p>
      <ul>
        <li>
          A <code>vec3&lt;f32&gt;</code> / <code>float3</code> occupies 12 bytes but has an alignment of <strong>16 bytes</strong>.
        </li>
        <li>
          If you define a structure in uniform memory containing a <code>vec3</code> followed by a <code>float</code>, the GPU expects the <code>vec3</code> at offset 0, and the <code>float</code> at offset 12 (occupying the 4 padding bytes). 
          However, if you have a <code>float</code> followed by a <code>vec3</code>, the GPU inserts 12 bytes of padding so the <code>vec3</code> starts at offset 16!
        </li>
      </ul>
      <p>
        Furthermore, many graphics APIs require that the offsets at which you bind uniform buffers be aligned to <strong>256 bytes</strong>. If your uniforms look garbled or your render pipeline crashes, check your padding and offset alignments first.
      </p>

      <Code lang="odin" filename="layout.odin" code={`Vertex :: struct {
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
buf := device->newBuffer(&verts, size_of(verts), .StorageModeShared)`}/>
    </div>);
}
function Linalg() {
    return (<div className="prose">
      <p>
        Don't rewrite vector math — Odin ships it in <code>core:math/linalg</code>. It uses the same
        column-major, right-handed conventions as Metal, so values pass through unchanged. Reuse it
        everywhere.
      </p>
      <Code lang="odin" filename="camera.odin" code={`import "core:math"
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
mvp   := proj * view * model     // matrices multiply with '*'`}/>
      <p>
        The array types double as math vectors: <code>a + b</code>, <code>2 * a</code>, and{" "}
        <code>proj * view</code> all just work. This is the same MVP chain you toggled in the Linear
        Algebra module — now in the language your engine actually runs.
      </p>
    </div>);
}
function CallingMetal() {
    return (<div className="prose">
      <p>
        Odin's <code>vendor:darwin/Metal</code> binding lets you call Metal directly — no C++ shim.
        The one rule you must respect: Metal objects are <strong>reference counted</strong>, and
        Odin has no automatic reference counting. You manage lifetimes yourself, mostly with an{" "}
        <strong>autorelease pool</strong> and <code>defer</code>.
      </p>
      <Code lang="odin" filename="main.odin" code={`import NS "core:sys/darwin/Foundation"
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
}`}/>
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
    </div>);
}
function Allocators() {
    return (<div className="prose">
      <p>
        In a language with no garbage collector, <em>who frees this and when?</em> is a question you
        must answer deliberately. Odin's answer is <strong>allocators as first-class context</strong>. Every
        allocating call (like <code>make</code> or dynamic array appends) implicitly uses the allocator stored in
        <code>context.allocator</code>. This design lets you swap the memory strategy of a third-party library or an entire section of code dynamically.
      </p>

      <h3>How an Arena Allocator Works Under the Hood</h3>
      <p>
        The single most useful memory strategy for game engines is the <strong>arena allocator</strong> (also known as a <strong>bump allocator</strong>). Instead of making expensive OS requests for every object, an arena allocates a single large contiguous block of memory upfront. 
      </p>
      <p>
        Internally, it tracks the start of this block and a single <code>bump_ptr</code> (or offset):
      </p>
      <ol>
        <li>
          <strong>Initialization</strong>: We reserve a large buffer (e.g., 4MB) and set the <code>bump_ptr</code> to the beginning of the buffer.
        </li>
        <li>
          <strong>Allocation</strong>: When you request <M>{`N`}</M> bytes of memory with alignment <M>{`A`}</M>, the arena calculates:
          <ul>
            <li>The next aligned memory address: <code>aligned_ptr = (bump_ptr + A - 1) & ~(A - 1)</code>.</li>
            <li>If <code>aligned_ptr + N</code> fits within the buffer, we set <code>bump_ptr = aligned_ptr + N</code> and return <code>aligned_ptr</code>.</li>
            <li>If it does not fit, it triggers an out-of-memory error (or falls back to a growable backing allocator).</li>
          </ul>
        </li>
        <li>
          <strong>Resetting</strong>: To free memory, we do <strong>zero per-object cleanup</strong>. We simply reset the <code>bump_ptr</code> back to the start of the buffer. This makes "freeing" millions of objects a single, near-instantaneous instruction: `bump_ptr = 0`.
        </li>
      </ol>

      <Code lang="odin" filename="arena.odin" code={`import "core:mem"

// Per-frame scratch memory: allocate freely, reset once.
frame_buf: [4 * mem.Megabyte]byte
arena: mem.Arena
mem.arena_init(&arena, frame_buf[:])

for running {
    context.allocator = mem.arena_allocator(&arena)

    // Everything here allocates from the arena — temp meshes,
    // culling lists, string formatting — with zero individual frees.
    build_and_render_frame()

    mem.arena_free_all(&arena)   // reclaim the whole frame at once (resets bump pointer)
}`}/>
      <div className="notice">
        <span className="lbl">Match the allocator to the lifetime</span>
        Use an <strong>arena</strong> for per-frame scratch, the <strong>default heap</strong> for
        long-lived resources (textures, meshes), and <code>context.temp_allocator</code> for tiny
        throwaway work. Choosing by lifetime is what keeps a no-GC engine both fast and leak-free.
      </div>
      <div className="notice warn">
        <span className="lbl">The dangling-pointer trap</span>
        Never hold an arena pointer past <code>arena_free_all</code>. The memory is instantly reusable,
        so a stale reference reads whatever the next frame wrote there. Arena data lives exactly as long
        as the arena — treat it as scratch, and copy anything you need to keep.
      </div>
    </div>);
}
export const odin: Module = {
    id: "odin",
    title: "Odin",
    icon: "⚙️",
    blurb: "The systems language: no GC, explicit memory, data-oriented design, and how to call Metal directly.",
    dependsOn: [],
    lessons: [
        {
            id: "why-odin", title: "Why Odin", minutes: 12,
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
        {
            id: "allocators", title: "Allocators & Arenas", minutes: 14,
            summary: "Context allocators and the per-frame arena — fast, leak-free memory.",
            Body: Allocators,
            quiz: {
                questions: [
                    { q: "An arena (bump) allocator frees memory by…", choices: ["Calling free on each object", "Resetting the whole block at once", "Waiting for the GC", "Reference counting"], answer: 1, explain: "You bump a pointer to allocate and reset the entire arena in one step — no per-object frees." },
                    { q: "The best allocator for per-frame scratch data is…", choices: ["The default heap", "An arena reset each frame", "A reference-counted pool", "None — use globals"], answer: 1, explain: "Frame-scoped scratch matches an arena's reset-all lifetime perfectly." },
                    { q: "Holding a pointer into an arena after arena_free_all is…", choices: ["Fine, it's copied", "A dangling reference — the memory is reused", "Automatically nil", "A compile error"], answer: 1, explain: "Freed arena memory is immediately reusable; stale pointers read the next frame's data." },
                ],
            },
            exercises: [
                {
                    id: "arena-open", kind: "open",
                    prompt: "You build a temporary list of visible objects each frame from an arena, then keep a pointer to it to reuse next frame. What goes wrong, and what's the correct approach?",
                    starter: "",
                    rubric: "Full credit: after arena_free_all the pointer dangles and next frame overwrites that memory, so the reused list is garbage; correct approach is to rebuild it each frame from the arena (or copy it into longer-lived storage if it must persist). Partial: identifies the dangling pointer without the fix.",
                    hint: "How long does arena memory live relative to the frame?",
                },
            ],
        },
    ],
};
