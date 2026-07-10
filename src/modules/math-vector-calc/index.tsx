import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";

function VectorsRecap() {
  return (
    <div className="prose">
      <p>
        Before we differentiate fields, let's recall the two products that give vectors their
        geometric power. Both take two vectors — but one returns a number, the other a vector, and the
        difference is the whole point.
      </p>
      <p>
        The <strong>dot product</strong> measures <em>alignment</em>. It multiplies matching
        components and sums, and equals the product of lengths times the cosine of the angle between
        them:
      </p>
      <MBlock>{`\\mathbf{a} \\cdot \\mathbf{b} = a_x b_x + a_y b_y + a_z b_z = \\|\\mathbf{a}\\|\\,\\|\\mathbf{b}\\|\\cos\\theta`}</MBlock>
      <p>
        So the dot product is zero when the vectors are perpendicular, positive when they point the
        same general way, negative when opposed. This is the engine of diffuse lighting — brightness
        is <M>{`\\max(0, \\mathbf{n}\\cdot\\mathbf{l})`}</M>, the alignment of the surface normal with
        the light direction.
      </p>
      <p>
        The <strong>cross product</strong> returns a vector <em>perpendicular</em> to both inputs,
        with length equal to the area of the parallelogram they span:
      </p>
      <MBlock>{`\\mathbf{a} \\times \\mathbf{b} = \\big( a_y b_z - a_z b_y,\\; a_z b_x - a_x b_z,\\; a_x b_y - a_y b_x \\big)`}</MBlock>
      <p>
        Its magnitude is <M>{`\\|\\mathbf{a}\\|\\,\\|\\mathbf{b}\\|\\sin\\theta`}</M>, and its direction
        follows the right-hand rule. This is how you compute a triangle's surface <strong>normal</strong>{" "}
        from two of its edges — the foundation of shading and back-face culling.
      </p>
      <div className="notice">
        <span className="lbl">One returns a scalar, one a vector</span> Dot → a single number about
        angle. Cross → a whole vector about the perpendicular direction and the spanned area. Keeping
        that straight is half of vector calculus.
      </div>
    </div>
  );
}

function Gradient() {
  return (
    <div className="prose">
      <p>
        A <strong>scalar field</strong> <M>{`f(x, y, z)`}</M> assigns a number to every point in space
        — temperature in a room, height on a terrain, or the brightness of a texture. Its rate of
        change is not a single number, because you can move in any direction. We need a{" "}
        <strong>partial derivative</strong> per axis.
      </p>
      <p>
        A partial derivative <M>{`\\partial f / \\partial x`}</M> asks: how fast does <M>{`f`}</M>{" "}
        change if I nudge <em>only</em> <M>{`x`}</M>, holding the other variables fixed? You
        differentiate treating <M>{`y`}</M> and <M>{`z`}</M> as constants.
      </p>
      <p>
        Stack all the partials into one vector and you get the <strong>gradient</strong>:
      </p>
      <MBlock>{`\\nabla f = \\left( \\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y},\\; \\frac{\\partial f}{\\partial z} \\right)`}</MBlock>
      <p>
        The gradient is the single most useful object in applied calculus, because it has a clean
        geometric meaning: <strong><M>{`\\nabla f`}</M> points in the direction of steepest ascent</strong>,
        and its length is how steep that climb is. Stand on a hillside; the gradient points straight
        uphill. It is also always <em>perpendicular to the level sets</em> (contour lines) of{" "}
        <M>{`f`}</M>.
      </p>
      <div className="notice">
        <span className="lbl">Why everyone cares</span> Optimization and machine learning are built on
        this: <strong>gradient descent</strong> repeatedly steps in the direction{" "}
        <M>{`-\\nabla f`}</M> — steepest <em>descent</em> — to minimize a loss. In graphics, the
        gradient of a height or distance field gives surface normals and drives bump/normal mapping.
      </div>
      <div className="notice warn">
        <span className="lbl">Gradient vs. derivative</span> For a one-variable function the gradient
        is just the ordinary derivative. The gradient is the honest multivariable generalization of
        "slope" — a direction, not a scalar.
      </div>
    </div>
  );
}

