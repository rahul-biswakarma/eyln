import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code } from "../../components/CodeBlock";

function Parametric() {
  return (
    <div className="prose">
      <p>
        A function <M>{`y = f(x)`}</M> can only draw curves that pass one vertical line at a time — no
        circles, no loops, no spirals. <strong>Parametric curves</strong> break free by letting a
        separate parameter <M>{`t`}</M> (think "time") drive each coordinate independently:
      </p>
      <MBlock>{`\\mathbf{r}(t) = \\big( x(t),\\; y(t),\\; z(t) \\big)`}</MBlock>
      <p>
        As <M>{`t`}</M> sweeps through its range, the point <M>{`\\mathbf{r}(t)`}</M> traces out the
        curve. A circle of radius <M>{`R`}</M> is <M>{`(R\\cos t, R\\sin t)`}</M>; a helix that climbs
        as it turns is <M>{`(\\cos t, \\sin t, t)`}</M>. The same shape can be walked at different
        speeds or directions depending on how you define <M>{`t`}</M>.
      </p>
      <p>
        Differentiate each component and you get the <strong>velocity</strong>, or{" "}
        <strong>tangent vector</strong> — it points in the direction the curve is heading, and its
        length is the speed of travel:
      </p>
      <MBlock>{`\\mathbf{r}'(t) = \\big( x'(t),\\; y'(t),\\; z'(t) \\big)`}</MBlock>
      <p>
        Normalize it and you have the <strong>unit tangent</strong> <M>{`\\mathbf{T}(t) = \\mathbf{r}'/\\|\\mathbf{r}'\\|`}</M>,
        the pure heading with the speed divided out. This single idea — the derivative of a
        position-valued function is a direction — is the backbone of camera paths, particle motion,
        and every "move along this track" animation.
      </p>
      <div className="notice">
        <span className="lbl">Graphics note</span> An object flying along a curve usually needs to{" "}
        <em>face</em> where it is going. You orient it by aligning its forward axis with{" "}
        <M>{`\\mathbf{T}(t)`}</M> — the tangent literally becomes the model's forward vector.
      </div>
    </div>
  );
}

function ArcLength() {
  return (
    <div className="prose">
      <p>
        How long is a curve? Straighten it out and measure. Chop the parameter range into tiny steps;
        over each step the point moves by a nearly-straight displacement whose length is the speed{" "}
        <M>{`\\|\\mathbf{r}'(t)\\|`}</M> times the time step <M>{`dt`}</M>. Sum those slivers and you
        get an integral — the connection back to the Integrals module is exact:
      </p>
      <MBlock>{`L = \\int_a^b \\|\\mathbf{r}'(t)\\|\\, dt = \\int_a^b \\sqrt{ x'(t)^2 + y'(t)^2 + z'(t)^2 }\\; dt`}</MBlock>
      <p>
        In plain words: <strong>arc length is the integral of speed over time</strong> — the same
        "distance equals the integral of speed" idea, now for a point moving through space. For the
        2D graph <M>{`y = f(x)`}</M> this specializes to the familiar{" "}
        <M>{`L = \\int_a^b \\sqrt{1 + f'(x)^2}\\; dx`}</M>.
      </p>
      <div className="notice warn">
        <span className="lbl">Rarely closed-form</span> That square root usually has no elementary
        antiderivative — even a simple ellipse gives an "elliptic integral" with no formula. In
        practice you evaluate arc length numerically, with the trapezoid or Simpson rule from the
        Integrals module.
      </div>
      <p>
        Arc length also lets you re-walk a curve at constant speed — <strong>arc-length
        parameterization</strong>. Games use it so a character moving along a spline covers real
        distance uniformly instead of speeding up wherever the control points happen to bunch.
      </p>
    </div>
  );
}

function Curvature() {
  return (
    <div className="prose">
      <p>
        The tangent tells you which way a curve points. <strong>Curvature</strong> tells you how
        sharply that direction is turning. A straight line has zero curvature; a tight circle has
        high curvature. Formally, curvature <M>{`\\kappa`}</M> is the rate at which the unit tangent
        rotates <em>per unit of arc length</em>:
      </p>
      <MBlock>{`\\kappa = \\left\\| \\frac{d\\mathbf{T}}{ds} \\right\\|`}</MBlock>
      <p>
        For a plane curve given as <M>{`(x(t), y(t))`}</M>, this works out to a tidy formula in the
        first and second derivatives:
      </p>
      <MBlock>{`\\kappa = \\frac{|x' y'' - y' x''|}{(x'^2 + y'^2)^{3/2}}`}</MBlock>
      <p>
        The reciprocal <M>{`R = 1/\\kappa`}</M> is the <strong>radius of curvature</strong>. Draw the
        circle with that radius that best kisses the curve at a point — matching its position,
        tangent, <em>and</em> curvature — and you have the <strong>osculating circle</strong> (from
        Latin <em>osculari</em>, "to kiss"). It is the circular arc the curve momentarily agrees with.
      </p>
      <div className="notice">
        <span className="lbl">Where it matters</span> Racing lines and road design use curvature to
        cap how fast you can take a bend without skidding (centripetal acceleration is{" "}
        <M>{`v^2 \\kappa`}</M>). In graphics, curvature drives adaptive tessellation — subdivide a
        surface more where it bends more, so silhouettes stay smooth without wasting triangles on
        flat regions.
      </div>
    </div>
  );
}

