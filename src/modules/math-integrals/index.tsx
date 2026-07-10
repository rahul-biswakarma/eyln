import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code } from "../../components/CodeBlock";

function Accumulation() {
  return (
    <div className="prose">
      <p>
        The derivative asked: <em>how fast is this changing right now?</em> The integral asks the
        mirror-image question: <em>if I know the rate of change, how much has accumulated?</em> If a
        derivative tears a quantity apart into its instantaneous slope, the integral glues those
        slopes back into a total.
      </p>
      <p>
        The cleanest picture is <strong>area under a curve</strong>. Given a function{" "}
        <M>{`f(x)`}</M> over an interval <M>{`[a, b]`}</M>, we want the signed area trapped between
        the curve and the <M>{`x`}</M>-axis. "Signed" because area below the axis counts as
        negative.
      </p>
      <p>
        We approximate that area with rectangles — a <strong>Riemann sum</strong>. Chop{" "}
        <M>{`[a, b]`}</M> into <M>{`n`}</M> slices of width <M>{`\\Delta x = (b - a)/n`}</M>, sample
        the height <M>{`f(x_i)`}</M> in each slice, and add up the little rectangles:
      </p>
      <MBlock>{`S_n = \\sum_{i=1}^{n} f(x_i)\\, \\Delta x`}</MBlock>
      <p>
        As the slices get thinner (<M>{`n \\to \\infty`}</M>), the staircase of rectangles hugs the
        curve ever more tightly. The limit — if it exists — is the <strong>definite integral</strong>:
      </p>
      <MBlock>{`\\int_a^b f(x)\\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\, \\Delta x`}</MBlock>
      <div className="notice">
        <span className="lbl">Read the symbols</span> The <M>{`\\int`}</M> is a stretched "S" for
        "sum". The <M>{`dx`}</M> is the width of an infinitely thin slice. The whole expression is a
        sum of infinitely many infinitely thin rectangles — the sum <em>became</em> an integral.
      </div>
      <p>
        Accumulation shows up everywhere: distance is the integral of speed, work is the integral of
        force over distance, charge is the integral of current over time. Whenever you know a rate and
        want a total, you integrate.
      </p>
      <div className="notice warn">
        <span className="lbl">Signed area</span> If <M>{`f`}</M> dips below the axis, those slices
        contribute negative area. So <M>{`\\int_0^{2\\pi} \\sin x\\, dx = 0`}</M>: the hump above and
        the trough below cancel exactly.
      </div>
    </div>
  );
}

function FTC() {
  return (
    <div className="prose">
      <p>
        Computing Riemann sums by hand is miserable. The <strong>Fundamental Theorem of Calculus</strong>{" "}
        (FTC) is the miracle that rescues us: it says integration and differentiation are inverse
        operations. The area problem and the slope problem are two views of the same thing.
      </p>
      <p>
        <strong>Part 1</strong> — define the accumulation function <M>{`F(x) = \\int_a^x f(t)\\, dt`}</M>,
        the running area from <M>{`a`}</M> up to a moving right edge <M>{`x`}</M>. Then its
        derivative is just the integrand:
      </p>
      <MBlock>{`\\frac{d}{dx} \\int_a^x f(t)\\, dt = f(x)`}</MBlock>
      <p>
        Intuitively: nudge the right edge by <M>{`dx`}</M>, and the area grows by a thin sliver of
        height <M>{`f(x)`}</M> and width <M>{`dx`}</M>. So the rate of area growth <em>is</em> the
        height. Accumulating and then differentiating gets you back where you started.
      </p>
      <p>
        <strong>Part 2</strong> — this is the one you compute with. If <M>{`F`}</M> is <em>any</em>{" "}
        antiderivative of <M>{`f`}</M> (meaning <M>{`F' = f`}</M>), then
      </p>
      <MBlock>{`\\int_a^b f(x)\\, dx = F(b) - F(a)`}</MBlock>
      <p>
        No sums, no limits. Find a function whose derivative is <M>{`f`}</M>, evaluate it at the two
        endpoints, subtract. The area is the <em>net change</em> in the antiderivative.
      </p>
      <div className="notice">
        <span className="lbl">Example</span> To integrate <M>{`x^2`}</M> from 0 to 3: an
        antiderivative is <M>{`\\tfrac{1}{3}x^3`}</M>, so the area is{" "}
        <M>{`\\tfrac{1}{3}(27) - \\tfrac{1}{3}(0) = 9`}</M>.
      </div>
      <p>The workhorse antiderivative — the reverse power rule — is:</p>
      <MBlock>{`\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)`}</MBlock>
      <p>
        That <M>{`+C`}</M> is the <strong>constant of integration</strong>: differentiating kills
        constants, so an <em>indefinite</em> integral recovers a whole family of curves differing by
        a vertical shift. In a definite integral the <M>{`C`}</M> cancels in <M>{`F(b) - F(a)`}</M>,
        which is why Part 2 works for any antiderivative you pick.
      </p>
    </div>
  );
}