function DivCurl() {
  return (
    <div className="prose">
      <p>
        Now consider a <strong>vector field</strong> <M>{`\\mathbf{F}(x,y,z)`}</M> — a vector at every
        point, like wind velocity or a fluid flow. The operator <M>{`\\nabla`}</M> combines with it in
        two more ways, and each has a vivid physical picture.
      </p>
      <p>
        <strong>Divergence</strong> is a scalar: it measures how much the field is <em>spreading out</em>{" "}
        from a point — the net outflow. It is the dot product of <M>{`\\nabla`}</M> with the field:
      </p>
      <MBlock>{`\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}`}</MBlock>
      <p>
        Picture a tiny box. Positive divergence means more flow leaves than enters — a{" "}
        <strong>source</strong> (water emerging from a spring). Negative divergence is a{" "}
        <strong>sink</strong> (a drain). Zero divergence means whatever flows in flows out — an{" "}
        <em>incompressible</em> flow, which is exactly the constraint fluid simulations enforce.
      </p>
      <p>
        <strong>Curl</strong> is a vector: it measures how much the field <em>rotates</em> around a
        point — the local swirl. It is the cross product of <M>{`\\nabla`}</M> with the field:
      </p>
      <MBlock>{`\\nabla \\times \\mathbf{F} = \\left( \\frac{\\partial F_z}{\\partial y} - \\frac{\\partial F_y}{\\partial z},\\; \\frac{\\partial F_x}{\\partial z} - \\frac{\\partial F_z}{\\partial x},\\; \\frac{\\partial F_y}{\\partial x} - \\frac{\\partial F_x}{\\partial y} \\right)`}</MBlock>
      <p>
        Drop a tiny paddlewheel into the flow: if it spins, there is curl, and the curl vector points
        along the spin axis (right-hand rule) with length equal to twice the rotation rate. A field
        with zero curl everywhere is called <strong>irrotational</strong> — and such fields are
        exactly the gradients of some scalar potential.
      </p>
      <div className="notice">
        <span className="lbl">Divergence ↔ dot, curl ↔ cross</span> The pattern mirrors the last-but-one
        lesson: divergence uses the <em>dot</em> (giving a scalar about spreading), curl uses the{" "}
        <em>cross</em> (giving a vector about rotation). <strong>Curl-noise</strong> in graphics uses
        exactly this to make divergence-free, swirling velocity fields for smoke and magic effects.
      </div>
    </div>
  );
}

function Directional() {
  return (
    <div className="prose">
      <p>
        The partial derivatives measure change along the coordinate axes. But what if you want the
        rate of change in some <em>arbitrary</em> direction — say, walking northeast across a terrain?
        That is the <strong>directional derivative</strong>.
      </p>
      <p>
        For a unit vector <M>{`\\mathbf{u}`}</M>, the directional derivative of <M>{`f`}</M> is simply
        the gradient dotted with that direction:
      </p>
      <MBlock>{`D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u} = \\|\\nabla f\\|\\cos\\theta`}</MBlock>
      <p>
        This one formula ties the whole module together, and it explains <em>why</em> the gradient
        points uphill. The dot product is maximized when <M>{`\\mathbf{u}`}</M> lines up with{" "}
        <M>{`\\nabla f`}</M> (<M>{`\\cos\\theta = 1`}</M>): steepest ascent is <em>along</em> the
        gradient. It is zero when <M>{`\\mathbf{u}`}</M> is perpendicular to <M>{`\\nabla f`}</M> — you
        are walking along a contour, staying at the same height. And it is most negative straight
        opposite the gradient — steepest descent.
      </p>
      <div className="notice">
        <span className="lbl">Reading it back</span> The three facts about the gradient — points
        uphill, perpendicular to level sets, length = max slope — all fall out of{" "}
        <M>{`D_{\\mathbf{u}} f = \\|\\nabla f\\|\\cos\\theta`}</M>. One dot product, three consequences.
      </div>
      <p>
        In practice this is how you evaluate "how does my loss change if I step <em>this</em> way?" or,
        in shading, "how does brightness vary along the view direction?" — project the gradient onto
        the direction you care about.
      </p>
    </div>
  );
}

