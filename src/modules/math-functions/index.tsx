import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code } from "../../components/code-block";

function WhatIsAFunction() {
  return (
    <div className="prose">
      <p>
        Before calculus can say anything about change, we need the object that changes. That object is
        a <strong>function</strong>: a rule that takes an input and returns <em>exactly one</em> output.
        The image to hold in your head is a machine — feed it a number, turn the crank, one number
        comes out. Feed it the same number tomorrow and the same number comes out. That determinism is
        the whole point.
      </p>
      <p>We write the rule as</p>
      <MBlock>{`f : X \\to Y, \\qquad x \\mapsto f(x)`}</MBlock>
      <p>
        The set of legal inputs <M>{`X`}</M> is the <strong>domain</strong>. The set of values that can
        actually come out is the <strong>range</strong> (a subset of the <strong>codomain</strong>{" "}
        <M>{`Y`}</M>). The single rock-solid requirement is the <strong>vertical line test</strong>:
        each input maps to one output. A circle <M>{`x^2 + y^2 = 1`}</M> is <em>not</em> a function of{" "}
        <M>{`x`}</M>, because <M>{`x = 0`}</M> gives both <M>{`y = 1`}</M> and <M>{`y = -1`}</M>.
      </p>
      <p>
        The domain is not decoration — it is part of the function. Two rules with the same formula but
        different domains are different functions. And formulas quietly forbid inputs: you cannot
        divide by zero, take an even root of a negative, or take a logarithm of a non-positive number.
        For <M>{`g(x) = \\frac{1}{\\sqrt{x-2}}`}</M> the natural domain is <M>{`x > 2`}</M> — strictly
        greater, because <M>{`x = 2`}</M> divides by zero.
      </p>

      <h3>Injective, Surjective, and Bijective Functions</h3>
      <p>
        We classify functions by how they map inputs to outputs:
      </p>
      <ul>
        <li>
          <strong>Injective (One-to-One)</strong>: A function is injective if it never maps distinct inputs to the same output:
          <MBlock>{`f(a) = f(b) \\implies a = b`}</MBlock>
          Geometrically, this corresponds to the horizontal line test.
        </li>
        <li>
          <strong>Surjective (Onto)</strong>: A function is surjective if every element in the codomain <M>{`Y`}</M> is mapped to by at least one domain element:
          <MBlock>{`\\forall y \\in Y, \\; \\exists x \\in X \\quad \\text{such that} \\quad f(x) = y`}</MBlock>
        </li>
        <li>
          <strong>Bijective (One-to-One and Onto)</strong>: A function is bijective if it is both injective and surjective. 
          A bijective function creates a perfect one-to-one matching between <M>{`X`}</M> and <M>{`Y`}</M>. 
          <strong>Only bijective functions possess a well-defined inverse function</strong> <M>{`f^{-1} : Y \\to X`}</M>.
        </li>
      </ul>

      <div className="notice">
        <span className="lbl">Injective / surjective</span>
        A function is <strong>injective</strong> (one-to-one) if distinct inputs give distinct outputs —
        the horizontal line test. It is <strong>surjective</strong> (onto) if every codomain value is
        hit. Both at once means <strong>bijective</strong>, and only bijections have a true inverse. We
        will need this the moment we invert exponentials into logarithms.
      </div>
      <Code
        lang="ts"
        code={`// A function in code is the same idea: one input, one deterministic output.
const f = (x: number): number => x * x - 3 * x + 2;
f(0); //  2
f(1); //  0   <- a root
f(2); //  0   <- another root
f(1); //  0   again, always — same input, same output`}
      />
    </div>
  );
}

