import type { Module } from "../../content/types";
import { M } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";

function UVs() {
  return (
    <div className="prose">
      <p>
        A texture is an image the GPU samples while shading. To know <em>which</em> pixel (texel) to read
        for a given point on a triangle, each vertex carries <strong>texture coordinates</strong> —{" "}
        <M>{`(u, v)`}</M> in the range <M>{`[0, 1]`}</M>, independent of the image's pixel size.
        By convention <M>{`(0, 0)`}</M> is one corner and <M>{`(1, 1)`}</M> the opposite. Like normals,
        UVs are interpolated across the triangle by the rasterizer.
      </p>
      <p>
        <strong>Unwrapping</strong> is the art of assigning UVs so a 2D image wraps a 3D mesh without
        ugly stretching or visible seams — think of peeling an orange flat. For procedural meshes (like
        the terrain you'll build) you generate UVs directly from position or grid indices.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin (vertex with UV)", lang: "odin",
            code: `Vertex :: struct {
    position: [3]f32,   // offset 0
    normal:   [3]f32,   // offset 12
    uv:       [2]f32,   // offset 24  -> stride 32 bytes
}

// Planar UVs for a terrain grid of size N:
uv := [2]f32{ f32(x) / f32(N - 1), f32(z) / f32(N - 1) }`,
          },
          {
            label: "WGSL (sample)", lang: "wgsl",
            code: `@group(0) @binding(1) var tex  : texture_2d<f32>;
@group(0) @binding(2) var samp : sampler;

@fragment
fn fs(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(tex, samp, uv);
}`,
          },
        ]}
      />
    </div>
  );
}

function Samplers() {
  return (
    <div className="prose">
      <p>
        A <strong>sampler</strong> is a small state object that decides <em>how</em> texels are read. Two
        choices dominate:
      </p>
      <ul>
        <li>
          <strong>Filtering</strong> — <code>nearest</code> snaps to the closest texel (crisp, blocky,
          right for pixel art), while <code>linear</code> blends the four nearest texels (smooth).
        </li>
        <li>
          <strong>Address mode</strong> — what happens outside <M>{`[0, 1]`}</M>:{" "}
          <code>repeat</code> tiles the image, <code>clamp-to-edge</code> stretches the border pixel,{" "}
          <code>mirror</code> reflects. Tiling a small rock texture across a big terrain is just{" "}
          <code>repeat</code> with UVs that exceed 1.
        </li>
      </ul>
      <Code
        lang="odin" filename="sampler.odin"
        code={`import MTL "core:sys/darwin/Metal"

desc := MTL.SamplerDescriptor_alloc()->init()
defer desc->release()
desc->setMinFilter(.Linear)
desc->setMagFilter(.Linear)
desc->setSAddressMode(.Repeat)   // tile horizontally
desc->setTAddressMode(.Repeat)   // tile vertically
sampler := device->newSamplerState(desc)`}
      />
      <div className="notice">
        <span className="lbl">Samplers are cheap, textures are not</span>
        A sampler is just a few bytes of state; you can reuse one across many textures. Bind the sampler
        and the texture separately so the same filtering rules apply everywhere.
      </div>
    </div>
  );
}

function Mipmaps() {
  return (
    <div className="prose">
      <p>
        When a textured surface recedes into the distance, one screen pixel covers many texels. Sampling
        just one of them makes textures <strong>shimmer and crawl</strong> as the camera moves —
        aliasing. <strong>Mipmaps</strong> fix this: a precomputed chain of half-size copies (level 0
        full-res, level 1 half, level 2 quarter…). The GPU picks the level whose texel size best matches
        the on-screen footprint, and <strong>trilinear</strong> filtering blends between two levels for a
        seamless transition.
      </p>
      <p>
        The whole chain costs only about <M>{`\\tfrac{1}{3}`}</M> extra memory (a geometric series:{" "}
        <M>{`1 + \\tfrac14 + \\tfrac{1}{16} + \\cdots = \\tfrac43`}</M>) and it makes distant texturing
        both faster (better cache locality) and cleaner.
      </p>
      <Code
        lang="wgsl" filename="mip.wgsl"
        code={`// With a mipmapped texture + trilinear sampler, the SAME call
// automatically picks and blends mip levels from the UV derivatives.
let color = textureSample(tex, samp, uv);

// Force a specific level of detail when you need control:
let far = textureSampleLevel(tex, samp, uv, 4.0);`}
      />
      <div className="notice warn">
        <span className="lbl">A texture atlas fights mipmaps</span>
        Packing many small images into one big <strong>atlas</strong> saves bind/draw calls, but at
        higher mip levels neighboring sub-images bleed into each other. Leave padding (a gutter) around
        each sub-image, or cap the mip level, to avoid seams.
      </div>
    </div>
  );
}