function Integrals() {
  return (
    <div className="prose">
      <p>
        We close by carrying integration into vector fields. There are two natural things to integrate:
        along a <em>curve</em>, and over a <em>surface</em>.
      </p>
      <p>
        A <strong>line integral</strong> adds up a field's contribution as you travel along a path{" "}
        <M>{`C`}</M>. For a force field <M>{`\\mathbf{F}`}</M>, the line integral is the total{" "}
        <strong>work</strong> done moving along the curve — at each step you take the dot product of
        the force with your direction of travel:
      </p>
      <MBlock>{`W = \\int_C \\mathbf{F} \\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}'(t)\\, dt`}</MBlock>
      <p>
        Notice how this reuses the Curves module: parameterize the path as <M>{`\\mathbf{r}(t)`}</M>,
        and the line integral becomes an ordinary single-variable integral in <M>{`t`}</M>. The dot
        product picks out only the component of the field pointing along the motion — force
        perpendicular to your path does no work.
      </p>
      <p>
        A <strong>surface integral</strong> adds a field's contribution over a 2D surface{" "}
        <M>{`S`}</M>. The most important flavor is <strong>flux</strong>: how much of a flow field
        passes through the surface, measured by dotting the field with the surface normal{" "}
        <M>{`\\mathbf{n}`}</M>:
      </p>
      <MBlock>{`\\Phi = \\iint_S \\mathbf{F} \\cdot \\mathbf{n}\\, dS`}</MBlock>
      <p>
        Flux is "how much stuff crosses this membrane per unit time" — water through a net, light
        through a lens, field lines through a loop.
      </p>
      <div className="notice">
        <span className="lbl">The grand finale</span> The big theorems — Green's, Stokes', and the
        Divergence theorem — say these integrals tie together beautifully: the flux of a field's{" "}
        <em>divergence</em> through a closed surface equals the total outflow across it, and the line
        integral of a field around a loop equals the flux of its <em>curl</em> through the enclosed
        surface. Divergence and curl are the local densities whose totals these integrals accumulate —
        integration and differentiation, reunited in higher dimensions.
      </div>
    </div>
  );
}

