import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";

function Normals() {
  return (
    <div className="prose">
      <p>
        Lighting starts with <strong>normals</strong>: a unit vector at each surface point telling which
        way the surface faces. You met them in the cross-product lesson — the cross of two triangle edges
        gives a face normal. For smooth surfaces you store a normal per <em>vertex</em> and let the
        rasterizer interpolate them across the triangle, so a coarse mesh still shades smoothly.
      </p>
      <div className="notice warn">
        <span className="lbl">Normals don't transform like positions</span>
        If you scale a model non-uniformly, transforming normals by the model matrix skews them off the
        surface. Normals must be transformed by the <strong>inverse-transpose</strong> of the upper-left
        3×3. For rotation-only transforms the two are equal, which is why the bug hides until you scale.
      </div>
      <CodeTabs
        tabs={[
          {
            label: "Odin (normal matrix)", lang: "odin",
            code: `import "core:math/linalg"

// Upper-left 3x3 of the model matrix, then inverse-transpose.
m3 := linalg.matrix3_from_matrix4(model)
normal_matrix := linalg.transpose(linalg.inverse(m3))
// Upload normal_matrix alongside the MVP; use it on normals only.`,
          },
          {
            label: "WGSL", lang: "wgsl",
            code: `struct U { mvp : mat4x4<f32>, normal_mat : mat3x3<f32> };
@group(0) @binding(0) var<uniform> u : U;

@vertex
fn vs(@location(0) pos : vec3<f32>,
      @location(1) nrm : vec3<f32>) -> VSOut {
  var o : VSOut;
  o.clip = u.mvp * vec4<f32>(pos, 1.0);
  o.world_n = normalize(u.normal_mat * nrm);   // correct under scaling
  return o;
}`,
          },
        ]}
      />
    </div>
  );
}

function DiffuseSpecular() {
  return (
    <div className="prose">
      <p>
        The classic real-time model splits reflected light into three terms:{" "}
        <strong>ambient</strong> (a cheap constant standing in for bounced light),{" "}
        <strong>diffuse</strong> (matte, view-independent), and <strong>specular</strong> (the shiny
        highlight). Diffuse is pure Lambert — the clamped dot of the normal and the light direction:
      </p>
      <MBlock>{`I_\\text{diff} = \\max(0,\\; \\hat{n} \\cdot \\hat{l})`}</MBlock>
      <p>
        Specular (Blinn-Phong) uses the <strong>half vector</strong> <M>{`\\hat{h}`}</M> — halfway
        between the light and the view direction. The tighter you want the highlight, the higher the
        shininess exponent <M>{`s`}</M>:
      </p>
      <MBlock>{`I_\\text{spec} = \\max(0,\\; \\hat{n} \\cdot \\hat{h})^{\\,s}, \\quad \\hat{h} = \\frac{\\hat{l} + \\hat{v}}{|\\hat{l} + \\hat{v}|}`}</MBlock>
      <Code
        lang="wgsl" filename="blinn_phong.wgsl"
        code={`@fragment
fn fs(in : VSOut) -> @location(0) vec4<f32> {
  let n = normalize(in.world_n);
  let l = normalize(light_pos - in.world_p);
  let v = normalize(cam_pos   - in.world_p);
  let h = normalize(l + v);

  let diff = max(dot(n, l), 0.0);
  let spec = pow(max(dot(n, h), 0.0), 64.0);   // 64 = shininess

  let color = ambient + diff * base_color + spec * vec3<f32>(1.0);
  return vec4<f32>(color, 1.0);
}`}
      />
      <div className="notice">
        <span className="lbl">Why Blinn over Phong</span>
        Phong reflects the view around the normal (<code>reflect(-l, n)</code>); Blinn's half-vector is
        cheaper and avoids the highlight cutting off abruptly at grazing angles. Both are approximations —
        the next lesson replaces the guesswork with physics.
      </div>
    </div>
  );
}