function LinearAndPolynomial() {
  return (
    <div className="prose">
      <p>
        The simplest non-constant function is the <strong>line</strong>. Everything in calculus is,
        locally, a line — the derivative is literally the slope of the best-fitting line — so it pays
        to know lines cold.
      </p>
      <MBlock>{`y = mx + b`}</MBlock>
      <p>
        <M>{`m`}</M> is the <strong>slope</strong>: rise over run,{" "}
        <M>{`m = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{y_2 - y_1}{x_2 - x_1}`}</M>. It is the amount{" "}
        <M>{`y`}</M> changes per unit step in <M>{`x`}</M>, and it is constant everywhere on a line —
        that constancy is exactly what makes a line straight. <M>{`b`}</M> is the{" "}
        <strong>y-intercept</strong>, the output at <M>{`x = 0`}</M>.
      </p>
      <p>
        A <strong>polynomial</strong> is a finite sum of power terms:
      </p>
      <MBlock>{`p(x) = a_n x^n + a_{n-1} x^{n-1} + \\cdots + a_1 x + a_0, \\quad a_n \\neq 0`}</MBlock>
      <p>
        The largest exponent <M>{`n`}</M> is the <strong>degree</strong>, and it governs the two things
        we care about most:
      </p>
      <ul>
        <li>
          <strong>Roots.</strong> The roots (zeros) are where <M>{`p(x) = 0`}</M> — where the graph
          crosses the x-axis. A degree-<M>{`n`}</M> polynomial has at most <M>{`n`}</M> real roots.
          Factoring exposes them: <M>{`x^2 - 3x + 2 = (x-1)(x-2)`}</M> has roots at <M>{`1`}</M> and{" "}
          <M>{`2`}</M>. The quadratic formula finishes the job when factoring fails.
        </li>
        <li>
          <strong>End behavior.</strong> As <M>{`|x| \\to \\infty`}</M> the leading term{" "}
          <M>{`a_n x^n`}</M> dominates everything else. Odd degree with <M>{`a_n > 0`}</M> falls on the
          left and rises on the right; even degree with <M>{`a_n > 0`}</M> rises on both ends like a
          valley.
        </li>
      </ul>
      <div className="notice">
        <span className="lbl">Turning points</span>
        A degree-<M>{`n`}</M> polynomial has at most <M>{`n-1`}</M> turning points (local peaks and
        valleys). A parabola (<M>{`n=2`}</M>) has one; a cubic has at most two. When we reach
        derivatives, "turning point" becomes "the slope is zero here."
      </div>
    </div>
  );
}

function ExpAndLog() {
  return (
    <div className="prose">
      <p>
        Polynomials grow by <em>adding</em> a fixed slope. Exponentials grow by <em>multiplying</em> by
        a fixed factor — a constant <strong>percentage</strong> per step. That single difference is why
        exponentials eventually crush every polynomial no matter how high its degree.
      </p>
      <MBlock>{`f(x) = a \\, b^x, \\qquad b > 0, \\; b \\neq 1`}</MBlock>
      <p>
        Each unit increase in <M>{`x`}</M> multiplies the output by <M>{`b`}</M>. With <M>{`b > 1`}</M>{" "}
        you get <strong>growth</strong>; with <M>{`0 < b < 1`}</M>, <strong>decay</strong>. The special
        base <M>{`e \\approx 2.71828`}</M> is the one for which the growth rate equals the current value
        — the reason <M>{`e^x`}</M> is its own derivative, a fact you will meet soon and never forget.
      </p>
      <p>
        The <strong>logarithm</strong> is the inverse question: "<M>{`b`}</M> to what power gives{" "}
        <M>{`y`}</M>?"
      </p>
      <MBlock>{`\\log_b(y) = x \\iff b^x = y`}</MBlock>
      <p>
        Because exponential and log are inverses, they undo each other:{" "}
        <M>{`\\log_b(b^x) = x`}</M> and <M>{`b^{\\log_b(y)} = y`}</M>. Graphically each is the other
        reflected across the line <M>{`y = x`}</M>. The multiply-structure of exponentials turns into
        the <strong>log rules</strong>, which convert products into sums:
      </p>
      <MBlock>{`\\log(xy) = \\log x + \\log y, \\quad \\log\\!\\frac{x}{y} = \\log x - \\log y, \\quad \\log(x^p) = p \\log x`}</MBlock>
      <div className="notice">
        <span className="lbl">Change of base</span>
        Any log can be rewritten with any base:{" "}
        <M>{`\\log_b(x) = \\dfrac{\\ln x}{\\ln b}`}</M>. So a calculator with only <M>{`\\ln`}</M>{" "}
        computes every logarithm.
      </div>
      <div className="notice warn">
        <span className="lbl">Common trap</span>
        <M>{`\\log(x + y)`}</M> does <strong>not</strong> simplify. The sum rule is for{" "}
        <M>{`\\log(xy)`}</M> — products, not sums. There is no rule for the log of a sum.
      </div>
    </div>
  );
}