export const mathVectorCalc: Module = {
  id: "math-vector-calc",
  title: "Vector Calculus",
  icon: "🧭",
  track: "math",
  blurb:
    "Dot and cross products, the gradient and steepest ascent, divergence and curl, directional derivatives, and a gentle intro to line and surface integrals.",
  dependsOn: ["math-curves", "math-integrals"],
  lessons: [
    {
      id: "vectors-recap",
      title: "Vectors: Dot & Cross Product Recap",
      minutes: 11,
      summary: "Dot product = alignment (a scalar); cross product = perpendicular & area (a vector).",
      Body: VectorsRecap,
      quiz: {
        questions: [
          {
            q: "The dot product a·b is zero exactly when the vectors are…",
            choices: ["Parallel", "Perpendicular", "Equal in length", "Both unit vectors"],
            answer: 1,
            explain: "a·b = ‖a‖‖b‖cosθ, and cos(90°) = 0, so a zero dot product means a right angle.",
          },
          {
            q: "The cross product a×b returns…",
            choices: ["A scalar equal to the angle", "A vector perpendicular to both a and b", "The sum of the components", "The projection of a onto b"],
            answer: 1,
            explain: "The cross product yields a vector perpendicular to both inputs, with length equal to the spanned parallelogram's area.",
          },
        ],
      },
      exercises: [
        {
          id: "dot-recap",
          kind: "numeric",
          prompt: "Compute a·b for a = (1, 2, 2), b = (2, 0, 1).",
          starter: "",
          hint: "1·2 + 2·0 + 2·1.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 4) < 0.01
              ? { pass: true, message: "Correct — 2 + 0 + 2 = 4." }
              : { pass: false, message: "Sum the products: 1·2 + 2·0 + 2·1 = 4." },
        },
      ],
    },
    {
      id: "gradient",
      title: "Partial Derivatives & the Gradient",
      minutes: 14,
      summary: "∇f stacks the partials and points in the direction of steepest ascent.",
      Body: Gradient,
      quiz: {
        questions: [
          {
            q: "A partial derivative ∂f/∂x is computed by…",
            choices: ["Differentiating with respect to x while holding other variables constant", "Averaging over all variables", "Integrating over x", "Taking the cross product"],
            answer: 0,
            explain: "You treat every other variable as a constant and differentiate in x alone.",
          },
          {
            q: "The gradient ∇f points in the direction of…",
            choices: ["Steepest descent", "Steepest ascent", "Zero change", "The x-axis"],
            answer: 1,
            explain: "∇f points uphill (steepest ascent); its negative, −∇f, is the descent direction used in gradient descent.",
          },
          {
            q: "In machine learning, gradient descent minimizes a loss by stepping in the direction…",
            choices: ["+∇f", "−∇f", "∇×f", "∇·f"],
            answer: 1,
            explain: "To go downhill you step opposite the gradient, −∇f, the direction of steepest decrease.",
          },
        ],
      },
      exercises: [
        {
          id: "grad-mag",
          kind: "numeric",
          prompt: "For f(x, y) = x² + y², the gradient is (2x, 2y). At the point (3, 4), what is the magnitude ‖∇f‖?",
          starter: "",
          hint: "∇f = (6, 8); take √(6² + 8²).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 10) < 0.01
              ? { pass: true, message: "Correct — ‖(6, 8)‖ = √100 = 10." }
              : { pass: false, message: "∇f at (3,4) is (6, 8); its length is √(36+64) = 10." },
        },
      ],
    },
    {
      id: "div-curl",
      title: "Divergence & Curl",
      minutes: 14,
      summary: "Divergence (∇·F) measures spreading; curl (∇×F) measures rotation.",
      Body: DivCurl,
      quiz: {
        questions: [
          {
            q: "Divergence ∇·F measures…",
            choices: ["How much the field rotates", "How much the field spreads out (net outflow) from a point", "The field's magnitude", "The angle of the field"],
            answer: 1,
            explain: "Divergence is the net outflow per unit volume — positive at sources, negative at sinks.",
          },
          {
            q: "Curl ∇×F measures…",
            choices: ["The field's rotation/swirl around a point", "The field's outflow", "The field's average value", "The gradient of the field"],
            answer: 0,
            explain: "Curl captures local rotation; a paddlewheel dropped in the flow would spin if curl is nonzero.",
          },
          {
            q: "A fluid flow with zero divergence everywhere is called…",
            choices: ["Irrotational", "Incompressible", "Turbulent", "Static"],
            answer: 1,
            explain: "Zero divergence means inflow equals outflow at every point — an incompressible flow.",
          },
        ],
      },
    },
    {
      id: "directional",
      title: "Directional Derivatives",
      minutes: 11,
      summary: "The rate of change along any unit direction u is ∇f · u.",
      Body: Directional,
      quiz: {
        questions: [
          {
            q: "The directional derivative of f along a unit vector u equals…",
            choices: ["∇f × u", "∇f · u", "‖∇f‖ + ‖u‖", "∇·f"],
            answer: 1,
            explain: "D_u f = ∇f · u = ‖∇f‖cosθ — the gradient projected onto the direction of travel.",
          },
          {
            q: "The directional derivative is zero when you move…",
            choices: ["Along the gradient", "Opposite the gradient", "Perpendicular to the gradient (along a level set)", "Toward the origin"],
            answer: 2,
            explain: "cosθ = 0 when u ⟂ ∇f, so walking along a contour leaves f unchanged.",
          },
        ],
      },
      exercises: [
        {
          id: "dir-deriv",
          kind: "numeric",
          prompt: "With ∇f = (3, 4) and unit direction u = (1, 0), compute the directional derivative ∇f · u.",
          starter: "",
          hint: "Dot (3, 4) with (1, 0).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — 3·1 + 4·0 = 3, the rate of change along the x-direction." }
              : { pass: false, message: "∇f · u = 3·1 + 4·0 = 3." },
        },
      ],
    },
    {
      id: "field-integrals",
      title: "A Gentle Intro to Line & Surface Integrals",
      minutes: 13,
      summary: "Integrate a field along a curve (work) or over a surface (flux).",
      Body: Integrals,
      quiz: {
        questions: [
          {
            q: "The line integral ∫_C F · dr of a force field along a path computes…",
            choices: ["The area under F", "The work done along the path", "The curl of F", "The length of C"],
            answer: 1,
            explain: "Dotting force with the direction of motion and summing along the path gives total work.",
          },
          {
            q: "The flux surface integral ∬_S F · n dS measures…",
            choices: ["How much the field rotates", "How much of the field passes through the surface", "The surface area", "The gradient on the surface"],
            answer: 1,
            explain: "Flux dots the field with the surface normal — the amount of flow crossing the surface.",
          },
        ],
      },
      exercises: [
        {
          id: "flux-open",
          kind: "open",
          prompt: "Explain in your own words why force applied perpendicular to your direction of motion does zero work, using the line integral ∫_C F · dr.",
          starter: "Because the integrand is a dot product, ",
          rubric:
            "Full credit for recognizing that F · dr = ‖F‖‖dr‖cosθ, that a perpendicular force gives θ = 90° so cosθ = 0, and therefore each contribution to the integral is zero (e.g., centripetal force in circular motion does no work). Partial credit for the right intuition without invoking the dot-product cosine.",
          hint: "What does the dot product become when the two vectors are at 90°?",
        },
      ],
    },
  ],
};