function Techniques() {
  return (
    <div className="prose">
      <p>
        Antiderivatives are harder to find than derivatives — there is no mechanical recipe that
        always works. Two techniques cover most cases, and both are just the big differentiation
        rules run backwards.
      </p>
      <p>
        <strong>Substitution</strong> reverses the chain rule. If the integrand contains an inner
        function and (a multiple of) its derivative, rename the inner part <M>{`u`}</M>:
      </p>
      <MBlock>{`\\int f(g(x))\\, g'(x)\\, dx = \\int f(u)\\, du, \\qquad u = g(x)`}</MBlock>
      <p>
        The trick is spotting that <M>{`g'(x)\\,dx`}</M> already sits in the integral, waiting to
        become <M>{`du`}</M>. For example <M>{`\\int 2x\\cos(x^2)\\, dx`}</M>: let <M>{`u = x^2`}</M>,
        so <M>{`du = 2x\\, dx`}</M>, and it collapses to <M>{`\\int \\cos u\\, du = \\sin(x^2) + C`}</M>.
      </p>
      <p>
        <strong>Integration by parts</strong> reverses the product rule. From{" "}
        <M>{`(uv)' = u'v + uv'`}</M>, rearrange and integrate:
      </p>
      <MBlock>{`\\int u\\, dv = uv - \\int v\\, du`}</MBlock>
      <p>
        You trade one integral for another, hoping the new one is easier. The classic is{" "}
        <M>{`\\int x\\, e^x\\, dx`}</M>: pick <M>{`u = x`}</M> (so <M>{`du = dx`}</M>) and{" "}
        <M>{`dv = e^x dx`}</M> (so <M>{`v = e^x`}</M>), giving{" "}
        <M>{`x e^x - \\int e^x\\, dx = x e^x - e^x + C`}</M>.
      </p>
      <div className="notice">
        <span className="lbl">Choosing u</span> A handy mnemonic for by-parts is <strong>LIATE</strong>:
        prefer <M>{`u`}</M> to be the Logarithmic, then Inverse-trig, Algebraic, Trig, then
        Exponential factor — whichever comes first makes a simpler <M>{`du`}</M>.
      </div>
      <div className="notice warn">
        <span className="lbl">Not everything integrates</span> Some functions, like{" "}
        <M>{`e^{-x^2}`}</M>, have no antiderivative in elementary terms. That is exactly why the next
        lesson on numerical integration exists.
      </div>
    </div>
  );
}

