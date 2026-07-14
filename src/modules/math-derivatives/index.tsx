import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code } from "../../components/code-block";
import { Notice } from "../../components/ui";
function DerivativeAsLimit() {
    return (<div className="prose">
      <p>
        The derivative measures <strong>instantaneous rate of change</strong> — how fast the output
        moves as the input nudges. Geometrically it is the <strong>slope of the tangent line</strong>,
        the straight line that best hugs the curve at a single point.
      </p>
      <p>
        We can't compute a slope from one point, so we start with two. Pick <M>{`x`}</M> and a nearby
        point <M>{`x + h`}</M>. The line through them — the <strong>secant</strong> — has slope
      </p>
      <MBlock>{`\\frac{f(x+h) - f(x)}{h}`}</MBlock>
      <p>
        This <strong>difference quotient</strong> is average rate of change over a step of size{" "}
        <M>{`h`}</M>. Now shrink the step: as <M>{`h \\to 0`}</M> the second point slides toward the
        first, and the secant pivots into the tangent. The limit — if it exists — is the derivative:
      </p>
      <MBlock>{`f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}`}</MBlock>

      <h3>Step-by-Step Derivation of <M>{`\\frac{d}{dx} x^3`}</M></h3>
      <p>
        Let's derive the derivative of <M>{`f(x) = x^3`}</M> directly from this limit definition. 
        Using the binomial expansion:
      </p>
      <MBlock>{`(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3`}</MBlock>
      <p>
        Plug this into the difference quotient:
      </p>
      <MBlock>{`f'(x) = \\lim_{h \\to 0} \\frac{(x^3 + 3x^2h + 3xh^2 + h^3) - x^3}{h}`}</MBlock>
      <MBlock>{`= \\lim_{h \\to 0} \\frac{3x^2h + 3xh^2 + h^3}{h}`}</MBlock>
      <MBlock>{`= \\lim_{h \\to 0} (3x^2 + 3xh + h^2)`}</MBlock>
      <p>
        Evaluating the limit by substituting <M>{`h = 0`}</M> yields:
      </p>
      <MBlock>{`f'(x) = 3x^2`}</MBlock>
      <p>
        This confirms the power rule result algebraically without shortcuts.
      </p>

      <p>
        The <M>{`h`}</M> in the denominator is why limits had to come first: at <M>{`h = 0`}</M> the
        quotient is the indeterminate <M>{`\\tfrac00`}</M>, but the limit slips past that and lands on a
        clean answer. Notation varies — <M>{`f'(x)`}</M>, <M>{`\\tfrac{dy}{dx}`}</M>, and{" "}
        <M>{`\\tfrac{d}{dx}f`}</M> all mean the same thing.
      </p>
      <Notice>
        <span className="lbl">Differentiable ⟹ continuous</span>
        If the tangent slope exists, the curve can't jump or break there — differentiability implies
        continuity. The converse fails: <M>{`|x|`}</M> is continuous at <M>{`0`}</M> but has a corner,
        so no single tangent slope exists. Smoothness is stronger than mere connectedness.
      </Notice>
      <Code lang="ts" code={`// Numerically approach the derivative of x² at x = 3 (true answer: 6).
const f = (x: number) => x * x;
const slope = (x: number, h: number) => (f(x + h) - f(x)) / h;
slope(3, 0.1);    // 6.1
slope(3, 0.01);   // 6.01
slope(3, 0.001);  // 6.001  -> homing in on 6`}/>
    </div>);
}
function Rules() {
    return (<div className="prose">
      <p>
        Computing every derivative from the limit definition would be exhausting. Instead we prove a
        handful of <strong>rules</strong> once and then compose them. These four cover almost
        everything.
      </p>
      <p>
        <strong>Power rule</strong> — the workhorse. Bring the exponent down, subtract one:
      </p>
      <MBlock>{`\\frac{d}{dx} x^n = n x^{n-1}`}</MBlock>
      <p>
        It holds for every real <M>{`n`}</M> — negative, fractional, all of it. Combined with the fact
        that differentiation is <strong>linear</strong> (<M>{`(af + bg)' = af' + bg'`}</M>), you can
        differentiate any polynomial on sight.
      </p>
      <p>
        <strong>Product rule</strong> — the derivative of a product is <em>not</em> the product of
        derivatives:
      </p>
      <MBlock>{`(fg)' = f'g + fg'`}</MBlock>
      <p>
        <strong>Quotient rule</strong> — "low d-high minus high d-low, over low squared":
      </p>
      <MBlock>{`\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}`}</MBlock>
      <p>
        <strong>Chain rule</strong> — the deepest and most used. For a composition{" "}
        <M>{`f(g(x))`}</M>, differentiate the outer function at the inner, then multiply by the
        derivative of the inner:
      </p>
      <MBlock>{`\\frac{d}{dx} f(g(x)) = f'(g(x)) \\cdot g'(x)`}</MBlock>

      <h3>Leibniz Chain Rule Formulation</h3>
      <p>
        In Leibniz notation, the chain rule is expressed as:
      </p>
      <MBlock>{`\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}`}</MBlock>
      <p>
        where <M>{`u = g(x)`}</M> is the intermediate variable. 
        This formulation makes it clear why it is called the "chain" rule: you chain the rates of change together. 
        If <M>{`y`}</M> changes 3 times faster than <M>{`u`}</M>, and <M>{`u`}</M> changes 2 times faster than <M>{`x`}</M>, then <M>{`y`}</M> changes <M>{`3 \\times 2 = 6`}</M> times faster than <M>{`x`}</M>.
      </p>

      <p>
        This is why the composition drills from the Functions module pay off: recognizing the outer and
        inner layers is exactly what the chain rule consumes. For{" "}
        <M>{`(3x^2 + 1)^5`}</M>, the outer is <M>{`(\\cdot)^5`}</M> and the inner is{" "}
        <M>{`3x^2 + 1`}</M>, so the derivative is <M>{`5(3x^2+1)^4 \\cdot 6x`}</M>.
      </p>
      <Notice warn>
        <span className="lbl">The classic mistake</span>
        <M>{`(fg)' \\neq f' g'`}</M>. Test it: <M>{`\\tfrac{d}{dx}(x \\cdot x) = 2x`}</M>, but{" "}
        <M>{`(1)(1) = 1`}</M>. The product rule's cross terms are not optional.
      </Notice>
    </div>);
}
function TranscendentalDerivatives() {
    return (<div className="prose">
      <p>
        Polynomials are only half the world. The other half — waves, growth, decay — runs on trig,
        exponential, and log functions, and each has a derivative worth memorizing.
      </p>
      <p>
        <strong>Trigonometric.</strong> The two anchors, provable straight from the definition using{" "}
        <M>{`\\lim_{x\\to0}\\tfrac{\\sin x}{x} = 1`}</M> from the Limits module:
      </p>
      <MBlock>{`\\frac{d}{dx}\\sin x = \\cos x, \\qquad \\frac{d}{dx}\\cos x = -\\sin x`}</MBlock>
      <p>
        Note the minus sign on cosine — sine and cosine chase each other in a four-step cycle that
        returns to the start after four derivatives. From these and the quotient rule,{" "}
        <M>{`\\tfrac{d}{dx}\\tan x = \\sec^2 x`}</M>.
      </p>
      <p>
        <strong>Exponential.</strong> The base <M>{`e`}</M> is defined precisely so that
      </p>
      <MBlock>{`\\frac{d}{dx} e^x = e^x`}</MBlock>
      <p>
        The function that is its own rate of change — the fingerprint of every process that grows in
        proportion to its current size. For a general base, <M>{`\\tfrac{d}{dx} b^x = b^x \\ln b`}</M>.
      </p>
      <p>
        <strong>Logarithm.</strong> As the inverse of <M>{`e^x`}</M>, the natural log has a
        strikingly simple derivative:
      </p>
      <MBlock>{`\\frac{d}{dx} \\ln x = \\frac{1}{x}, \\quad x > 0`}</MBlock>
      <p>
        Combine any of these with the chain rule for the versions you'll actually use in the wild:{" "}
        <M>{`\\tfrac{d}{dx}\\sin(kx) = k\\cos(kx)`}</M>, <M>{`\\tfrac{d}{dx} e^{kx} = k e^{kx}`}</M>. That
        stray factor <M>{`k`}</M> is the chain rule earning its keep.
      </p>
      <Notice>
        <span className="lbl">Engine relevance</span>
        Smooth camera moves, spring physics, and eased animation all lean on these. A critically-damped
        follow camera is literally an exponential decay <M>{`e^{-kt}`}</M> toward its target, and its
        velocity is the derivative <M>{`-k e^{-kt}`}</M>. This module is a prerequisite for the 3D
        engine track for exactly this reason.
      </Notice>
    </div>);
}
function HigherDerivativesConcavity() {
    return (<div className="prose">
      <p>
        The derivative of a function is itself a function, so you can differentiate <em>again</em>. The{" "}
        <strong>second derivative</strong> <M>{`f''(x)`}</M> is the rate of change of the rate of
        change. In motion terms: if <M>{`f`}</M> is position, <M>{`f'`}</M> is velocity and{" "}
        <M>{`f''`}</M> is acceleration.
      </p>
      <MBlock>{`f''(x) = \\frac{d}{dx}\\big(f'(x)\\big) = \\frac{d^2 y}{dx^2}`}</MBlock>
      <p>
        Geometrically, the second derivative reports <strong>concavity</strong> — which way the curve
        bends:
      </p>
      <ul>
        <li>
          <M>{`f''(x) > 0`}</M>: <strong>concave up</strong>, curving like a cup <M>{`\\cup`}</M>. The
          slope is increasing.
        </li>
        <li>
          <M>{`f''(x) < 0`}</M>: <strong>concave down</strong>, curving like a cap <M>{`\\cap`}</M>. The
          slope is decreasing.
        </li>
        <li>
          <M>{`f''(x) = 0`}</M> with a sign change: an <strong>inflection point</strong>, where
          concavity flips.
        </li>
      </ul>
      <p>
        For <M>{`f(x) = x^3`}</M>: <M>{`f'(x) = 3x^2`}</M> and <M>{`f''(x) = 6x`}</M>. The second
        derivative is negative for <M>{`x < 0`}</M> (concave down), positive for <M>{`x > 0`}</M>{" "}
        (concave up), and the switch at <M>{`x = 0`}</M> is the inflection point.
      </p>
      <p>
        Concavity powers the <strong>second-derivative test</strong> for classifying critical points,
        which we use in the next lesson: at a point where the slope is zero, concave up means a
        <em> valley</em> (local min) and concave down means a <em>peak</em> (local max).
      </p>
      <Notice>
        <span className="lbl">Higher still</span>
        You can keep going: <M>{`f'''`}</M>, <M>{`f^{(4)}`}</M>, and so on. These power the Taylor
        series that lets a machine approximate <M>{`\\sin`}</M>, <M>{`e^x`}</M>, and friends from
        polynomials alone — the numerical bedrock under every graphics library.
      </Notice>
    </div>);
}
function OptimizationRelatedRates() {
    return (<div className="prose">
      <p>
        Here is the derivative's most famous payoff: finding the <strong>largest or smallest</strong>{" "}
        value a quantity can take. Peaks and valleys of a smooth curve have one thing in common — the
        tangent is horizontal there, so the slope is zero.
      </p>
      <p>
        A <strong>critical point</strong> is an input where <M>{`f'(x) = 0`}</M> (or where{" "}
        <M>{`f'`}</M> doesn't exist). Every local maximum or minimum of a differentiable function hides
        at a critical point — so the recipe is: <strong>differentiate, set to zero, solve</strong>,
        then classify each candidate.
      </p>
      <MBlock>{`f'(x) = 0 \\;\\Longrightarrow\\; \\text{candidate extremum}`}</MBlock>
      <p>
        Classify with the second-derivative test: <M>{`f''(x) > 0`}</M> means a local minimum (concave
        up),
        <M>{` f''(x) < 0`}</M> a local maximum (concave down). For a <strong>global</strong> extremum on
        a closed interval, also check the endpoints — the maximum could sit at a boundary rather than an
        interior critical point.
      </p>
      <p>
        <strong>Worked example.</strong> Of all rectangles with perimeter <M>{`40`}</M>, which has the
        greatest area? With sides <M>{`x`}</M> and <M>{`20 - x`}</M>, the area is{" "}
        <M>{`A(x) = x(20 - x) = 20x - x^2`}</M>. Then <M>{`A'(x) = 20 - 2x = 0`}</M> gives{" "}
        <M>{`x = 10`}</M>, and <M>{`A''(x) = -2 < 0`}</M> confirms a maximum. The optimal rectangle is a{" "}
        <M>{`10 \\times 10`}</M> square with area <M>{`100`}</M>.
      </p>
      <p>
        <strong>Related rates</strong> turn the chain rule loose on time. When several quantities are
        linked by an equation and all change with time <M>{`t`}</M>, differentiate the whole equation
        with respect to <M>{`t`}</M> to relate their rates. If a spherical balloon's volume{" "}
        <M>{`V = \\tfrac{4}{3}\\pi r^3`}</M> inflates, then
      </p>
      <MBlock>{`\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}`}</MBlock>
      <p>
        so a known pump rate <M>{`\\tfrac{dV}{dt}`}</M> tells you how fast the radius grows at any given
        size. The <M>{`\\tfrac{dr}{dt}`}</M> falling out is the chain rule applied to <M>{`r(t)`}</M>{" "}
        buried inside <M>{`V`}</M>.
      </p>
      <Notice>
        <span className="lbl">The workflow</span>
        Optimization: build the quantity as a function of one variable, differentiate, solve{" "}
        <M>{`f' = 0`}</M>, classify, check endpoints. Related rates: write the geometric relation,
        differentiate with respect to <M>{`t`}</M>, plug in the instant's known values, solve for the
        unknown rate.
      </Notice>
    </div>);
}
export const mathDerivatives: Module = {
    id: "math-derivatives",
    title: "Derivatives",
    icon: "📉",
    track: "math",
    blurb: "Instantaneous change: the limit definition, the differentiation rules, derivatives of trig/exp/log, concavity, and optimization with related rates. A prerequisite for the 3D engine track.",
    dependsOn: ["math-limits"],
    lessons: [
        {
            id: "derivative-as-limit",
            title: "The Derivative as a Limit",
            minutes: 14,
            summary: "The difference quotient and the slope of the tangent.",
            Body: DerivativeAsLimit,
            exercises: [
                {
                    id: "from-definition",
                    kind: "numeric",
                    prompt: "Using f'(x) = 2x for f(x) = x², what is the slope of the tangent to y = x² at x = 4?",
                    starter: "",
                    hint: "Evaluate the derivative 2x at x = 4.",
                    validate: (s) => Math.abs(parseFloat(s) - 8) < 0.01
                        ? { pass: true, message: "Correct — f'(4) = 2·4 = 8." }
                        : { pass: false, message: "Not quite. Plug x = 4 into f'(x) = 2x." },
                },
                {
                    id: "derivative-as-limit-p1",
                    kind: "numeric",
                    prompt: "For f(x) = x² with f'(x) = 2x, find the slope of the tangent at x = 3.",
                    starter: "",
                    hint: "Evaluate 2x at x = 3.",
                    validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01
                        ? { pass: true, message: "Correct — f'(3) = 2·3 = 6." }
                        : { pass: false, message: "Not quite. Plug x = 3 into f'(x) = 2x." },
                },
                {
                    id: "derivative-as-limit-p2",
                    kind: "numeric",
                    prompt: "For the line f(x) = 5x − 2, what is f'(x) (its constant slope)?",
                    starter: "",
                    hint: "The derivative of a line is its slope everywhere.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01
                        ? { pass: true, message: "Correct — the slope of 5x − 2 is 5." }
                        : { pass: false, message: "Not quite. A line's derivative is its slope m = 5." },
                },
                {
                    id: "derivative-as-limit-p3",
                    kind: "numeric",
                    prompt: "For f(x) = x² the difference quotient at x = 2 is (f(2+h) − f(2))/h = 4 + h. What value does it approach as h → 0?",
                    starter: "",
                    hint: "Let h → 0 in 4 + h.",
                    validate: (s) => Math.abs(parseFloat(s) - 4) < 0.01
                        ? { pass: true, message: "Correct — 4 + h → 4, matching f'(2) = 2·2 = 4." }
                        : { pass: false, message: "Not quite. As h → 0, 4 + h → 4." },
                },
                {
                    id: "derivative-as-limit-p4",
                    kind: "numeric",
                    prompt: "For f(x) = x² with f'(x) = 2x, find the tangent slope at x = −2.",
                    starter: "",
                    hint: "Evaluate 2x at x = −2.",
                    validate: (s) => Math.abs(parseFloat(s) - -4) < 0.01
                        ? { pass: true, message: "Correct — f'(−2) = 2·(−2) = −4." }
                        : { pass: false, message: "Not quite. Plug x = −2 into f'(x) = 2x." },
                },
                {
                    id: "derivative-as-limit-p5",
                    kind: "numeric",
                    prompt: "For f(x) = x³ the derivative is f'(x) = 3x². Find the tangent slope at x = 2.",
                    starter: "",
                    hint: "Evaluate 3x² at x = 2.",
                    validate: (s) => Math.abs(parseFloat(s) - 12) < 0.01
                        ? { pass: true, message: "Correct — f'(2) = 3·4 = 12." }
                        : { pass: false, message: "Not quite. Plug x = 2 into f'(x) = 3x²." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "The difference quotient (f(x+h) − f(x))/h represents…",
                        choices: [
                            "the tangent slope exactly",
                            "the average rate of change over a step h (a secant slope)",
                            "the area under f",
                            "the second derivative",
                        ],
                        answer: 1,
                        explain: "It is the secant slope between x and x+h — an average rate. Taking h → 0 turns it into the tangent slope.",
                    },
                    {
                        q: "Which statement is true?",
                        choices: [
                            "Continuous implies differentiable",
                            "Differentiable implies continuous",
                            "The two are equivalent",
                            "Neither implies the other",
                        ],
                        answer: 1,
                        explain: "Differentiability is the stronger condition. |x| is continuous at 0 but not differentiable there (a corner), so the converse fails.",
                    },
                ],
            },
        },
        {
            id: "rules",
            title: "Differentiation Rules",
            minutes: 15,
            summary: "Power, product, quotient, and chain rules.",
            Body: Rules,
            exercises: [
                {
                    id: "chain-rule",
                    kind: "numeric",
                    prompt: "Let f(x) = (2x + 1)³. Compute f'(1).",
                    starter: "",
                    hint: "Chain rule: 3(2x+1)² · 2, then evaluate at x = 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 54) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 6(2x+1)²; at x = 1, 6·9 = 54." }
                        : { pass: false, message: "Not quite. f'(x) = 3(2x+1)²·2 = 6(2x+1)²; evaluate at x = 1." },
                },
                {
                    id: "rules-p1",
                    kind: "numeric",
                    prompt: "For f(x) = x⁴, use the power rule to find f'(2).",
                    starter: "",
                    hint: "f'(x) = 4x³; evaluate at x = 2.",
                    validate: (s) => Math.abs(parseFloat(s) - 32) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 4x³, so f'(2) = 4·8 = 32." }
                        : { pass: false, message: "Not quite. f'(x) = 4x³; plug in x = 2." },
                },
                {
                    id: "rules-p2",
                    kind: "numeric",
                    prompt: "For f(x) = 3x² − 2x + 1, compute f'(2).",
                    starter: "",
                    hint: "f'(x) = 6x − 2.",
                    validate: (s) => Math.abs(parseFloat(s) - 10) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 6x − 2, so f'(2) = 12 − 2 = 10." }
                        : { pass: false, message: "Not quite. f'(x) = 6x − 2; evaluate at x = 2." },
                },
                {
                    id: "rules-p3",
                    kind: "numeric",
                    prompt: "Using the product rule, let f(x) = x²·(x + 1). Compute f'(1).",
                    starter: "",
                    hint: "f'(x) = 2x(x+1) + x²·1 = 3x² + 2x.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 3x² + 2x, so f'(1) = 3 + 2 = 5." }
                        : { pass: false, message: "Not quite. f'(x) = 2x(x+1) + x² = 3x² + 2x; at x = 1 that's 5." },
                },
                {
                    id: "rules-p4",
                    kind: "numeric",
                    prompt: "Using the quotient rule, let f(x) = x/(x + 1). Compute f'(1). Round to 2 decimals.",
                    starter: "",
                    hint: "f'(x) = [(1)(x+1) − x(1)]/(x+1)² = 1/(x+1)².",
                    validate: (s) => Math.abs(parseFloat(s) - 0.25) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 1/(x+1)², so f'(1) = 1/4 = 0.25." }
                        : { pass: false, message: "Not quite. f'(x) = 1/(x+1)²; at x = 1 that's 1/4." },
                },
                {
                    id: "rules-p5",
                    kind: "numeric",
                    prompt: "For f(x) = (3x² + 1)⁵, compute f'(0).",
                    starter: "",
                    hint: "Chain rule: f'(x) = 5(3x²+1)⁴·6x; note the factor 6x.",
                    validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 30x(3x²+1)⁴; at x = 0 the 30x factor gives 0." }
                        : { pass: false, message: "Not quite. f'(x) = 5(3x²+1)⁴·6x = 30x(3x²+1)⁴; at x = 0 it's 0." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "The derivative of x⁴ is…",
                        choices: ["4x³", "4x⁵", "x³", "3x⁴"],
                        answer: 0,
                        explain: "Power rule: bring down the exponent and subtract one — 4x^(4−1) = 4x³.",
                    },
                    {
                        q: "d/dx [f(g(x))] equals…",
                        choices: ["f'(x)·g'(x)", "f'(g(x))·g'(x)", "f'(g(x))", "f(g'(x))"],
                        answer: 1,
                        explain: "The chain rule: differentiate the outer at the inner, then multiply by the derivative of the inner.",
                    },
                    {
                        q: "(fg)' equals…",
                        choices: ["f'g'", "f'g + fg'", "f'g − fg'", "(f'g + fg')/g²"],
                        answer: 1,
                        explain: "The product rule keeps both cross terms: f'g + fg'. It is NOT f'g'.",
                    },
                ],
            },
        },
        {
            id: "trig-exp-log",
            title: "Derivatives of Trig, Exp & Log",
            minutes: 13,
            summary: "The transcendental derivatives you must know.",
            Body: TranscendentalDerivatives,
            exercises: [
                {
                    id: "exp-chain",
                    kind: "open",
                    prompt: "Explain why d/dx eˣ = eˣ makes eˣ special, and give the derivative of e^(3x) using the chain rule.",
                    starter: "",
                    rubric: "Full credit: states eˣ is its own derivative (rate of change equals current value), and gives d/dx e^(3x) = 3e^(3x) via the chain rule (factor of 3 from the inner function). Partial: one of the two.",
                    hint: "The inner function is 3x; its derivative is the extra factor.",
                },
                {
                    id: "trig-exp-log-p1",
                    kind: "numeric",
                    prompt: "For f(x) = sin(x), f'(x) = cos(x). Compute f'(0).",
                    starter: "",
                    hint: "cos(0).",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — f'(0) = cos(0) = 1." }
                        : { pass: false, message: "Not quite. f'(x) = cos(x), and cos(0) = 1." },
                },
                {
                    id: "trig-exp-log-p2",
                    kind: "numeric",
                    prompt: "For f(x) = cos(x), f'(x) = −sin(x). Compute f'(π/2).",
                    starter: "",
                    hint: "−sin(π/2).",
                    validate: (s) => Math.abs(parseFloat(s) - -1) < 0.01
                        ? { pass: true, message: "Correct — f'(π/2) = −sin(π/2) = −1." }
                        : { pass: false, message: "Not quite. f'(x) = −sin(x), and sin(π/2) = 1, so −1." },
                },
                {
                    id: "trig-exp-log-p3",
                    kind: "numeric",
                    prompt: "For f(x) = eˣ, compute f'(0).",
                    starter: "",
                    hint: "eˣ is its own derivative; evaluate e⁰.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = eˣ, so f'(0) = e⁰ = 1." }
                        : { pass: false, message: "Not quite. f'(x) = eˣ and e⁰ = 1." },
                },
                {
                    id: "trig-exp-log-p4",
                    kind: "numeric",
                    prompt: "For f(x) = ln(x), f'(x) = 1/x. Compute f'(4). Round to 2 decimals.",
                    starter: "",
                    hint: "1/4.",
                    validate: (s) => Math.abs(parseFloat(s) - 0.25) < 0.01
                        ? { pass: true, message: "Correct — f'(4) = 1/4 = 0.25." }
                        : { pass: false, message: "Not quite. f'(x) = 1/x, so f'(4) = 1/4." },
                },
                {
                    id: "trig-exp-log-p5",
                    kind: "numeric",
                    prompt: "For f(x) = e^(2x), use the chain rule to compute f'(0).",
                    starter: "",
                    hint: "f'(x) = 2e^(2x); evaluate at x = 0.",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — f'(x) = 2e^(2x), so f'(0) = 2·1 = 2." }
                        : { pass: false, message: "Not quite. f'(x) = 2e^(2x); at x = 0 that's 2." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "d/dx sin(x) equals…",
                        choices: ["cos x", "−cos x", "−sin x", "sec² x"],
                        answer: 0,
                        explain: "The derivative of sine is cosine (with x in radians). Cosine differentiates to −sin x.",
                    },
                    {
                        q: "d/dx ln(x) equals…",
                        choices: ["1/x", "ln x", "x ln x", "eˣ"],
                        answer: 0,
                        explain: "The natural log has derivative 1/x for x > 0 — a consequence of being the inverse of eˣ.",
                    },
                ],
            },
        },
        {
            id: "higher-concavity",
            title: "Higher Derivatives & Concavity",
            minutes: 12,
            summary: "The second derivative, concavity, and inflection points.",
            Body: HigherDerivativesConcavity,
            exercises: [
                {
                    id: "second-deriv",
                    kind: "numeric",
                    prompt: "For f(x) = x³ − 6x², compute f''(2).",
                    starter: "",
                    hint: "f'(x) = 3x² − 12x, so f''(x) = 6x − 12.",
                    validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01
                        ? { pass: true, message: "Correct — f''(x) = 6x − 12; at x = 2 that's 0 (an inflection point)." }
                        : { pass: false, message: "Not quite. Differentiate twice: f''(x) = 6x − 12, then evaluate at x = 2." },
                },
                {
                    id: "higher-concavity-p1",
                    kind: "numeric",
                    prompt: "For f(x) = x³, compute f''(1).",
                    starter: "",
                    hint: "f'(x) = 3x², f''(x) = 6x.",
                    validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01
                        ? { pass: true, message: "Correct — f''(x) = 6x, so f''(1) = 6." }
                        : { pass: false, message: "Not quite. f''(x) = 6x; evaluate at x = 1." },
                },
                {
                    id: "higher-concavity-p2",
                    kind: "numeric",
                    prompt: "For f(x) = x⁴, compute f''(1).",
                    starter: "",
                    hint: "f'(x) = 4x³, f''(x) = 12x².",
                    validate: (s) => Math.abs(parseFloat(s) - 12) < 0.01
                        ? { pass: true, message: "Correct — f''(x) = 12x², so f''(1) = 12." }
                        : { pass: false, message: "Not quite. f''(x) = 12x²; at x = 1 that's 12." },
                },
                {
                    id: "higher-concavity-p3",
                    kind: "numeric",
                    prompt: "For f(x) = x³ − 6x², the inflection point is where f''(x) = 0. Find that x.",
                    starter: "",
                    hint: "f''(x) = 6x − 12; set it to zero.",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — 6x − 12 = 0 gives x = 2." }
                        : { pass: false, message: "Not quite. Solve f''(x) = 6x − 12 = 0." },
                },
                {
                    id: "higher-concavity-p4",
                    kind: "numeric",
                    prompt: "For f(x) = 2x³ − 3x², compute f''(0).",
                    starter: "",
                    hint: "f'(x) = 6x² − 6x, f''(x) = 12x − 6.",
                    validate: (s) => Math.abs(parseFloat(s) - -6) < 0.01
                        ? { pass: true, message: "Correct — f''(x) = 12x − 6, so f''(0) = −6." }
                        : { pass: false, message: "Not quite. f''(x) = 12x − 6; at x = 0 that's −6." },
                },
                {
                    id: "higher-concavity-p5",
                    kind: "numeric",
                    prompt: "For f(x) = x⁵, compute f''(2).",
                    starter: "",
                    hint: "f'(x) = 5x⁴, f''(x) = 20x³.",
                    validate: (s) => Math.abs(parseFloat(s) - 160) < 0.01
                        ? { pass: true, message: "Correct — f''(x) = 20x³, so f''(2) = 20·8 = 160." }
                        : { pass: false, message: "Not quite. f''(x) = 20x³; at x = 2 that's 20·8 = 160." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "If f''(x) > 0 on an interval, the graph is…",
                        choices: ["concave down (∩)", "concave up (∪)", "a straight line", "decreasing"],
                        answer: 1,
                        explain: "A positive second derivative means the slope is increasing, so the curve bends upward like a cup.",
                    },
                    {
                        q: "An inflection point is where…",
                        choices: [
                            "f' = 0",
                            "concavity changes sign (typically f'' = 0 and switches)",
                            "the function is zero",
                            "f'' is largest",
                        ],
                        answer: 1,
                        explain: "An inflection point is where concavity flips — the second derivative changes sign, usually passing through zero.",
                    },
                ],
            },
        },
        {
            id: "optimization-related-rates",
            title: "Optimization & Related Rates",
            minutes: 15,
            summary: "Critical points, maxima/minima, and rates linked by the chain rule.",
            Body: OptimizationRelatedRates,
            exercises: [
                {
                    id: "optimize",
                    kind: "numeric",
                    prompt: "A rectangle has perimeter 40. Its area is A(x) = x(20 − x). What value of x maximizes the area?",
                    starter: "",
                    hint: "Set A'(x) = 20 − 2x = 0.",
                    validate: (s) => Math.abs(parseFloat(s) - 10) < 0.01
                        ? { pass: true, message: "Correct — A'(x) = 20 − 2x = 0 gives x = 10 (a 10×10 square)." }
                        : { pass: false, message: "Not quite. Differentiate A, set A'(x) = 0: 20 − 2x = 0." },
                },
                {
                    id: "optimization-related-rates-p1",
                    kind: "numeric",
                    prompt: "For f(x) = x² − 6x + 5, find the critical point (where f'(x) = 0).",
                    starter: "",
                    hint: "f'(x) = 2x − 6; set to zero.",
                    validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01
                        ? { pass: true, message: "Correct — 2x − 6 = 0 gives x = 3." }
                        : { pass: false, message: "Not quite. Solve f'(x) = 2x − 6 = 0." },
                },
                {
                    id: "optimization-related-rates-p2",
                    kind: "numeric",
                    prompt: "For f(x) = x² − 6x + 5, find the minimum value of f (the y-value at the critical point).",
                    starter: "",
                    hint: "The critical point is x = 3; evaluate f(3).",
                    validate: (s) => Math.abs(parseFloat(s) - -4) < 0.01
                        ? { pass: true, message: "Correct — f(3) = 9 − 18 + 5 = −4." }
                        : { pass: false, message: "Not quite. Evaluate f at x = 3: 9 − 18 + 5 = −4." },
                },
                {
                    id: "optimization-related-rates-p3",
                    kind: "numeric",
                    prompt: "The rectangle with perimeter 40 and area A(x) = x(20 − x) is maximized at x = 10. Enter its maximum area.",
                    starter: "",
                    hint: "A(10) = 10·(20 − 10).",
                    validate: (s) => Math.abs(parseFloat(s) - 100) < 0.01
                        ? { pass: true, message: "Correct — A(10) = 10·10 = 100." }
                        : { pass: false, message: "Not quite. A(10) = 10·(20 − 10) = 100." },
                },
                {
                    id: "optimization-related-rates-p4",
                    kind: "numeric",
                    prompt: "For f(x) = x³ − 3x, find the positive critical point (where f'(x) = 0).",
                    starter: "",
                    hint: "f'(x) = 3x² − 3 = 0 gives x² = 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — 3x² − 3 = 0 gives x = ±1; the positive one is 1." }
                        : { pass: false, message: "Not quite. Solve 3x² − 3 = 0, so x² = 1, positive root x = 1." },
                },
                {
                    id: "optimization-related-rates-p5",
                    kind: "numeric",
                    prompt: "A balloon has V = (4/3)πr³, so dV/dt = 4πr²·dr/dt. If r = 2 and dr/dt = 3, find dV/dt. Round to the nearest whole number.",
                    starter: "",
                    hint: "4π·(2²)·3 = 48π.",
                    validate: (s) => Math.abs(parseFloat(s) - 150.8) < 0.5
                        ? { pass: true, message: "Correct — 4π·4·3 = 48π ≈ 150.80." }
                        : { pass: false, message: "Not quite. dV/dt = 4π·r²·(dr/dt) = 4π·4·3 = 48π ≈ 150.8." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "A critical point of a differentiable f is where…",
                        choices: ["f(x) = 0", "f'(x) = 0", "f''(x) = 0", "f is largest"],
                        answer: 1,
                        explain: "Critical points are where the derivative (tangent slope) is zero — the candidates for local maxima and minima.",
                    },
                    {
                        q: "At a critical point, f''(x) < 0 indicates a…",
                        choices: ["local minimum", "local maximum", "inflection point", "vertical asymptote"],
                        answer: 1,
                        explain: "Concave down at a horizontal tangent means a peak — the second-derivative test flags a local maximum.",
                    },
                    {
                        q: "Related-rates problems fundamentally rely on which rule?",
                        choices: ["The power rule", "The chain rule", "The quotient rule", "The squeeze theorem"],
                        answer: 1,
                        explain: "Differentiating a relation with respect to t treats each variable as a function of t, so the chain rule produces the linked rates.",
                    },
                ],
            },
        },
    ],
};