function Bezier() {
  return (
    <div className="prose">
      <p>
        Artists do not think in equations — they push handles. <strong>Bézier curves</strong> turn a
        handful of <strong>control points</strong> into a smooth curve, and they are the reason your
        font glyphs, Illustrator paths, and animation easing curves all look the way they do.
      </p>
      <p>
        A cubic Bézier has four control points <M>{`P_0, P_1, P_2, P_3`}</M>. The curve starts at{" "}
        <M>{`P_0`}</M>, ends at <M>{`P_3`}</M>, and is pulled toward — but generally does not pass
        through — the two interior points, which act like magnets shaping the tangents at the ends.
        The blend uses the <strong>Bernstein basis</strong>:
      </p>
      <MBlock>{`\\mathbf{B}(t) = (1-t)^3 P_0 + 3(1-t)^2 t\\, P_1 + 3(1-t) t^2 P_2 + t^3 P_3`}</MBlock>
      <p>
        Those four coefficients are the cubic Bernstein polynomials. They are always non-negative and
        sum to 1, so every point on the curve is a <em>weighted average</em> of the control points —
        which is why the curve stays inside their <strong>convex hull</strong>. In general the degree-
        <M>{`n`}</M> basis is <M>{`\\binom{n}{i}(1-t)^{n-i} t^i`}</M>.
      </p>
      <p>
        You rarely expand that polynomial directly. <strong>De Casteljau's algorithm</strong>{" "}
        evaluates a Bézier by repeated linear interpolation (lerp) — numerically stable and beautifully
        geometric: lerp between consecutive points, then lerp between those results, and so on until
        one point remains.
      </p>
      <Code
        lang="ts"
        code={`type V2 = [number, number];
const lerp = (a: V2, b: V2, t: number): V2 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

// De Casteljau: collapse control points down to one point on the curve.
function deCasteljau(points: V2[], t: number): V2 {
  let pts = points;
  while (pts.length > 1) {
    const next: V2[] = [];
    for (let i = 0; i < pts.length - 1; i++) next.push(lerp(pts[i], pts[i + 1], t));
    pts = next;
  }
  return pts[0];
}`}
      />
      <div className="notice">
        <span className="lbl">Engine link</span> This is exactly the machinery behind the 3D engine's
        spline tooling: control-point handles in the editor, cubic Béziers for camera and path curves,
        and de Casteljau (or its matrix form) to sample points every frame.
      </div>
    </div>
  );
}

function Splines() {
  return (
    <div className="prose">
      <p>
        One Bézier is a short arc. To draw a long, winding path you stitch many together into a{" "}
        <strong>spline</strong>. The whole game is controlling how neatly the pieces join, described by{" "}
        <strong>continuity</strong>:
      </p>
      <ul>
        <li>
          <strong>C⁰</strong> — the segments merely touch. Endpoints meet, but the direction can kink.
          A polyline is C⁰.
        </li>
        <li>
          <strong>C¹</strong> — positions <em>and</em> first derivatives (velocity/tangent) match at
          the seam. No kinks, but the "acceleration" can jump — a camera can lurch.
        </li>
        <li>
          <strong>C²</strong> — positions, first, and second derivatives all match. Visually and
          physically smooth; how you get gentle, natural motion.
        </li>
      </ul>
      <p>
        Plain Béziers force the artist to place interior handles by hand to keep tangents aligned
        across joins. <strong>Catmull–Rom splines</strong> fix that: you give only the points you want
        the curve to pass <em>through</em>, and each tangent is computed automatically from the
        neighbors:
      </p>
      <MBlock>{`\\mathbf{T}_i = \\frac{P_{i+1} - P_{i-1}}{2}`}</MBlock>
      <p>
        Because the tangent at each point is shared by the segments on both sides, Catmull–Rom is
        C¹-continuous and <strong>interpolating</strong> — the curve actually hits every control
        point, which is precisely what you want for a waypoint path. (The classic cubic version is not
        C², so for perfectly smooth acceleration you reach for a natural cubic or B-spline.)
      </p>
      <div className="notice">
        <span className="lbl">Choosing a spline</span> Want the curve to <em>pass through</em> your
        points (a camera dolly, a road)? Catmull–Rom. Want the smoothest possible shape and are happy
        for the curve to only be <em>influenced</em> by the points (a surface, a smooth blend)? A
        B-spline, which is C². Bézier sits underneath both as the evaluation primitive.
      </div>
      <div className="notice warn">
        <span className="lbl">Overshoot</span> Catmull–Rom can bulge past its control points on sharp
        turns. Tune it with a tension parameter, or switch to a monotone/centripetal variant, when a
        path must not clip through geometry.
      </div>
    </div>
  );
}

