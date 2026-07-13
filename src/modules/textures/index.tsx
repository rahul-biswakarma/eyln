import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";
function UVs() {
    return (<div className="prose">
      <p>
        A texture is an image the GPU samples while shading. To know <em>which</em> pixel (texel) to read
        for a given point on a triangle, each vertex carries <strong>texture coordinates</strong> —{" "}
        <M>{`(u, v)`}</M> in the range <M>{`[0, 1]`}</M>, independent of the image's pixel size.
        By convention <M>{`(0, 0)`}</M> is one corner and <M>{`(1, 1)`}</M> the opposite. Like normals,
        UVs are interpolated across the triangle by the rasterizer.
      </p>

      <h3>Perspective-Correct Interpolation Math</h3>
      <p>
        If you interpolate texture coordinates <M>{`u`}</M> and <M>{`v`}</M> linearly in screen-space, the texture will warp and skew as the triangle tilts relative to the camera. This happens because linear interpolation in screen-space does not account for the perspective projection's depth division.
      </p>
      <p>
        To solve this, the GPU hardware performs <strong>perspective-correct interpolation</strong>:
      </p>
      <ol>
        <li>At each vertex, the attributes are divided by depth <M>{`z`}</M> (or clip-space homogeneous <M>{`w`}</M>), computing:
          <MBlock>{`\\frac{u}{z}, \\quad \\frac{v}{z}, \\quad \\text{and} \\quad \\frac{1}{z}`}</MBlock>
        </li>
        <li>
          These values are interpolated linearly in screen-space across the triangle's fragments.
        </li>
        <li>
          At each fragment, the GPU reconstructs the true, perspective-correct UV coordinates by dividing the interpolated coordinate values by the interpolated reciprocal depth value:
          <MBlock>{`u_{\\text{correct}} = \\frac{u/z}{1/z}, \\qquad v_{\\text{correct}} = \\frac{v/z}{1/z}`}</MBlock>
        </li>
      </ol>
      <p>
        All modern GPUs do this calculation automatically in hardware for all vertex outputs unless explicitly requested otherwise (e.g. using WGSL's <code>@interpolate(linear, center)</code> or MSL's <code>[[flat]]</code> modifier).
      </p>

      <p>
        <strong>Unwrapping</strong> is the art of assigning UVs so a 2D image wraps a 3D mesh without
        ugly stretching or visible seams — think of peeling an orange flat. For procedural meshes (like
        the terrain you'll build) you generate UVs directly from position or grid indices.
      </p>
      <CodeTabs tabs={[
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
        ]}/>
    </div>);
}
function Samplers() {
    return (<div className="prose">
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

      <h3>Bilinear Filtering Mathematics</h3>
      <p>
        When you sample a texture of size <M>{`W \\times H`}</M> at coordinate <M>{`(u, v)`}</M>, the GPU computes continuous texel coordinates:
        <MBlock>{`x = u \\cdot W - 0.5, \\qquad y = v \\cdot H - 0.5`}</MBlock>
        To perform <strong>bilinear filtering</strong>, the GPU snaps to the four surrounding integer texels:
        <MBlock>{`T_{00} = (\\lfloor x \\rfloor, \\lfloor y \\rfloor), \\quad T_{10} = (\\lceil x \\rceil, \\lfloor y \\rfloor), \\quad T_{01} = (\\lfloor x \\rfloor, \\lceil y \\rceil), \\quad T_{11} = (\\lceil x \\rceil, \\lceil y \\rceil)`}</MBlock>
        Using the fractional parts <M>{`s = x - \\lfloor x \\rfloor`}</M> and <M>{`t = y - \\lfloor y \\rfloor`}</M>, the final texel color is calculated as:
        <MBlock>{`T(s, t) = (1-s)(1-t)T_{00} + s(1-t)T_{10} + (1-s)tT_{01} + stT_{11}`}</MBlock>
      </p>

      <h3>Anisotropic Filtering</h3>
      <p>
        When a textured surface is viewed at an oblique angle (like looking down a long highway), the screen-pixel footprint mapped onto the texture is a stretched trapezoid rather than a square. 
        Bilinear and trilinear filtering sample a square footprint, which blurs the distant texture along the direction of stretch.
      </p>
      <p>
        <strong>Anisotropic filtering</strong> solves this by taking multiple samples (up to 16×) along the stretched axis of the trapezoidal footprint, retaining sharp details at grazing angles.
      </p>

      <Code lang="odin" filename="sampler.odin" code={`import MTL "core:sys/darwin/Metal"

desc := MTL.SamplerDescriptor_alloc()->init()
defer desc->release()
desc->setMinFilter(.Linear)
desc->setMagFilter(.Linear)
desc->setSAddressMode(.Repeat)   // tile horizontally
desc->setTAddressMode(.Repeat)   // tile vertically
sampler := device->newSamplerState(desc)`}/>
      <div className="notice">
        <span className="lbl">Samplers are cheap, textures are not</span>
        A sampler is just a few bytes of state; you can reuse one across many textures. Bind the sampler
        and the texture separately so the same filtering rules apply everywhere.
      </div>
    </div>);
}
function Mipmaps() {
    return (<div className="prose">
      <p>
        When a textured surface recedes into the distance, one screen pixel covers many texels. Sampling
        just one of them makes textures <strong>shimmer and crawl</strong> as the camera moves —
        aliasing. <strong>Mipmaps</strong> fix this: a precomputed chain of half-size copies (level 0
        full-res, level 1 half, level 2 quarter…).
      </p>

      <h3>GPU Mipmap Level Selection Math</h3>
      <p>
        To decide which mip level to sample, the GPU estimates the rate of texture coordinate change per screen pixel using <strong>screen-space derivatives</strong>:
      </p>
      <ol>
        <li>
          GPUs execute fragment shaders in 2×2 pixel grids. The hardware calculates differences in UVs between adjacent pixels in the grid:
          <MBlock>{`\\frac{\\partial u}{\\partial x}, \\quad \\frac{\\partial v}{\\partial x}, \\quad \\frac{\\partial u}{\\partial y}, \\quad \\frac{\\partial v}{\\partial y}`}</MBlock>
        </li>
        <li>
          The texture footprint scale factor <M>{`\\rho`}</M> is calculated as the maximum rate of UV coordinate change multiplied by the texture dimensions <M>{`W`}</M> and <M>{`H`}</M>:
          <MBlock>{`\\rho = \\max \\left( \\sqrt{\\left(\\frac{\\partial u}{\\partial x}W\\right)^2 + \\left(\\frac{\\partial v}{\\partial x}H\\right)^2}, \\; \\sqrt{\\left(\\frac{\\partial u}{\\partial y}W\\right)^2 + \\left(\\frac{\\partial v}{\\partial y}H\\right)^2} \\right)`}</MBlock>
        </li>
        <li>
          The mipmap level <M>{`L`}</M> is selected logarithmically:
          <MBlock>{`L = \\log_2(\\rho)`}</MBlock>
        </li>
      </ol>
      <p>
        <strong>Trilinear filtering</strong> performs bilinear filtering on both mipmap level <M>{`\\lfloor L \\rfloor`}</M> and level <M>{`\\lfloor L \\rfloor + 1`}</M>, and then linearly blends between those two results based on the fractional part of <M>{`L`}</M>.
      </p>

      <p>
        The whole chain costs only about <M>{`\\tfrac{1}{3}`}</M> extra memory (a geometric series:{" "}
        <M>{`1 + \\tfrac14 + \\tfrac{1}{16} + \\cdots = \\tfrac43`}</M>) and it makes distant texturing
        both faster (better cache locality) and cleaner.
      </p>
      <Code lang="wgsl" filename="mip.wgsl" code={`// With a mipmapped texture + trilinear sampler, the SAME call
// automatically picks and blends mip levels from the UV derivatives.
let color = textureSample(tex, samp, uv);

// Force a specific level of detail when you need control:
let far = textureSampleLevel(tex, samp, uv, 4.0);`}/>
      <div className="notice warn">
        <span className="lbl">A texture atlas fights mipmaps</span>
        Packing many small images into one big <strong>atlas</strong> saves bind/draw calls, but at
        higher mip levels neighboring sub-images bleed into each other. Leave padding (a gutter) around
        each sub-image, or cap the mip level, to avoid seams.
      </div>
    </div>);
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