export const textures: Module = {
  id: "textures",
  title: "Textures & Sampling",
  icon: "🖼️",
  blurb: "UV coordinates, samplers, filtering, mipmaps, and atlases — how images get onto surfaces without shimmering.",
  dependsOn: ["metal"],
  lessons: [
    {
      id: "uvs", title: "UV Coordinates", minutes: 11,
      summary: "Mapping [0,1]² texture space onto mesh vertices.",
      Body: UVs,
      quiz: {
        questions: [
          { q: "Texture coordinates are normally in the range…", choices: ["0 to 255", "[0, 1]", "−1 to 1", "pixel counts"], answer: 1, explain: "UVs are resolution-independent, in [0,1] regardless of image size." },
          { q: "Across a triangle, UVs are…", choices: ["Constant", "Interpolated by the rasterizer", "Random", "Ignored"], answer: 1, explain: "Like normals, per-vertex UVs are interpolated across the face." },
        ],
      },
    },
    {
      id: "samplers", title: "Samplers: Filtering & Wrapping", minutes: 12,
      summary: "Nearest vs linear filtering, and repeat/clamp/mirror address modes.",
      Body: Samplers,
      quiz: {
        questions: [
          { q: "To tile a texture across a large surface you use address mode…", choices: ["clamp-to-edge", "repeat", "mirror-once", "border"], answer: 1, explain: "Repeat tiles the image whenever UVs exceed [0,1]." },
          { q: "For crisp pixel-art with no blur, use…", choices: ["linear filtering", "nearest filtering", "trilinear", "anisotropic"], answer: 1, explain: "Nearest snaps to the closest texel; linear blends and blurs." },
        ],
      },
      exercises: [
        {
          id: "wrap-open", kind: "open",
          prompt: "You applied a stone texture to a wall using UVs that go from 0 to 8 (to tile it 8×). With clamp-to-edge you see one stretched stone plus a smeared border. Explain what's happening and the one-line fix.",
          starter: "",
          rubric: "Full credit: clamp-to-edge pins UVs > 1 to the last edge texel, so only [0,1] shows the image and everything beyond is the stretched border pixel; fix is to switch the address mode to repeat. Partial: identifies repeat as the fix without explaining clamp behavior.",
          hint: "What does clamp-to-edge do with a UV of 8?",
        },
      ],
    },
    {
      id: "mipmaps", title: "Mipmaps & Atlases", minutes: 13,
      summary: "Level-of-detail chains that kill shimmer, and atlas gotchas.",
      Body: Mipmaps,
      quiz: {
        questions: [
          { q: "Mipmaps primarily prevent…", choices: ["Out-of-memory errors", "Shimmering/aliasing on distant textures", "Slow vertex shaders", "Gimbal lock"], answer: 1, explain: "They match texel size to screen footprint, removing minification aliasing." },
          { q: "The full mipmap chain adds roughly how much memory?", choices: ["100% (doubles it)", "About 33% (×4/3)", "Nothing", "10×"], answer: 1, explain: "1 + 1/4 + 1/16 + … = 4/3, so about a third more." },
          { q: "A texture atlas can show seams at high mip levels unless you…", choices: ["Disable filtering", "Add padding/gutters between sub-images", "Use only one texture", "Increase resolution infinitely"], answer: 1, explain: "Padding stops neighboring sub-images from bleeding together when downsampled." },
        ],
      },
    },
  ],
};