export const mathCurves: Module = {
  id: "math-curves",
  title: "Curves & Parametric Geometry",
  icon: "〰️",
  track: "math",
  blurb:
    "Parametric curves and tangents, arc length, curvature, Bézier curves and the Bernstein basis, and splines — the math behind computer-graphics paths.",
  dependsOn: ["math-derivatives"],
  lessons: [
    {
      id: "parametric",
      title: "Parametric Curves & the Tangent Vector",
      minutes: 13,
      summary: "Drive each coordinate by a parameter t; the derivative is the velocity/tangent.",
      Body: Parametric,
      quiz: {
        questions: [
          {
            q: "For a parametric curve r(t), what does the derivative r'(t) represent?",
            choices: ["The arc length", "The tangent (velocity) vector", "The curvature", "The area under the curve"],
            answer: 1,
            explain: "Differentiating each coordinate gives the velocity vector, which points along the curve.",
          },
          {
            q: "Why use parametric form instead of y = f(x)?",
            choices: ["It is always shorter", "It can trace loops, circles, and 3D paths a single-valued f(x) cannot", "It avoids derivatives", "It removes the need for t"],
            answer: 1,
            explain: "Letting each coordinate depend on t independently lets the curve loop back and live in 3D.",
          },
        ],
      },
      exercises: [
        {
          id: "tangent-speed",
          kind: "numeric",
          prompt: "For r(t) = (cos t, sin t), r'(t) = (−sin t, cos t). What is its speed ‖r'(t)‖?",
          starter: "",
          hint: "√(sin²t + cos²t).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 1) < 0.01
              ? { pass: true, message: "Correct — √(sin²t + cos²t) = 1, constant unit speed around the circle." }
              : { pass: false, message: "Use sin²t + cos²t = 1, so the speed is 1." },
        },
      ],
    },
    {
      id: "arc-length",
      title: "Arc Length",
      minutes: 12,
      summary: "Integrate the speed ‖r'(t)‖ over t to measure the true length of a curve.",
      Body: ArcLength,
      quiz: {
        questions: [
          {
            q: "Arc length of a parametric curve is the integral of…",
            choices: ["The curvature", "The speed ‖r'(t)‖", "The position ‖r(t)‖", "The second derivative"],
            answer: 1,
            explain: "Summing speed × dt over the interval gives total distance travelled — the arc length.",
          },
          {
            q: "Why are arc-length integrals usually evaluated numerically?",
            choices: ["Computers are faster", "The √ of a sum of squares rarely has an elementary antiderivative", "Arc length is undefined", "The FTC does not apply"],
            answer: 1,
            explain: "That square root typically yields no closed form, so trapezoid/Simpson quadrature is used.",
          },
        ],
      },
      exercises: [
        {
          id: "circle-arc",
          kind: "numeric",
          prompt: "A unit circle r(t) = (cos t, sin t) has speed 1. What is its arc length over t ∈ [0, 2π]?",
          starter: "",
          hint: "Integrate speed 1 from 0 to 2π — the circumference.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2 * Math.PI) < 0.01
              ? { pass: true, message: "Correct — ∫₀^{2π} 1 dt = 2π ≈ 6.283, the circumference." }
              : { pass: false, message: "Integrating speed 1 over [0, 2π] gives 2π ≈ 6.283." },
        },
      ],
    },
    {
      id: "curvature",
      title: "Curvature & the Osculating Circle",
      minutes: 13,
      summary: "How fast the tangent turns; its reciprocal is the radius of the kissing circle.",
      Body: Curvature,
      quiz: {
        questions: [
          {
            q: "Curvature κ measures…",
            choices: ["The length of the curve", "How fast the unit tangent turns per unit arc length", "The speed of travel", "The area enclosed"],
            answer: 1,
            explain: "κ = ‖dT/ds‖ — the turning rate of the direction as you move along the curve.",
          },
          {
            q: "The osculating circle at a point has radius…",
            choices: ["κ", "1/κ", "κ²", "2κ"],
            answer: 1,
            explain: "The radius of curvature R = 1/κ; a sharper bend (bigger κ) means a smaller circle.",
          },
        ],
      },
      exercises: [
        {
          id: "circle-curvature",
          kind: "numeric",
          prompt: "A circle of radius 4 has constant curvature κ = 1/R. What is κ?",
          starter: "",
          hint: "κ = 1/R with R = 4.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 0.25) < 0.01
              ? { pass: true, message: "Correct — κ = 1/4 = 0.25. A bigger circle curves more gently." }
              : { pass: false, message: "For a circle, κ = 1/R = 1/4 = 0.25." },
        },
      ],
    },
    {
      id: "bezier",
      title: "Bézier Curves & the Bernstein Basis",
      minutes: 15,
      summary: "Control points, the Bernstein blend, and de Casteljau — the graphics workhorse.",
      Body: Bezier,
      quiz: {
        questions: [
          {
            q: "A cubic Bézier curve passes through which of its four control points?",
            choices: ["All four", "Only the two endpoints P₀ and P₃", "Only the middle two", "None of them"],
            answer: 1,
            explain: "It interpolates the endpoints and is merely pulled toward the interior control points.",
          },
          {
            q: "The Bernstein basis functions at any t are non-negative and sum to 1, which guarantees…",
            choices: ["The curve is a straight line", "The curve stays within the convex hull of the control points", "The curve has zero curvature", "The endpoints are ignored"],
            answer: 1,
            explain: "Each curve point is a weighted average of control points, so it lies in their convex hull.",
          },
          {
            q: "De Casteljau's algorithm evaluates a Bézier by…",
            choices: ["Solving a linear system", "Repeated linear interpolation between control points", "Numerical integration", "Taking derivatives"],
            answer: 1,
            explain: "It repeatedly lerps neighboring points until a single point on the curve remains — stable and geometric.",
          },
        ],
      },
      exercises: [
        {
          id: "bezier-mid",
          kind: "numeric",
          prompt: "For control points P₀=0, P₁=2, P₂=2, P₃=0 (1-D), evaluate the cubic Bézier at t=0.5. Use B(0.5)=0.125·P₀+0.375·P₁+0.375·P₂+0.125·P₃.",
          starter: "",
          hint: "0.375·2 + 0.375·2 = 1.5.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 1.5) < 0.01
              ? { pass: true, message: "Correct — 0.375·2 + 0.375·2 = 1.5. The curve peaks below the interior points." }
              : { pass: false, message: "Only P₁ and P₂ are nonzero: 0.375·2 + 0.375·2 = 1.5." },
        },
      ],
    },
    {
      id: "splines",
      title: "Splines: Catmull–Rom & Continuity",
      minutes: 14,
      summary: "Stitch segments with C0/C1/C2 continuity; Catmull–Rom interpolates its points.",
      Body: Splines,
      quiz: {
        questions: [
          {
            q: "C¹ continuity at a spline joint means…",
            choices: ["The segments barely touch", "Positions and first derivatives (tangents) match — no kinks", "Only the second derivatives match", "The curve is a straight line"],
            answer: 1,
            explain: "C¹ matches position and tangent, removing kinks; C² additionally matches the second derivative.",
          },
          {
            q: "A key property of Catmull–Rom splines is that they…",
            choices: ["Never pass through the control points", "Interpolate (pass through) every control point", "Require manual tangent handles", "Are always C²"],
            answer: 1,
            explain: "Catmull–Rom computes tangents from neighbors and passes through each point — ideal for waypoint paths.",
          },
        ],
      },
      exercises: [
        {
          id: "spline-open",
          kind: "open",
          prompt: "You are building a camera path that must pass through a fixed set of waypoints, smoothly, with no kinks. Which spline do you choose and why? Mention the continuity level you get.",
          starter: "I would use ",
          rubric:
            "Full credit for choosing Catmull–Rom (or an equivalent interpolating spline), justifying it because it passes through the control points, and noting it gives C¹ continuity (tangents match, no kinks). Bonus for mentioning overshoot risk on sharp turns or the centripetal variant. Partial credit for a reasonable choice without the continuity reasoning.",
          hint: "Do you need the curve to pass through the points, or just be influenced by them?",
        },
      ],
    },
  ],
};