function Applications() {
  return (
    <div className="prose">
      <p>
        Once you can evaluate definite integrals, a whole catalogue of geometric and physical
        quantities open up. They all follow the same ritual: slice the thing into infinitesimal
        pieces, write the size of one piece, and integrate.
      </p>
      <p>
        <strong>Area between two curves.</strong> If <M>{`f(x) \\ge g(x)`}</M> on <M>{`[a, b]`}</M>,
        each thin vertical strip has height <M>{`f(x) - g(x)`}</M> and width <M>{`dx`}</M>. Add them
        up:
      </p>
      <MBlock>{`A = \\int_a^b \\big( f(x) - g(x) \\big)\\, dx`}</MBlock>
      <p>
        Always subtract "top minus bottom". If the curves cross, split the interval at the crossings
        so the taller function stays on top in each piece.
      </p>
      <p>
        <strong>Average value.</strong> The mean height of <M>{`f`}</M> over an interval is its total
        area divided by the interval's width — a continuous version of "add up the values and divide
        by how many":
      </p>
      <MBlock>{`\\bar{f} = \\frac{1}{b - a} \\int_a^b f(x)\\, dx`}</MBlock>
      <p>
        Geometrically, <M>{`\\bar f`}</M> is the height of a rectangle over <M>{`[a,b]`}</M> with the
        same area as the region under <M>{`f`}</M>. This is how you get the average temperature over a
        day, or the RMS value of a signal.
      </p>
      <div className="notice">
        <span className="lbl">Solids of revolution</span> Spin a curve around an axis and each slice
        becomes a disk of radius <M>{`f(x)`}</M> and thickness <M>{`dx`}</M>. Its volume is{" "}
        <M>{`\\pi f(x)^2\\, dx`}</M>, so the whole solid is{" "}
        <M>{`V = \\pi \\int_a^b f(x)^2\\, dx`}</M>. Same ritual — slice, size, sum.
      </div>
    </div>
  );
}

function Numerical() {
  return (
    <div className="prose">
      <p>
        When no antiderivative exists — or the function only lives as an array of samples — you fall
        back to the Riemann idea, but with smarter slices. This is <strong>numerical integration</strong>{" "}
        (quadrature), and it is bread-and-butter for physics engines, renderers, and simulation.
      </p>
      <p>
        <strong>The trapezoid rule</strong> replaces each rectangle with a trapezoid: connect
        adjacent samples with a straight line instead of a flat step. Over <M>{`n`}</M> equal
        slices of width <M>{`h`}</M>:
      </p>
      <MBlock>{`\\int_a^b f\\, dx \\approx h \\left( \\tfrac{1}{2}f_0 + f_1 + \\cdots + f_{n-1} + \\tfrac{1}{2}f_n \\right)`}</MBlock>
      <p>
        The endpoints get half weight because each interior sample is shared by two trapezoids. The
        error shrinks like <M>{`h^2`}</M> — halve the step, quarter the error.
      </p>
      <p>
        <strong>Simpson's rule</strong> does better by fitting parabolas through triples of points
        instead of straight lines. It needs an even number of slices and weights samples in the
        pattern <M>{`1, 4, 2, 4, 2, \\ldots, 4, 1`}</M>:
      </p>
      <MBlock>{`\\int_a^b f\\, dx \\approx \\frac{h}{3}\\left( f_0 + 4f_1 + 2f_2 + \\cdots + 4f_{n-1} + f_n \\right)`}</MBlock>
      <p>
        Its error falls like <M>{`h^4`}</M> — dramatically faster — and it integrates cubics exactly
        for free. Here are both in TypeScript:
      </p>
      <Code
        lang="ts"
        code={`// Numerical integration of f over [a, b] with n slices.
function trapezoid(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let sum = 0.5 * (f(a) + f(b));
  for (let i = 1; i < n; i++) sum += f(a + i * h);
  return sum * h;
}

function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  if (n % 2 !== 0) n++; // Simpson needs an even count
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  return (sum * h) / 3;
}

// Both approximate ∫₀¹ x² dx = 1/3 ≈ 0.3333
console.log(trapezoid((x) => x * x, 0, 1, 100));
console.log(simpson((x) => x * x, 0, 1, 100));`}
      />
      <div className="notice">
        <span className="lbl">Where you meet this</span> Monte Carlo integration in a path tracer,
        Verlet stepping in a physics loop, and ODE solvers like Runge–Kutta are all quadrature in
        disguise — accumulating a rate over tiny steps, exactly like a Riemann sum.
      </div>
    </div>
  );
}