function PBRIntro() {
  return (
    <div className="prose">
      <p>
        Blinn-Phong has invented constants with no physical meaning. <strong>Physically based
        rendering (PBR)</strong> instead conserves energy and describes surfaces with parameters artists
        can reason about: <strong>albedo</strong> (base color), <strong>metalness</strong> (0 =
        dielectric, 1 = metal), and <strong>roughness</strong> (0 = mirror, 1 = fully matte).
      </p>
      <p>
        The workhorse is the <strong>Cook-Torrance</strong> specular BRDF, a product of three terms — a
        normal <strong>D</strong>istribution (how microfacets align, driven by roughness), a{" "}
        <strong>G</strong>eometry term (self-shadowing between microfacets), and <strong>F</strong>resnel
        (reflectivity rising at grazing angles):
      </p>
      <MBlock>{`f_\\text{spec} = \\frac{D \\, F \\, G}{4\\,(\\hat{n}\\cdot\\hat{v})(\\hat{n}\\cdot\\hat{l})}`}</MBlock>
      <p>
        You don't need to memorize the closed forms yet — the point is the <em>structure</em>: the same
        dot products you already compute, fed through functions that respect energy conservation, so a
        surface never reflects more light than it receives. That single constraint is why PBR looks right
        under any lighting.
      </p>
      <div className="notice warn">
        <span className="lbl">Work in linear space</span>
        Textures are usually stored gamma-encoded (sRGB). Do all lighting math in <strong>linear</strong>
        space, then convert to sRGB at the very end. Lighting in gamma space is the most common reason
        PBR looks muddy or washed out.
      </div>
    </div>
  );
}

export const lighting: Module = {
  id: "lighting",
  title: "Lighting & Shading",
  icon: "💡",
  blurb: "Normals, the diffuse/specular model, and a physically based rendering primer — how surfaces catch light.",
  dependsOn: ["linear-algebra", "metal"],
  lessons: [
    {
      id: "normals", title: "Normals & the Normal Matrix", minutes: 12,
      summary: "Per-vertex normals and why scaling needs the inverse-transpose.",
      Body: Normals,
      quiz: {
        questions: [
          { q: "To transform a normal under non-uniform scaling you use…", choices: ["The model matrix directly", "The inverse-transpose of the model's 3×3", "The projection matrix", "No transform at all"], answer: 1, explain: "Only the inverse-transpose keeps normals perpendicular to the scaled surface." },
          { q: "Per-vertex normals give smooth shading because…", choices: ["The GPU rounds them", "The rasterizer interpolates them across the triangle", "They're always (0,1,0)", "They disable lighting"], answer: 1, explain: "Interpolated normals vary smoothly across each face." },
        ],
      },
    },
    {
      id: "diffuse-specular", title: "Diffuse & Specular", minutes: 14,
      summary: "Ambient + Lambert diffuse + Blinn-Phong specular.",
      Body: DiffuseSpecular,
      quiz: {
        questions: [
          { q: "Lambert diffuse brightness is…", choices: ["max(0, n·l)", "n × l", "the half vector", "always 1"], answer: 0, explain: "Clamped dot of normal and light direction — view-independent matte shading." },
          { q: "The Blinn half vector is between…", choices: ["Two triangle edges", "The light and view directions", "The normal and the tangent", "Two vertices"], answer: 1, explain: "h = normalize(l + v); n·h drives the specular highlight." },
        ],
      },
      exercises: [
        {
          id: "spec-open", kind: "open",
          prompt: "A highlight on your model is too broad and soft; you want a tighter, glossier dot. Which term do you change and in which direction, and why?",
          starter: "",
          rubric: "Full credit: raise the shininess/specular exponent s; a larger exponent makes (n·h)^s fall off faster away from the mirror direction, concentrating the highlight. Partial: says increase shininess without explaining the falloff.",
          hint: "Look at the exponent on (n·h).",
        },
      ],
    },
    {
      id: "pbr-intro", title: "Physically Based Rendering (Primer)", minutes: 15,
      summary: "Albedo/metalness/roughness and the Cook-Torrance D·F·G structure.",
      Body: PBRIntro,
      quiz: {
        questions: [
          { q: "The three PBR surface parameters are…", choices: ["Red, green, blue", "Albedo, metalness, roughness", "Ambient, diffuse, specular", "Near, far, fov"], answer: 1, explain: "PBR describes materials by albedo, metalness, and roughness." },
          { q: "In Cook-Torrance, the Fresnel (F) term captures…", choices: ["Microfacet self-shadowing", "How reflectivity rises at grazing angles", "The texture UVs", "Depth precision"], answer: 1, explain: "Fresnel increases reflectivity as the view angle approaches grazing." },
          { q: "Lighting math should be done in…", choices: ["sRGB/gamma space", "Linear space, converting to sRGB at the end", "Integer space", "Screen space only"], answer: 1, explain: "Compute in linear space; encode to sRGB last to avoid muddy results." },
        ],
      },
    },
  ],
};
