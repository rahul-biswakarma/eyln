import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";

function Normals() {
  return (
    <div className="prose">
      <p>
        Lighting starts with <strong>normals</strong>: a unit vector at each surface point telling which
        way the surface faces. You met them in the cross-product lesson — the cross of two triangle edges
        gives a face normal. For smooth surfaces you store a normal per <em>vertex</em> and let the
        rasterizer interpolate them across the triangle, so a coarse mesh still shades smoothly.
      </p>

      <h3>Why Normals Require Inverse-Transpose Transformation</h3>
      <p>
        Positions on a surface are transformed by the model matrix <M>{`M`}</M>. However, if you transform normals using <M>{`M`}</M> directly, non-uniform scaling skews the normals, causing them to no longer be perpendicular to the surface.
      </p>
      <p>
        Here is the mathematical proof for why normals must be transformed by the <strong>inverse-transpose</strong> of the upper-left 3×3 matrix of <M>{`M`}</M>:
      </p>
      <ol>
        <li>
          Let <M>{`t`}</M> be a tangent vector lying on the surface. By definition, the normal vector <M>{`n`}</M> is perpendicular to <M>{`t`}</M>:
          <MBlock>{`n^T t = 0`}</MBlock>
        </li>
        <li>
          Under a transform matrix <M>{`M`}</M>, the tangent vector transforms directly: <M>{`t' = M \\cdot t`}</M>.
        </li>
        <li>
          We want the transformed normal <M>{`n' = A \\cdot n`}</M> to remain perpendicular to the transformed tangent <M>{`t'`}</M>:
          <MBlock>{`(n')^T t' = 0`}</MBlock>
        </li>
        <li>
          Substitute the definitions of <M>{`n'`}</M> and <M>{`t'`}</M>:
          <MBlock>{`(A \\cdot n)^T (M \\cdot t) = 0 \\implies n^T (A^T M) t = 0`}</MBlock>
        </li>
        <li>
          For this equation to hold true for any surface normal and tangent vector, we require:
          <MBlock>{`A^T M = I \\implies A^T = M^{-1} \\implies A = (M^{-1})^T`}</MBlock>
        </li>
      </ol>
      <p>
        Thus, the normal matrix <M>{`A`}</M> is the transpose of the inverse of the model matrix. 
        For rotation-only transforms, the inverse equals the transpose (<M>{`M^{-1} = M^T`}</M>), so <M>{`(M^{-1})^T = M`}</M>, which is why lighting bugs under scaling are often missed until you scale non-uniformly.
      </p>

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

      <h3>Specular Highlights: Phong vs. Blinn-Phong</h3>
      <p>
        Specular reflections represent shiny highlights. The two standard formulations are:
      </p>
      <ul>
        <li>
          <strong>Phong Specular</strong>: Reflects the light direction around the normal vector to get a reflection vector <M>{`r = 2(\\hat{n} \\cdot \\hat{l})\\hat{n} - \\hat{l}`}</M>, then measures the alignment of the view vector <M>{`\\hat{v}`}</M> with <M>{`\\hat{r}`}</M>:
          <MBlock>{`I_{\\text{spec}} = \\max(0,\\; \\hat{v} \\cdot \\hat{r})^s`}</MBlock>
        </li>
        <li>
          <strong>Blinn-Phong Specular</strong>: Uses the <strong>half vector</strong> <M>{`\\hat{h}`}</M>—halfway between the light and the view direction:
          <MBlock>{`I_{\\text{spec}} = \\max(0,\\; \\hat{n} \\cdot \\hat{h})^s, \\quad \\hat{h} = \\frac{\\hat{l} + \\hat{v}}{\\|\\hat{l} + \\hat{v}\\|}`}</MBlock>
        </li>
      </ul>
      
      <h3>Physical Interpretation of the Half-Vector</h3>
      <p>
        Blinn-Phong models the surface as containing microscopic mirrors (microfacets). 
        A microfacet reflects light directly into the camera if and only if its microscopic normal vector is oriented parallel to the half-vector <M>{`\\hat{h}`}</M>. 
        The specular term <M>{`(\\hat{n} \\cdot \\hat{h})^s`}</M> thus represents the statistical density of microfacets that are oriented perfectly to reflect light to the viewer, where shininess exponent <M>{`s`}</M> controls surface smoothness.
      </p>

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

      <h3>Cook-Torrance Specular BRDF Math</h3>
      <p>
        The Cook-Torrance BRDF models specular highlights using microfacet theory. It divides the highlight into three physical components:
      </p>
      <MBlock>{`f_{\\text{spec}} = \\frac{D(h) \\cdot F(v, h) \\cdot G(l, v, h)}{4 \\, (\\hat{n} \\cdot \\hat{v})(\\hat{n} \\cdot \\hat{l})}`}</MBlock>
      <p>Where the components are defined by these industry-standard equations:</p>
      <ul>
        <li>
          <strong>D (Normal Distribution Function)</strong>: Models the concentration of microfacets pointing in the half-vector direction. Standard PBR uses <strong>Trowbridge-Reitz GGX</strong>:
          <MBlock>{`D(h) = \\frac{\\alpha^2}{\\pi ((n \\cdot h)^2 (\\alpha^2 - 1) + 1)^2} \\qquad \\text{where } \\alpha = \\text{roughness}^2`}</MBlock>
        </li>
        <li>
          <strong>F (Fresnel Reflectance)</strong>: Calculates the reflection scaling as light hits grazing angles. Standard PBR uses <strong>Schlick's Approximation</strong>:
          <MBlock>{`F(v, h) = F_0 + (1 - F_0)(1 - (h \\cdot v))^5`}</MBlock>
          Here, <M>{`F_0`}</M> is the base reflectivity at normal incidence. For dielectrics it is fixed around <M>{`0.04`}</M>; for conductors (metals) it is equal to the albedo color.
        </li>
        <li>
          <strong>G (Geometry Function)</strong>: Models microfacet self-shadowing and masking, where microscopic bumps block incoming light or outgoing reflection. Standard PBR uses Smith's method split into light and view factors.
        </li>
      </ul>

      <h3>Energy Conservation and Metalness</h3>
      <p>
        To prevent surfaces reflecting more light than they receive (violating energy conservation), the sum of diffuse reflection and specular reflection must not exceed 1: <M>{`k_d + k_s \\le 1`}</M>. 
        Since metals only reflect light specularly, a metalness parameter of 1 sets the diffuse component <M>{`k_d`}</M> to zero and uses the albedo color directly as the specular base reflectivity <M>{`F_0`}</M>.
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