export const mathIntegrals: Module = {
  id: "math-integrals",
  title: "Integrals",
  icon: "∫",
  track: "math",
  blurb:
    "Area and accumulation, the Fundamental Theorem, substitution and by-parts, applications, and numerical quadrature.",
  dependsOn: ["math-derivatives"],
  lessons: [
    {
      id: "accumulation",
      title: "The Integral as Area & Accumulation",
      minutes: 14,
      summary: "Riemann sums shrink into the definite integral — a sum of infinitely thin slices.",
      Body: Accumulation,
      quiz: {
        questions: [
          {
            q: "As the number of rectangles n in a Riemann sum grows without bound, the sum approaches…",
            choices: ["Zero", "The slope of f", "The exact signed area under f", "The maximum of f"],
            answer: 2,
            explain: "Thinner slices hug the curve; the limit of the Riemann sum is the definite integral, the signed area.",
          },
          {
            q: "What is ∫ from 0 to 2π of sin(x) dx?",
            choices: ["2π", "1", "0", "π"],
            answer: 2,
            explain: "The area above the axis on (0, π) exactly cancels the negative area below on (π, 2π).",
          },
        ],
      },
      exercises: [
        {
          id: "riemann-area",
          kind: "numeric",
          prompt: "Using the antiderivative x³/3, compute ∫ from 0 to 2 of x² dx.",
          starter: "",
          hint: "Evaluate (2³)/3 - (0³)/3.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 8 / 3) < 0.01
              ? { pass: true, message: "Correct — 8/3 ≈ 2.667." }
              : { pass: false, message: "Compute (2³)/3 = 8/3 ≈ 2.667." },
        },
      ],
    },
    {
      id: "ftc",
      title: "The Fundamental Theorem of Calculus",
      minutes: 13,
      summary: "Differentiation and integration are inverses: F(b) − F(a) gives the area.",
      Body: FTC,
      quiz: {
        questions: [
          {
            q: "FTC Part 2 says the definite integral of f equals…",
            choices: ["F(a) − F(b)", "F(b) − F(a) for any antiderivative F", "f(b) − f(a)", "The average of f"],
            answer: 1,
            explain: "Evaluate any antiderivative at the endpoints and subtract; the constant C cancels.",
          },
          {
            q: "Why does the '+C' constant of integration disappear in a definite integral?",
            choices: ["It is rounded away", "It cancels in F(b) − F(a)", "Definite integrals have no C", "It becomes zero at infinity"],
            answer: 1,
            explain: "Both endpoints carry the same +C, so it subtracts to zero.",
          },
        ],
      },
      exercises: [
        {
          id: "ftc-eval",
          kind: "numeric",
          prompt: "Compute ∫ from 1 to 3 of 2x dx using the antiderivative x².",
          starter: "",
          hint: "3² − 1².",
          validate: (s) =>
            Math.abs(parseFloat(s) - 8) < 0.01
              ? { pass: true, message: "Correct — 9 − 1 = 8." }
              : { pass: false, message: "Evaluate x² at the endpoints: 3² − 1² = 8." },
        },
      ],
    },
    {
      id: "techniques",
      title: "Techniques: Substitution & By Parts",
      minutes: 15,
      summary: "Reverse the chain rule (u-substitution) and the product rule (integration by parts).",
      Body: Techniques,
      quiz: {
        questions: [
          {
            q: "u-substitution is the reverse of which differentiation rule?",
            choices: ["Product rule", "Quotient rule", "Chain rule", "Power rule"],
            answer: 2,
            explain: "Substitution undoes the chain rule by renaming the inner function u = g(x).",
          },
          {
            q: "Integration by parts is written as…",
            choices: ["∫u dv = uv − ∫v du", "∫u dv = uv + ∫v du", "∫u dv = u/v − ∫v du", "∫u dv = ∫u ∫v"],
            answer: 0,
            explain: "It comes from rearranging (uv)' = u'v + uv' and integrating both sides.",
          },
        ],
      },
      exercises: [
        {
          id: "sub-open",
          kind: "open",
          prompt: "Evaluate ∫ 2x·cos(x²) dx by substitution. Show your choice of u and the final answer.",
          starter: "Let u = ",
          rubric:
            "Full credit if the learner sets u = x², computes du = 2x dx, rewrites the integral as ∫cos(u) du, and arrives at sin(x²) + C. Partial credit for the correct substitution but a missing +C or arithmetic slip.",
          hint: "The derivative of x² is sitting right there in front.",
        },
      ],
    },
    {
      id: "applications",
      title: "Definite Integrals & Applications",
      minutes: 13,
      summary: "Area between curves, average value, and volumes — slice, size, sum.",
      Body: Applications,
      quiz: {
        questions: [
          {
            q: "The area between f (on top) and g (on bottom) over [a, b] is…",
            choices: ["∫(f + g) dx", "∫(f − g) dx", "∫f dx · ∫g dx", "∫|f| dx"],
            answer: 1,
            explain: "Each vertical strip has height (top − bottom) = f − g; integrate that difference.",
          },
          {
            q: "The average value of f over [a, b] is…",
            choices: ["∫f dx", "(f(b) − f(a))/(b − a)", "(1/(b − a)) ∫f dx", "f((a+b)/2)"],
            answer: 2,
            explain: "Total area divided by the interval width — the continuous mean.",
          },
        ],
      },
      exercises: [
        {
          id: "avg-value",
          kind: "numeric",
          prompt: "Find the average value of f(x) = x over [0, 4]. (∫₀⁴ x dx = 8.)",
          starter: "",
          hint: "Divide the integral 8 by the width 4.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 2) < 0.01
              ? { pass: true, message: "Correct — 8/4 = 2, the midpoint height of a line." }
              : { pass: false, message: "Average = (1/(b−a))·∫ = 8/4 = 2." },
        },
      ],
    },
    {
      id: "numerical",
      title: "Numerical Integration",
      minutes: 14,
      summary: "Trapezoid and Simpson rules for when no antiderivative exists — with code.",
      Body: Numerical,
      quiz: {
        questions: [
          {
            q: "The trapezoid rule improves on rectangles by…",
            choices: ["Using random samples", "Connecting samples with straight lines", "Fitting parabolas", "Ignoring the endpoints"],
            answer: 1,
            explain: "It replaces flat-topped rectangles with sloped trapezoids between adjacent samples.",
          },
          {
            q: "Compared to the trapezoid rule, Simpson's rule converges…",
            choices: ["Slower (error ~ h)", "At the same rate", "Faster, fitting parabolas (error ~ h⁴)", "Only for linear functions"],
            answer: 2,
            explain: "Simpson fits parabolas through point triples, giving O(h⁴) error versus O(h²).",
          },
          {
            q: "Why do we ever need numerical integration at all?",
            choices: ["Computers cannot subtract", "Some functions have no elementary antiderivative", "The FTC is only approximate", "Integrals are always undefined"],
            answer: 1,
            explain: "Functions like e^(−x²) have no closed-form antiderivative, so we approximate the area directly.",
          },
        ],
      },
      exercises: [
        {
          id: "trap-numeric",
          kind: "numeric",
          prompt: "Approximate ∫₀¹ x² dx with ONE trapezoid (endpoints only): 0.5·(f(0) + f(1))·1.",
          starter: "",
          hint: "f(0) = 0, f(1) = 1; average them times the width 1.",
          validate: (s) =>
            Math.abs(parseFloat(s) - 0.5) < 0.01
              ? { pass: true, message: "Correct — 0.5·(0 + 1) = 0.5. (The true value is 1/3; one trapezoid overshoots.)" }
              : { pass: false, message: "Trapezoid = 0.5·(f(0) + f(1)) = 0.5·(0 + 1) = 0.5." },
        },
      ],
    },
  ],
};