function Trigonometry() {
  return (
    <div className="prose">
      <p>
        Trig functions are the language of <strong>rotation and repetition</strong> — anything that
        cycles: waves, orbits, oscillating springs, and the spin of a camera around a scene. The whole
        subject lives on the <strong>unit circle</strong>, the circle of radius 1 centered at the
        origin.
      </p>
      <p>
        Walk counterclockwise from <M>{`(1,0)`}</M> by an angle <M>{`\\theta`}</M>. The point you land
        on has coordinates that <em>define</em> cosine and sine:
      </p>
      <MBlock>{`(\\cos\\theta, \\; \\sin\\theta)`}</MBlock>
      <p>
        So <M>{`\\cos`}</M> is the horizontal coordinate, <M>{`\\sin`}</M> the vertical, and the
        Pythagorean identity is just "this point is on the circle":
      </p>
      <MBlock>{`\\sin^2\\theta + \\cos^2\\theta = 1`}</MBlock>

      <h3>Trigonometric Identities & Angle Sum Formulas</h3>
      <p>
        By analyzing rotations on the unit circle, we derive addition rules for combining angles:
      </p>
      <MBlock>{`\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta`}</MBlock>
      <MBlock>{`\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta`}</MBlock>
      <p>
        Setting <M>{`\\alpha = \\beta = \\theta`}</M> gives the <strong>double-angle formulas</strong>:
      </p>
      <MBlock>{`\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta`}</MBlock>
      <MBlock>{`\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta`}</MBlock>
      <p>
        These identities are used constantly in shader programming (e.g. to proceduralize waves or rotate coordinate frames inside a vertex shader) and physics simulations.
      </p>

      <p>
        We measure angles in <strong>radians</strong>, not degrees, because a radian is the angle that
        subtends an arc equal to the radius — a pure length ratio with no arbitrary unit. A full turn is{" "}
        <M>{`2\\pi`}</M> radians, so <M>{`180^\\circ = \\pi`}</M>. Radians are non-negotiable in
        calculus: only in radians does <M>{`\\frac{d}{dx}\\sin x = \\cos x`}</M> hold cleanly.
      </p>
      <p>
        The <strong>tangent</strong> is the slope of the radius line:{" "}
        <M>{`\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}`}</M>. It blows up wherever{" "}
        <M>{`\\cos\\theta = 0`}</M> (at <M>{`\\theta = \\tfrac{\\pi}{2}`}</M> and every <M>{`\\pi`}</M>{" "}
        after) — those are vertical asymptotes.
      </p>
      <p>
        Because you can walk around the circle forever, trig functions are{" "}
        <strong>periodic</strong>: <M>{`\\sin`}</M> and <M>{`\\cos`}</M> repeat every <M>{`2\\pi`}</M>,
        while <M>{`\\tan`}</M> repeats every <M>{`\\pi`}</M>. A general sinusoid packs four knobs:
      </p>
      <MBlock>{`y = A\\sin(B(x - C)) + D`}</MBlock>
      <p>
        <M>{`A`}</M> is amplitude (height), <M>{`\\tfrac{2\\pi}{B}`}</M> is the period, <M>{`C`}</M> is
        the horizontal phase shift, and <M>{`D`}</M> is the vertical midline.
      </p>
      <div className="notice">
        <span className="lbl">Memorize the anchors</span>
        <M>{`\\sin 0 = 0`}</M>, <M>{`\\sin\\tfrac{\\pi}{6} = \\tfrac12`}</M>,{" "}
        <M>{`\\sin\\tfrac{\\pi}{4} = \\tfrac{\\sqrt2}{2}`}</M>,{" "}
        <M>{`\\sin\\tfrac{\\pi}{3} = \\tfrac{\\sqrt3}{2}`}</M>, <M>{`\\sin\\tfrac{\\pi}{2} = 1`}</M>.
        Cosine is the same list read backwards. These five angles cover most of what you will ever
        evaluate by hand.
      </div>
    </div>
  );
}

function Transformations() {
  return (
    <div className="prose">
      <p>
        Once you know one graph, you know a whole family of them for free. Small edits to a formula
        move, stretch, or flip the graph in predictable ways. Learn the four moves and you never
        re-plot from scratch.
      </p>
      <ul>
        <li>
          <strong>Vertical shift:</strong> <M>{`f(x) + k`}</M> moves the graph up by <M>{`k`}</M>{" "}
          (down if negative). Intuitive — you add to every output.
        </li>
        <li>
          <strong>Horizontal shift:</strong> <M>{`f(x - h)`}</M> moves the graph <em>right</em> by{" "}
          <M>{`h`}</M>. The direction feels backwards, but the input must be <em>larger</em> by{" "}
          <M>{`h`}</M> to reproduce the same output, so the picture slides right.
        </li>
        <li>
          <strong>Scaling:</strong> <M>{`a\\,f(x)`}</M> stretches vertically by <M>{`a`}</M>;{" "}
          <M>{`f(cx)`}</M> compresses horizontally by <M>{`c`}</M> (again the inside acts inversely).
        </li>
        <li>
          <strong>Reflection:</strong> <M>{`-f(x)`}</M> flips across the x-axis;{" "}
          <M>{`f(-x)`}</M> flips across the y-axis.
        </li>
      </ul>
      <p>
        The deeper operation is <strong>composition</strong>: feeding one machine's output into
        another. Write it <M>{`(f \\circ g)(x) = f(g(x))`}</M> — apply <M>{`g`}</M> first, then{" "}
        <M>{`f`}</M>. Order matters: in general <M>{`f \\circ g \\neq g \\circ f`}</M>.
      </p>
      <p>
        With <M>{`f(x) = \\sqrt{x}`}</M> and <M>{`g(x) = x^2 + 1`}</M>, the composite{" "}
        <M>{`(f \\circ g)(x) = \\sqrt{x^2 + 1}`}</M>. The domain of a composite is restricted by both
        stages: <M>{`g`}</M> must be defined, and its output must be a legal input for <M>{`f`}</M>.
      </p>
      <div className="notice">
        <span className="lbl">Why this matters next</span>
        Composition is the setup for the <strong>chain rule</strong> — differentiating{" "}
        <M>{`f(g(x))`}</M>. Every "shift" and "scale" you internalize here becomes a factor that
        appears when you take the derivative later. Recognizing the outer and inner function now is the
        skill you will lean on constantly.
      </div>
    </div>
  );
}

export const mathFunctions: Module = {
  id: "math-functions",
  title: "Functions & Graphs",
  icon: "📊",
  track: "math",
  blurb:
    "The raw material of calculus: what a function really is, plus lines, polynomials, exponentials, logs, trig, and the transformations that reshape them.",
  dependsOn: [],
  lessons: [
    {
      id: "what-is-a-function",
      title: "What Is a Function?",
      minutes: 12,
      summary: "Domain, range, and the one-input-one-output rule.",
      Body: WhatIsAFunction,
      exercises: [
        {
          id: "domain",
          kind: "open",
          prompt:
            "State the natural domain of h(x) = 1 / (x² − 4) and explain in one sentence why the excluded values are excluded.",
          starter: "",
          rubric:
            "Full credit: domain is all real x except x = 2 and x = −2 (equivalently x ≠ ±2), because those make the denominator zero, and division by zero is undefined. Partial: identifies the excluded points OR the reason but not both.",
          hint: "Where does the denominator equal zero?",
        },
        {
          id: "func-p1",
          kind: "numeric",
          prompt: "For f(x) = x² − 3x + 2, evaluate f(0).",
          starter: "",
          hint: "Substitute x = 0 into every term.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — 0 − 0 + 2 = 2." }
              : { pass: false, message: "Not quite. Plug x = 0 in: only the constant term survives." },
        },
        {
          id: "func-p2",
          kind: "numeric",
          prompt: "For f(x) = x² − 3x + 2, evaluate f(5).",
          starter: "",
          hint: "Compute 25 − 15 + 2.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 12) < 0.01
              ? { pass: true, message: "Correct — 25 − 15 + 2 = 12." }
              : { pass: false, message: "Not quite. 5² = 25, then subtract 3·5 = 15 and add 2." },
        },
        {
          id: "func-p3",
          kind: "numeric",
          prompt:
            "The natural domain of g(x) = 1 / √(x − 2) is x > c. Enter the boundary value c.",
          starter: "",
          hint: "The inside of the root must be positive, and the root sits in a denominator.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — x − 2 > 0 forces x > 2, so c = 2." }
              : { pass: false, message: "Not quite. Set x − 2 > 0 (strictly, since it is under a root in a denominator)." },
        },
        {
          id: "func-p4",
          kind: "numeric",
          prompt: "For h(x) = 1 / (x² − 4), enter the largest x-value excluded from the domain.",
          starter: "",
          hint: "The denominator is zero at x = ±2.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — x² − 4 = 0 at x = ±2; the larger is 2." }
              : { pass: false, message: "Not quite. Solve x² − 4 = 0 and take the larger root." },
        },
        {
          id: "func-p5",
          kind: "numeric",
          prompt: "Find the root of the linear function f(x) = 2x − 7 (the x where f(x) = 0).",
          starter: "",
          hint: "Solve 2x − 7 = 0.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3.5) < 0.01
              ? { pass: true, message: "Correct — 2x = 7, so x = 3.5." }
              : { pass: false, message: "Not quite. Set 2x − 7 = 0 and solve for x." },
        },
      ],
      quiz: {
        questions: [
          {
            q: "Which of these is NOT a function of x?",
            choices: ["y = x²", "y = √x for x ≥ 0", "x² + y² = 1", "y = 3"],
            answer: 2,
            explain:
              "The circle assigns two y-values (±) to most x-values, failing the vertical line test. The others each give exactly one output per input.",
          },
          {
            q: "A function has a true inverse exactly when it is…",
            choices: ["Continuous", "Bijective (one-to-one and onto)", "A polynomial", "Increasing"],
            answer: 1,
            explain:
              "Only a bijection pairs inputs and outputs uniquely in both directions, so the mapping can be reversed unambiguously.",
          },
        ],
      },
    },
    {
      id: "linear-polynomial",
      title: "Linear & Polynomial Functions",
      minutes: 13,
      summary: "Slope, roots, degree, and end behavior.",
      Body: LinearAndPolynomial,
      exercises: [
        {
          id: "slope",
          kind: "numeric",
          prompt: "Find the slope of the line through (1, 2) and (4, 11).",
          starter: "",
          hint: "(y₂ − y₁) / (x₂ − x₁).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — (11 − 2)/(4 − 1) = 9/3 = 3." }
              : { pass: false, message: "Not quite. Compute rise over run: (11 − 2)/(4 − 1)." },
        },
        {
          id: "linear-polynomial-p1",
          kind: "numeric",
          prompt: "The line y = mx + b passes through (0, −5). Enter its y-intercept b.",
          starter: "",
          hint: "The y-intercept is the output at x = 0.",
          validate: (s) =>
            Math.abs(parseFloat(s) - -5) < 0.01
              ? { pass: true, message: "Correct — at x = 0 the point (0, −5) gives b = −5." }
              : { pass: false, message: "Not quite. The y-intercept is the y-value when x = 0." },
        },
        {
          id: "linear-polynomial-p2",
          kind: "numeric",
          prompt: "For the line through (2, 3) and (6, 3), enter its slope.",
          starter: "",
          hint: "Rise over run when the y-values are equal.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 0) < 0.01
              ? { pass: true, message: "Correct — (3 − 3)/(6 − 2) = 0; a horizontal line." }
              : { pass: false, message: "Not quite. The y-values are equal, so the rise is 0." },
        },
        {
          id: "linear-polynomial-p3",
          kind: "numeric",
          prompt: "The roots of x² − 3x + 2 are 1 and 2. Enter the larger root.",
          starter: "",
          hint: "It factors as (x − 1)(x − 2).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — (x − 1)(x − 2) = 0 gives roots 1 and 2; the larger is 2." }
              : { pass: false, message: "Not quite. Factor to (x − 1)(x − 2) and take the larger zero." },
        },
        {
          id: "linear-polynomial-p4",
          kind: "numeric",
          prompt: "Find the positive root of x² − 5x + 6 = 0 that is larger than the other.",
          starter: "",
          hint: "Factor: (x − 2)(x − 3).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — (x − 2)(x − 3) = 0 gives 2 and 3; the larger is 3." }
              : { pass: false, message: "Not quite. Factor to (x − 2)(x − 3) and pick the larger root." },
        },
        {
          id: "linear-polynomial-p5",
          kind: "numeric",
          prompt: "Evaluate the polynomial p(x) = 2x³ − x + 4 at x = 2.",
          starter: "",
          hint: "2·8 − 2 + 4.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 18) < 0.01
              ? { pass: true, message: "Correct — 2·8 − 2 + 4 = 16 − 2 + 4 = 18." }
              : { pass: false, message: "Not quite. 2³ = 8, so 2·8 = 16; then subtract 2 and add 4." },
        },
      ],
      quiz: {
        questions: [
          {
            q: "How many real roots can a degree-5 polynomial have at most?",
            choices: ["4", "5", "6", "Infinitely many"],
            answer: 1,
            explain:
              "A degree-n polynomial has at most n real roots; here n = 5. (It could have fewer if some roots are complex or repeated.)",
          },
          {
            q: "For large |x|, the behavior of a polynomial is governed by…",
            choices: ["The constant term", "The leading (highest-degree) term", "The number of terms", "The y-intercept"],
            answer: 1,
            explain:
              "As |x| → ∞ the highest-degree term dominates every lower term, so it sets the end behavior.",
          },
          {
            q: "The roots of x² − 3x + 2 are…",
            choices: ["0 and 3", "1 and 2", "−1 and −2", "2 and 3"],
            answer: 1,
            explain: "It factors as (x − 1)(x − 2), so it is zero at x = 1 and x = 2.",
          },
        ],
      },
    },
    {
      id: "exp-log",
      title: "Exponentials & Logarithms",
      minutes: 14,
      summary: "Multiplicative growth, the inverse relationship, and log rules.",
      Body: ExpAndLog,
      exercises: [
        {
          id: "log-eval",
          kind: "numeric",
          prompt: "Evaluate log₂(32).",
          starter: "",
          hint: "2 to what power gives 32?",
          validate: (s) =>
            Math.abs(parseFloat(s) - 5) < 0.01
              ? { pass: true, message: "Correct — 2⁵ = 32, so log₂(32) = 5." }
              : { pass: false, message: "Not quite. Ask: 2 raised to what power equals 32?" },
        },
        {
          id: "exp-log-p1",
          kind: "numeric",
          prompt: "Evaluate 2^5.",
          starter: "",
          hint: "Multiply 2 by itself five times.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 32) < 0.01
              ? { pass: true, message: "Correct — 2^5 = 32." }
              : { pass: false, message: "Not quite. 2·2·2·2·2 = 32." },
        },
        {
          id: "exp-log-p2",
          kind: "numeric",
          prompt: "Evaluate log₁₀(1000).",
          starter: "",
          hint: "10 to what power gives 1000?",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — 10³ = 1000, so log₁₀(1000) = 3." }
              : { pass: false, message: "Not quite. 10 raised to what power equals 1000?" },
        },
        {
          id: "exp-log-p3",
          kind: "numeric",
          prompt: "Evaluate ln(e²).",
          starter: "",
          hint: "ln and eˣ are inverses: ln(eˣ) = x.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — ln(e²) = 2 since ln and eˣ undo each other." }
              : { pass: false, message: "Not quite. ln(eˣ) = x, so ln(e²) = 2." },
        },
        {
          id: "exp-log-p4",
          kind: "numeric",
          prompt: "Using log rules, evaluate log₂(8) + log₂(4).",
          starter: "",
          hint: "log₂(8) = 3 and log₂(4) = 2; or combine as log₂(32).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 5) < 0.01
              ? { pass: true, message: "Correct — 3 + 2 = 5 (equivalently log₂(32) = 5)." }
              : { pass: false, message: "Not quite. log₂(8) = 3, log₂(4) = 2; add them." },
        },
        {
          id: "exp-log-p5",
          kind: "numeric",
          prompt: "Evaluate ln(e^5) − ln(e^2).",
          starter: "",
          hint: "Each ln(eᵏ) = k; subtract.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — 5 − 2 = 3." }
              : { pass: false, message: "Not quite. ln(e^5) = 5 and ln(e^2) = 2, so the difference is 3." },
        },
      ],
      quiz: {
        questions: [
          {
            q: "log(xy) equals…",
            choices: ["log x · log y", "log x + log y", "log x − log y", "(log x)(log y) / 2"],
            answer: 1,
            explain:
              "The product rule for logs turns multiplication into addition: log(xy) = log x + log y.",
          },
          {
            q: "Which statement about eˣ and ln x is correct?",
            choices: [
              "They are the same function",
              "They are inverses, reflected across y = x",
              "ln x grows faster than eˣ",
              "eˣ can be negative",
            ],
            answer: 1,
            explain:
              "ln is the inverse of eˣ; each is the reflection of the other across the line y = x, and eˣ is always positive.",
          },
        ],
      },
    },
    {
      id: "trigonometry",
      title: "Trigonometric Functions",
      minutes: 15,
      summary: "The unit circle, radians, sin/cos/tan, and periodicity.",
      Body: Trigonometry,
      exercises: [
        {
          id: "sin-eval",
          kind: "numeric",
          prompt: "Evaluate sin(π/6) as a decimal.",
          starter: "",
          hint: "One of the memorized anchor values.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 0.5) < 0.01
              ? { pass: true, message: "Correct — sin(π/6) = 1/2 = 0.5." }
              : { pass: false, message: "Not quite. π/6 is 30°, an anchor value; recall sin(π/6)." },
        },
        {
          id: "trigonometry-p1",
          kind: "numeric",
          prompt: "Evaluate cos(0).",
          starter: "",
          hint: "At angle 0 the unit-circle point is (1, 0).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 1) < 0.01
              ? { pass: true, message: "Correct — cos(0) = 1." }
              : { pass: false, message: "Not quite. At θ = 0 the x-coordinate on the unit circle is 1." },
        },
        {
          id: "trigonometry-p2",
          kind: "numeric",
          prompt: "Evaluate sin(π/2).",
          starter: "",
          hint: "π/2 is a quarter turn, the top of the unit circle.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 1) < 0.01
              ? { pass: true, message: "Correct — sin(π/2) = 1." }
              : { pass: false, message: "Not quite. At π/2 the point is (0, 1), so sine is 1." },
        },
        {
          id: "trigonometry-p3",
          kind: "numeric",
          prompt: "Evaluate tan(π/4).",
          starter: "",
          hint: "tan = sin/cos, and sin(π/4) = cos(π/4).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 1) < 0.01
              ? { pass: true, message: "Correct — sin(π/4) = cos(π/4), so tan(π/4) = 1." }
              : { pass: false, message: "Not quite. tan(π/4) = sin(π/4)/cos(π/4) = 1." },
        },
        {
          id: "trigonometry-p4",
          kind: "numeric",
          prompt: "Evaluate cos(π).",
          starter: "",
          hint: "π is a half turn to the point (−1, 0).",
          validate: (s) =>
            Math.abs(parseFloat(s) - -1) < 0.01
              ? { pass: true, message: "Correct — cos(π) = −1." }
              : { pass: false, message: "Not quite. At π the unit-circle point is (−1, 0)." },
        },
        {
          id: "trigonometry-p5",
          kind: "numeric",
          prompt: "Evaluate sin(π/3) as a decimal. Round to 2 decimals.",
          starter: "",
          hint: "sin(π/3) = √3/2.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 0.87) < 0.05
              ? { pass: true, message: "Correct — sin(π/3) = √3/2 ≈ 0.87." }
              : { pass: false, message: "Not quite. sin(π/3) = √3/2 ≈ 0.866." },
        },
      ],
      quiz: {
        questions: [
          {
            q: "On the unit circle, the point at angle θ has coordinates…",
            choices: ["(sin θ, cos θ)", "(cos θ, sin θ)", "(tan θ, 1)", "(θ, θ²)"],
            answer: 1,
            explain:
              "By definition the x-coordinate is cos θ and the y-coordinate is sin θ, which is why sin²θ + cos²θ = 1.",
          },
          {
            q: "The period of sin(x) is…",
            choices: ["π", "2π", "π/2", "1"],
            answer: 1,
            explain:
              "Walking a full turn around the circle takes 2π radians, after which sine repeats. (tan repeats every π.)",
          },
        ],
      },
    },
    {
      id: "transformations",
      title: "Transformations & Composition",
      minutes: 13,
      summary: "Shift, scale, reflect, and compose functions.",
      Body: Transformations,
      exercises: [
        {
          id: "compose",
          kind: "numeric",
          prompt: "With f(x) = 2x + 1 and g(x) = x², compute (f ∘ g)(3).",
          starter: "",
          hint: "Apply g first, then f: f(g(3)).",
          validate: (s) =>
            Math.abs(parseFloat(s) - 19) < 0.01
              ? { pass: true, message: "Correct — g(3) = 9, then f(9) = 2·9 + 1 = 19." }
              : { pass: false, message: "Not quite. First g(3) = 9, then feed that into f." },
        },
        {
          id: "transformations-p1",
          kind: "numeric",
          prompt: "With f(x) = x² and g(x) = x + 2, compute (f ∘ g)(1).",
          starter: "",
          hint: "Apply g first: g(1) = 3, then square.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 9) < 0.01
              ? { pass: true, message: "Correct — g(1) = 3, then f(3) = 9." }
              : { pass: false, message: "Not quite. g(1) = 3, then f(3) = 3² = 9." },
        },
        {
          id: "transformations-p2",
          kind: "numeric",
          prompt: "With f(x) = x² and g(x) = x + 2, compute (g ∘ f)(1).",
          starter: "",
          hint: "Apply f first: f(1) = 1, then add 2.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 3) < 0.01
              ? { pass: true, message: "Correct — f(1) = 1, then g(1) = 1 + 2 = 3." }
              : { pass: false, message: "Not quite. f(1) = 1, then g(1) = 3. Order matters!" },
        },
        {
          id: "transformations-p3",
          kind: "numeric",
          prompt:
            "The graph of f(x) = x² is shifted to give g(x) = (x − 4)². Enter how many units it moved to the right.",
          starter: "",
          hint: "f(x − h) shifts right by h.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 4) < 0.01
              ? { pass: true, message: "Correct — subtracting 4 inside shifts the graph right by 4." }
              : { pass: false, message: "Not quite. f(x − h) moves the graph right by h; here h = 4." },
        },
        {
          id: "transformations-p4",
          kind: "numeric",
          prompt:
            "With f(x) = √x and g(x) = x² + 1, compute (f ∘ g)(2). Round to 2 decimals.",
          starter: "",
          hint: "g(2) = 5, then take √5.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2.24) < 0.05
              ? { pass: true, message: "Correct — g(2) = 5, then √5 ≈ 2.24." }
              : { pass: false, message: "Not quite. g(2) = 2² + 1 = 5, then √5 ≈ 2.236." },
        },
        {
          id: "transformations-p5",
          kind: "numeric",
          prompt: "With f(x) = 3x − 1 and g(x) = 2x, compute (f ∘ g)(4).",
          starter: "",
          hint: "g(4) = 8, then apply f.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 23) < 0.01
              ? { pass: true, message: "Correct — g(4) = 8, then f(8) = 3·8 − 1 = 23." }
              : { pass: false, message: "Not quite. g(4) = 8, then f(8) = 24 − 1 = 23." },
        },
      ],
      quiz: {
        questions: [
          {
            q: "The graph of f(x − 3) is f(x) shifted…",
            choices: ["Left by 3", "Right by 3", "Up by 3", "Down by 3"],
            answer: 1,
            explain:
              "Subtracting inside the argument shifts the graph right by 3 — the input must be larger to reproduce the same output.",
          },
          {
            q: "(f ∘ g)(x) means…",
            choices: ["f(x) · g(x)", "g(f(x))", "f(g(x))", "f(x) + g(x)"],
            answer: 2,
            explain:
              "Composition applies the inner function g first, then feeds its output into the outer function f.",
          },
        ],
      },
    },
  ],
};
