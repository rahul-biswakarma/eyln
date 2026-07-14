import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code } from "../../components/code-block";
import { Notice } from "../../components/ui";
function IdeaOfALimit() {
    return (<div className="prose">
      <p>
        A limit answers a subtle question: <em>where is a function headed</em> as its input closes in
        on some value — regardless of what happens (or fails to happen) exactly at that value? This
        distinction between <strong>approaching</strong> and <strong>arriving</strong> is the single
        idea that makes calculus possible.
      </p>
      <p>The notation</p>
      <MBlock>{`\\lim_{x \\to a} f(x) = L`}</MBlock>
      <p>
        reads "as <M>{`x`}</M> gets arbitrarily close to <M>{`a`}</M>, <M>{`f(x)`}</M> gets arbitrarily
        close to <M>{`L`}</M>." Crucially, <M>{`x`}</M> never equals <M>{`a`}</M>. The function need not
        even be defined at <M>{`a`}</M> for the limit to exist.
      </p>

      <h3>The Formal <M>{`\\varepsilon`}</M>-<M>{`\\delta`}</M> Definition</h3>
      <p>
        To make this mathematically rigorous, we define limits using bounds. We say that the limit of <M>{`f(x)`}</M> as <M>{`x`}</M> approaches <M>{`a`}</M> is <M>{`L`}</M> if:
      </p>
      <MBlock>{`\\lim_{x \\to a} f(x) = L \\iff \\forall \\varepsilon > 0, \\; \\exists \\delta > 0 \\quad \\text{such that} \\quad 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon`}</MBlock>
      <p>
        This statement means: no matter how tight a window <M>{`\\varepsilon`}</M> you choose around the target <M>{`L`}</M>, we can always find a corresponding window <M>{`\\delta`}</M> around the input <M>{`a`}</M> such that any input within <M>{`\\delta`}</M> (excluding <M>{`a`}</M> itself) maps to an output within <M>{`\\varepsilon`}</M>.
      </p>

      <p>
        The classic example is <M>{`f(x) = \\dfrac{x^2 - 1}{x - 1}`}</M>. At <M>{`x = 1`}</M> the formula
        is <M>{`\\tfrac{0}{0}`}</M> — undefined, a hole in the graph. But <em>near</em> <M>{`x = 1`}</M>{" "}
        the function equals <M>{`x + 1`}</M> (cancel the common factor), so it is plainly heading toward{" "}
        <M>{`2`}</M>. The limit is <M>{`2`}</M> even though <M>{`f(1)`}</M> does not exist. The value at
        the point and the limit at the point are independent questions.
      </p>
      <Code lang="ts" code={`// Watch the function home in on 2 as x approaches 1 — without ever being 1.
const f = (x: number) => (x * x - 1) / (x - 1);
f(0.9);    // 1.9
f(0.99);   // 1.99
f(0.999);  // 1.999
f(1.001);  // 2.001
f(1);      // NaN  <- the hole; the limit doesn't care`}/>
      <p>
        Informally we say the limit exists when the left-hand and right-hand approaches agree on a
        single finite value. The precise version — the <M>{`\\varepsilon`}</M>-<M>{`\\delta`}</M>{" "}
        definition — pins down "arbitrarily close" with inequalities, but the intuition of a converging
        target is what you will use daily.
      </p>
      <Notice>
        <span className="lbl">The mantra</span>
        A limit describes the <strong>journey</strong>, not the <strong>destination stamped on the
        map</strong>. What the function does at <M>{`a`}</M> is a separate fact from what it approaches
        near <M>{`a`}</M>.
      </Notice>
    </div>);
}
function ComputingLimits() {
    return (<div className="prose">
      <p>
        Most limits are computed, not graphed. There is a reliable ladder of techniques; you climb it
        only as far as you need.
      </p>
      <p>
        <strong>Step 1 — Substitution.</strong> If <M>{`f`}</M> is continuous at <M>{`a`}</M>, just plug
        in: <M>{`\\lim_{x\\to a} f(x) = f(a)`}</M>. Polynomials, and rationals with a nonzero
        denominator, fall immediately. Substitution is always the first thing to try.
      </p>
      <p>
        Substitution fails when it produces an <strong>indeterminate form</strong> like{" "}
        <M>{`\\tfrac{0}{0}`}</M>. That is not an answer — it is a signal that the numerator and
        denominator share a hidden factor, and you must do algebra to expose it.
      </p>
      <p>
        <strong>Step 2 — Factoring.</strong> Factor top and bottom, cancel the common piece, then
        substitute into the survivor:
      </p>
      <MBlock>{`\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = \\lim_{x \\to 3} \\frac{(x-3)(x+3)}{x-3} = \\lim_{x \\to 3} (x+3) = 6`}</MBlock>
      <p>
        <strong>Step 3 — Rationalizing.</strong> When roots are involved, multiply by the conjugate to
        clear them:
      </p>
      <MBlock>{`\\lim_{x \\to 0} \\frac{\\sqrt{x+1} - 1}{x} = \\lim_{x \\to 0} \\frac{(\\sqrt{x+1}-1)(\\sqrt{x+1}+1)}{x(\\sqrt{x+1}+1)} = \\lim_{x \\to 0} \\frac{x}{x(\\sqrt{x+1}+1)} = \\frac{1}{2}`}</MBlock>
      <p>
        The pattern is always the same: the <M>{`\\tfrac{0}{0}`}</M> came from a factor of{" "}
        <M>{`x`}</M> (or <M>{`x - a`}</M>) present on both levels. Algebra removes it, and then plain
        substitution finishes the problem.
      </p>
      <Notice warn>
        <span className="lbl">Not every ratio cancels</span>
        Some <M>{`\\tfrac00`}</M> limits, like <M>{`\\lim_{x\\to0}\\tfrac{\\sin x}{x}`}</M>, have no
        algebraic factor to cancel. Those need the squeeze theorem — the final lesson — or, later,
        L'Hôpital's rule.
      </Notice>
    </div>);
}
function OneSidedAndInfinity() {
    return (<div className="prose">
      <p>
        Sometimes a function approaches different values from the left and the right. We split the
        limit into two <strong>one-sided limits</strong>:
      </p>
      <MBlock>{`\\lim_{x \\to a^-} f(x) \\quad \\text{(from below)}, \\qquad \\lim_{x \\to a^+} f(x) \\quad \\text{(from above)}`}</MBlock>
      <p>
        The two-sided limit exists <strong>only when both agree</strong>:
      </p>
      <MBlock>{`\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L`}</MBlock>
      <p>
        A step function or a piecewise definition can jump at <M>{`a`}</M>: approach from the left and
        you land on one value, from the right another. The two-sided limit then <em>does not exist</em>,
        even though both one-sided limits are perfectly well defined.
      </p>
      <p>
        <strong>Limits at infinity</strong> ask where a function settles as <M>{`x`}</M> runs off to{" "}
        <M>{`\\pm\\infty`}</M>. These reveal <strong>horizontal asymptotes</strong>. For a rational
        function, compare the degrees of numerator and denominator:
      </p>
      <ul>
        <li>
          Denominator wins (higher degree) → limit is <M>{`0`}</M>.
        </li>
        <li>
          Degrees equal → limit is the ratio of leading coefficients.
        </li>
        <li>
          Numerator wins → the function grows without bound (no horizontal asymptote).
        </li>
      </ul>
      <MBlock>{`\\lim_{x \\to \\infty} \\frac{3x^2 + 5}{6x^2 - x} = \\frac{3}{6} = \\frac{1}{2}`}</MBlock>
      <p>
        The trick that proves it: divide every term by the highest power of <M>{`x`}</M> present, and
        watch each <M>{`\\tfrac{1}{x^k}`}</M> term vanish. A <strong>vertical asymptote</strong>, by
        contrast, occurs where the function itself blows up — a denominator hitting zero with a
        surviving nonzero numerator, sending the limit to <M>{`\\pm\\infty`}</M>.
      </p>
      <Notice>
        <span className="lbl">Two kinds of asymptote</span>
        <strong>Horizontal</strong> asymptotes come from limits at infinity (the input runs away).{" "}
        <strong>Vertical</strong> asymptotes come from the output running away at a finite input. Don't
        confuse the two — they answer opposite questions.
      </Notice>
    </div>);
}
function Continuity() {
    return (<div className="prose">
      <p>
        Intuitively, a function is <strong>continuous</strong> if you can draw it without lifting your
        pen — no holes, no jumps, no vertical blowups. Limits let us make that precise. A function{" "}
        <M>{`f`}</M> is continuous at <M>{`a`}</M> when three conditions all hold:
      </p>
      <ul>
        <li>
          <M>{`f(a)`}</M> <strong>exists</strong> (the point is defined),
        </li>
        <li>
          <M>{`\\lim_{x \\to a} f(x)`}</M> <strong>exists</strong> (the function is heading somewhere),
        </li>
        <li>
          the two <strong>match</strong>: <M>{`\\lim_{x \\to a} f(x) = f(a)`}</M>.
        </li>
      </ul>
      <p>
        That third line — the limit equals the value — is the heart of it. The journey and the
        destination coincide. Break any one condition and you have a <strong>discontinuity</strong>,
        and the flavor of break tells you which condition failed:
      </p>
      <ul>
        <li>
          <strong>Removable</strong> (a hole): the limit exists but <M>{`f(a)`}</M> is missing or wrong.
          You could "plug the hole" by redefining a single point — as with{" "}
          <M>{`\\tfrac{x^2-1}{x-1}`}</M> at <M>{`x=1`}</M>.
        </li>
        <li>
          <strong>Jump</strong>: the one-sided limits exist but disagree, so the two-sided limit fails.
          Common in piecewise and step functions.
        </li>
        <li>
          <strong>Infinite</strong>: the function shoots to <M>{`\\pm\\infty`}</M> at a vertical
          asymptote, so no finite limit exists.
        </li>
      </ul>

      <h3>The Intermediate Value Theorem (IVT)</h3>
      <p>
        Continuity guarantees essential structural behaviors. The most famous is the <strong>Intermediate Value Theorem (IVT)</strong>:
      </p>
      <MBlock>{`\\text{If } f \\text{ is continuous on } [a, b] \\text{ and } u \\text{ lies between } f(a) \\text{ and } f(b), \\text{ there exists } c \\in [a, b] \\text{ such that } f(c) = u.`}</MBlock>
      <p>
        A key application of the IVT is root finding: if a continuous function shifts signs between <M>{`a`}</M> and <M>{`b`}</M> (i.e. <M>{`f(a) < 0`}</M> and <M>{`f(b) > 0`}</M>), then there must exist a root <M>{`c`}</M> where <M>{`f(c) = 0`}</M>. 
        This is the mathematical guarantee behind the <strong>Bisection Method</strong> and ray-marching boundary intersection tests.
      </p>

      <p>
        Continuity is what most calculus theorems quietly assume. It guarantees, for instance, that a
        continuous function on a closed interval attains a maximum and a minimum, and that it takes
        every value in between (the Intermediate Value Theorem). And it is why <strong>substitution
        works</strong> for computing limits: substitution is literally the definition of continuity
        read in reverse.
      </p>
      <Notice>
        <span className="lbl">Building block</span>
        Polynomials, exponentials, sines and cosines are continuous everywhere. Sums, products,
        compositions, and quotients (away from zero denominators) of continuous functions are
        continuous. So the only places to hunt for trouble are denominators, piece boundaries, and
        domain edges.
      </Notice>
    </div>);
}
function SqueezeTheorem() {
    return (<div className="prose">
      <p>
        Some limits resist algebra entirely. The <strong>squeeze theorem</strong> (a.k.a. the sandwich
        theorem) handles them by trapping the mystery function between two functions whose limits we
        already know.
      </p>
      <p>
        If <M>{`g(x) \\le f(x) \\le h(x)`}</M> near <M>{`a`}</M>, and the outer two both head to the
        same value <M>{`L`}</M>, then <M>{`f`}</M> has no choice but to go there too:
      </p>
      <MBlock>{`\\text{if } g(x) \\le f(x) \\le h(x) \\text{ and } \\lim_{x\\to a} g(x) = \\lim_{x\\to a} h(x) = L, \\text{ then } \\lim_{x\\to a} f(x) = L`}</MBlock>
      <p>
        The picture is exactly the name: two bread functions close in on <M>{`L`}</M>, and the filling
        gets crushed to the same value. A textbook use is{" "}
        <M>{`\\lim_{x\\to0} x^2 \\sin\\tfrac1x`}</M>. The <M>{`\\sin\\tfrac1x`}</M> oscillates wildly and
        has no limit, but it is bounded between <M>{`-1`}</M> and <M>{`1`}</M>, so{" "}
        <M>{`-x^2 \\le x^2\\sin\\tfrac1x \\le x^2`}</M>. Both bounds go to <M>{`0`}</M>, so the filling
        does too.
      </p>
      <p>
        The most important payoff is the limit that unlocks all of trigonometric calculus:
      </p>
      <MBlock>{`\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1`}</MBlock>
      <p>
        A geometric argument on the unit circle sandwiches <M>{`\\tfrac{\\sin x}{x}`}</M> between{" "}
        <M>{`\\cos x`}</M> and <M>{`1`}</M> for small <M>{`x`}</M> (comparing the areas of a triangle, a
        circular sector, and a larger triangle). As <M>{`x \\to 0`}</M>, <M>{`\\cos x \\to 1`}</M>, so
        the squeeze forces the ratio to <M>{`1`}</M>. This is why, in radians,{" "}
        <M>{`\\sin x \\approx x`}</M> for small angles — and it is the exact fact that makes{" "}
        <M>{`\\frac{d}{dx}\\sin x = \\cos x`}</M> come out clean in the next module.
      </p>
      <Notice>
        <span className="lbl">When to reach for it</span>
        Squeeze is the tool for a bounded-times-vanishing product, or any limit where you can't
        evaluate the function directly but you <em>can</em> bound it above and below by things you can
        evaluate.
      </Notice>
    </div>);
}
export const mathLimits: Module = {
    id: "math-limits",
    title: "Limits & Continuity",
    icon: "➡️",
    track: "math",
    blurb: "The bridge into calculus: approaching versus arriving, computing indeterminate forms, asymptotes, the three conditions for continuity, and the squeeze theorem.",
    dependsOn: ["math-functions"],
    lessons: [
        {
            id: "idea-of-a-limit",
            title: "The Idea of a Limit",
            minutes: 12,
            summary: "Approaching a value without reaching it.",
            Body: IdeaOfALimit,
            exercises: [
                {
                    id: "limit-numeric",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→2) (x² − 4)/(x − 2).",
                    starter: "",
                    hint: "Factor the numerator, cancel, then substitute.",
                    validate: (s) => Math.abs(parseFloat(s) - 4) < 0.01
                        ? { pass: true, message: "Correct — (x−2)(x+2)/(x−2) = x+2 → 4." }
                        : { pass: false, message: "Not quite. Factor x²−4 = (x−2)(x+2) and cancel." },
                },
                {
                    id: "idea-of-a-limit-p1",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→3) (2x + 1) by substitution.",
                    starter: "",
                    hint: "This is a polynomial — just plug in x = 3.",
                    validate: (s) => Math.abs(parseFloat(s) - 7) < 0.01
                        ? { pass: true, message: "Correct — 2·3 + 1 = 7." }
                        : { pass: false, message: "Not quite. A polynomial is continuous, so substitute x = 3." },
                },
                {
                    id: "idea-of-a-limit-p2",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) (x² + 5).",
                    starter: "",
                    hint: "Substitute x = 0.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01
                        ? { pass: true, message: "Correct — 0 + 5 = 5." }
                        : { pass: false, message: "Not quite. Plug x = 0 into x² + 5." },
                },
                {
                    id: "idea-of-a-limit-p3",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→1) (x² − 1)/(x − 1).",
                    starter: "",
                    hint: "Factor the numerator (x−1)(x+1) and cancel.",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — cancels to x + 1 → 2." }
                        : { pass: false, message: "Not quite. (x−1)(x+1)/(x−1) = x + 1, then let x → 1." },
                },
                {
                    id: "idea-of-a-limit-p4",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→3) (x² − 9)/(x − 3).",
                    starter: "",
                    hint: "Factor x² − 9 = (x − 3)(x + 3).",
                    validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01
                        ? { pass: true, message: "Correct — cancels to x + 3 → 6." }
                        : { pass: false, message: "Not quite. (x−3)(x+3)/(x−3) = x + 3, then let x → 3." },
                },
                {
                    id: "idea-of-a-limit-p5",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→2) (x³ − 8)/(x − 2). (Hint: x³ − 8 = (x − 2)(x² + 2x + 4).)",
                    starter: "",
                    hint: "Cancel (x − 2), then substitute x = 2 into x² + 2x + 4.",
                    validate: (s) => Math.abs(parseFloat(s) - 12) < 0.01
                        ? { pass: true, message: "Correct — x² + 2x + 4 at x = 2 is 4 + 4 + 4 = 12." }
                        : { pass: false, message: "Not quite. After cancelling, evaluate x² + 2x + 4 at x = 2." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "For lim(x→a) f(x) to equal L, what must be true about f(a)?",
                        choices: [
                            "f(a) must equal L",
                            "f(a) must exist",
                            "Nothing — f need not even be defined at a",
                            "f(a) must be zero",
                        ],
                        answer: 2,
                        explain: "A limit describes behavior near a, not at a. The function can have a hole at a and still have a limit.",
                    },
                    {
                        q: "The value f(1) = NaN for f(x) = (x²−1)/(x−1), yet the limit as x→1 is…",
                        choices: ["Undefined", "0", "2", "1"],
                        answer: 2,
                        explain: "Near x = 1 the function equals x + 1, which heads to 2. The hole at x = 1 doesn't affect the limit.",
                    },
                ],
            },
        },
        {
            id: "computing-limits",
            title: "Computing Limits",
            minutes: 14,
            summary: "Substitution, factoring, and rationalizing 0/0 forms.",
            Body: ComputingLimits,
            exercises: [
                {
                    id: "rationalize",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) (√(x+1) − 1)/x.",
                    starter: "",
                    hint: "Multiply numerator and denominator by the conjugate √(x+1) + 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 0.5) < 0.01
                        ? { pass: true, message: "Correct — rationalizing leaves 1/(√(x+1)+1) → 1/2." }
                        : { pass: false, message: "Not quite. Multiply by the conjugate to clear the root." },
                },
                {
                    id: "computing-limits-p1",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→4) (x² − 16)/(x − 4).",
                    starter: "",
                    hint: "Factor x² − 16 = (x − 4)(x + 4).",
                    validate: (s) => Math.abs(parseFloat(s) - 8) < 0.01
                        ? { pass: true, message: "Correct — cancels to x + 4 → 8." }
                        : { pass: false, message: "Not quite. (x−4)(x+4)/(x−4) = x + 4, then let x → 4." },
                },
                {
                    id: "computing-limits-p2",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→2) (x² − 4)/(x² − x − 2).",
                    starter: "",
                    hint: "Factor both: (x−2)(x+2) over (x−2)(x+1).",
                    validate: (s) => Math.abs(parseFloat(s) - 1.3333) < 0.01
                        ? { pass: true, message: "Correct — cancels to (x+2)/(x+1) → 4/3 ≈ 1.33." }
                        : { pass: false, message: "Not quite. Cancel (x−2): left with (x+2)/(x+1) = 4/3." },
                },
                {
                    id: "computing-limits-p3",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→5) (x − 5)/(x² − 25).",
                    starter: "",
                    hint: "Factor x² − 25 = (x − 5)(x + 5).",
                    validate: (s) => Math.abs(parseFloat(s) - 0.1) < 0.01
                        ? { pass: true, message: "Correct — cancels to 1/(x+5) → 1/10 = 0.1." }
                        : { pass: false, message: "Not quite. (x−5)/((x−5)(x+5)) = 1/(x+5) → 1/10." },
                },
                {
                    id: "computing-limits-p4",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) (√(x+4) − 2)/x.",
                    starter: "",
                    hint: "Multiply by the conjugate √(x+4) + 2.",
                    validate: (s) => Math.abs(parseFloat(s) - 0.25) < 0.01
                        ? { pass: true, message: "Correct — rationalizing leaves 1/(√(x+4)+2) → 1/4 = 0.25." }
                        : { pass: false, message: "Not quite. Conjugate gives 1/(√(x+4)+2) → 1/4." },
                },
                {
                    id: "computing-limits-p5",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→3) (x² − 2x − 3)/(x − 3).",
                    starter: "",
                    hint: "Factor the numerator: (x − 3)(x + 1).",
                    validate: (s) => Math.abs(parseFloat(s) - 4) < 0.01
                        ? { pass: true, message: "Correct — cancels to x + 1 → 4." }
                        : { pass: false, message: "Not quite. (x−3)(x+1)/(x−3) = x + 1, then let x → 3." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "Plugging in gives 0/0. This means…",
                        choices: [
                            "The limit is 0",
                            "The limit does not exist",
                            "It's an indeterminate form — do algebra first",
                            "The limit is infinite",
                        ],
                        answer: 2,
                        explain: "0/0 is indeterminate: it signals a shared factor. Factor or rationalize to resolve it, then substitute.",
                    },
                    {
                        q: "The first technique to try on any limit is…",
                        choices: ["Rationalizing", "Direct substitution", "L'Hôpital's rule", "The squeeze theorem"],
                        answer: 1,
                        explain: "Substitution works whenever the function is continuous at the point, and is always the quickest first check.",
                    },
                ],
            },
        },
        {
            id: "one-sided-infinity",
            title: "One-Sided Limits & Limits at Infinity",
            minutes: 13,
            summary: "Left/right agreement and horizontal versus vertical asymptotes.",
            Body: OneSidedAndInfinity,
            exercises: [
                {
                    id: "at-infinity",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→∞) (2x² + 7)/(5x² − 3x). Enter a decimal.",
                    starter: "",
                    hint: "Equal degrees: take the ratio of leading coefficients.",
                    validate: (s) => Math.abs(parseFloat(s) - 0.4) < 0.01
                        ? { pass: true, message: "Correct — leading coefficients 2/5 = 0.4." }
                        : { pass: false, message: "Not quite. Divide through by x²; only leading terms survive: 2/5." },
                },
                {
                    id: "one-sided-infinity-p1",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→∞) (3x + 2)/(x + 5). Enter a decimal.",
                    starter: "",
                    hint: "Equal degrees: ratio of leading coefficients 3/1.",
                    validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01
                        ? { pass: true, message: "Correct — leading coefficients 3/1 = 3." }
                        : { pass: false, message: "Not quite. Divide by x; only leading terms survive: 3/1 = 3." },
                },
                {
                    id: "one-sided-infinity-p2",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→∞) (4x + 1)/(x² + 3).",
                    starter: "",
                    hint: "Denominator has higher degree.",
                    validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01
                        ? { pass: true, message: "Correct — the denominator wins, so the limit is 0." }
                        : { pass: false, message: "Not quite. Higher-degree denominator drives the ratio to 0." },
                },
                {
                    id: "one-sided-infinity-p3",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→∞) (6x³ − x)/(2x³ + 5). Enter a decimal.",
                    starter: "",
                    hint: "Equal degrees: ratio of leading coefficients 6/2.",
                    validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01
                        ? { pass: true, message: "Correct — 6/2 = 3." }
                        : { pass: false, message: "Not quite. Equal degrees give 6/2 = 3." },
                },
                {
                    id: "one-sided-infinity-p4",
                    kind: "numeric",
                    prompt: "For f(x) = |x|/x, evaluate the right-hand limit lim(x→0⁺) f(x).",
                    starter: "",
                    hint: "For x > 0, |x| = x, so |x|/x = 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — for x > 0, |x|/x = 1." }
                        : { pass: false, message: "Not quite. Approaching from the right, x > 0 so |x|/x = 1." },
                },
                {
                    id: "one-sided-infinity-p5",
                    kind: "numeric",
                    prompt: "For f(x) = |x|/x, evaluate the left-hand limit lim(x→0⁻) f(x).",
                    starter: "",
                    hint: "For x < 0, |x| = −x, so |x|/x = −1.",
                    validate: (s) => Math.abs(parseFloat(s) - -1) < 0.01
                        ? { pass: true, message: "Correct — for x < 0, |x|/x = −1." }
                        : { pass: false, message: "Not quite. Approaching from the left, x < 0 so |x|/x = −1." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "A two-sided limit at a exists if and only if…",
                        choices: [
                            "f(a) is defined",
                            "the left- and right-hand limits are equal",
                            "f is a polynomial",
                            "the function is increasing",
                        ],
                        answer: 1,
                        explain: "The two one-sided limits must exist and agree; if they differ (a jump), the two-sided limit fails.",
                    },
                    {
                        q: "A horizontal asymptote comes from…",
                        choices: [
                            "a zero denominator at a finite x",
                            "the limit as x → ±∞",
                            "a removable hole",
                            "the y-intercept",
                        ],
                        answer: 1,
                        explain: "Horizontal asymptotes describe end behavior — limits at infinity. Vertical asymptotes come from finite inputs where the output blows up.",
                    },
                ],
            },
        },
        {
            id: "continuity",
            title: "Continuity",
            minutes: 13,
            summary: "The three conditions and the types of discontinuity.",
            Body: Continuity,
            exercises: [
                {
                    id: "continuity-open",
                    kind: "open",
                    prompt: "The function f(x) = (x² − 1)/(x − 1) is undefined at x = 1. Classify the discontinuity and explain how (if at all) it could be repaired.",
                    starter: "",
                    rubric: "Full credit: identifies it as a removable discontinuity (a hole) because the limit exists (= 2) but f(1) is undefined; repaired by defining f(1) = 2. Partial: names 'removable' OR gives the repair value 2 but not both, or omits that the limit exists.",
                    hint: "Does the limit exist even though the point is missing?",
                },
                {
                    id: "continuity-p1",
                    kind: "numeric",
                    prompt: "f(x) = (x² − 1)/(x − 1) has a removable hole at x = 1. Enter the value that would fill the hole to make f continuous.",
                    starter: "",
                    hint: "It's the limit as x → 1; the expression simplifies to x + 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — the limit is x + 1 → 2, so define f(1) = 2." }
                        : { pass: false, message: "Not quite. Simplify to x + 1 and evaluate at x = 1." },
                },
                {
                    id: "continuity-p2",
                    kind: "numeric",
                    prompt: "The piecewise f(x) = 3x + 1 for x ≤ 2 and f(x) = x² + c for x > 2 is continuous at x = 2. Find c.",
                    starter: "",
                    hint: "Match the two pieces at x = 2: 3(2) + 1 = 2² + c.",
                    validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01
                        ? { pass: true, message: "Correct — 7 = 4 + c gives c = 3." }
                        : { pass: false, message: "Not quite. Set 3·2 + 1 = 2² + c, so 7 = 4 + c." },
                },
                {
                    id: "continuity-p3",
                    kind: "numeric",
                    prompt: "For f(x) = (x² − 9)/(x − 3), enter the value f(3) should be assigned to remove the discontinuity.",
                    starter: "",
                    hint: "Simplify to x + 3 and evaluate at x = 3.",
                    validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01
                        ? { pass: true, message: "Correct — the limit is x + 3 → 6, so f(3) = 6." }
                        : { pass: false, message: "Not quite. Simplify to x + 3 and let x → 3." },
                },
                {
                    id: "continuity-p4",
                    kind: "numeric",
                    prompt: "The piecewise f(x) = x² for x < 1 and f(x) = ax for x ≥ 1 is continuous at x = 1. Find a.",
                    starter: "",
                    hint: "Match the pieces at x = 1: 1² = a·1.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — 1 = a, so a = 1." }
                        : { pass: false, message: "Not quite. Set 1² = a·1, giving a = 1." },
                },
                {
                    id: "continuity-p5",
                    kind: "numeric",
                    prompt: "g(x) = (x² + x − 6)/(x − 2) has a removable hole at x = 2. Enter the value that fills it.",
                    starter: "",
                    hint: "Factor the numerator (x − 2)(x + 3) and cancel.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01
                        ? { pass: true, message: "Correct — simplifies to x + 3 → 5." }
                        : { pass: false, message: "Not quite. (x−2)(x+3)/(x−2) = x + 3, then let x → 2." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "Which is NOT one of the three conditions for continuity at a?",
                        choices: [
                            "f(a) exists",
                            "lim(x→a) f(x) exists",
                            "lim(x→a) f(x) = f(a)",
                            "f is increasing at a",
                        ],
                        answer: 3,
                        explain: "Continuity requires the value to exist, the limit to exist, and the two to match. Monotonicity is irrelevant.",
                    },
                    {
                        q: "A jump discontinuity occurs when…",
                        choices: [
                            "the function has a hole",
                            "the one-sided limits exist but disagree",
                            "the function goes to infinity",
                            "f(a) equals the limit",
                        ],
                        answer: 1,
                        explain: "In a jump, both one-sided limits exist but are unequal, so the two-sided limit doesn't exist.",
                    },
                ],
            },
        },
        {
            id: "squeeze-theorem",
            title: "The Squeeze Theorem",
            minutes: 12,
            summary: "Trapping a limit, and proving lim sin(x)/x = 1.",
            Body: SqueezeTheorem,
            exercises: [
                {
                    id: "sinx-over-x",
                    kind: "numeric",
                    prompt: "Using the squeeze result, evaluate lim(x→0) sin(3x)/x.",
                    starter: "",
                    hint: "Write it as 3 · sin(3x)/(3x); the inner ratio → 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01
                        ? { pass: true, message: "Correct — sin(3x)/x = 3·sin(3x)/(3x) → 3·1 = 3." }
                        : { pass: false, message: "Not quite. Factor to 3·sin(3x)/(3x); the ratio tends to 1." },
                },
                {
                    id: "squeeze-theorem-p1",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) sin(x)/x.",
                    starter: "",
                    hint: "The fundamental squeeze result.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — lim(x→0) sin(x)/x = 1." }
                        : { pass: false, message: "Not quite. This is the anchor squeeze limit; it equals 1." },
                },
                {
                    id: "squeeze-theorem-p2",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) sin(5x)/x.",
                    starter: "",
                    hint: "Write as 5·sin(5x)/(5x); the inner ratio → 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01
                        ? { pass: true, message: "Correct — 5·sin(5x)/(5x) → 5·1 = 5." }
                        : { pass: false, message: "Not quite. Factor to 5·sin(5x)/(5x), ratio → 1, so 5." },
                },
                {
                    id: "squeeze-theorem-p3",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) sin(2x)/sin(x). (Hint: sin(2x)/x → 2 and sin(x)/x → 1.)",
                    starter: "",
                    hint: "Divide top and bottom by x: (sin(2x)/x)/(sin(x)/x) → 2/1.",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — (sin(2x)/x)/(sin(x)/x) → 2/1 = 2." }
                        : { pass: false, message: "Not quite. Divide by x: 2/1 = 2." },
                },
                {
                    id: "squeeze-theorem-p4",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) x² sin(1/x).",
                    starter: "",
                    hint: "sin(1/x) is bounded in [−1, 1] and x² → 0; squeeze it.",
                    validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01
                        ? { pass: true, message: "Correct — −x² ≤ x²sin(1/x) ≤ x², both bounds → 0." }
                        : { pass: false, message: "Not quite. Squeeze between −x² and x²; both go to 0." },
                },
                {
                    id: "squeeze-theorem-p5",
                    kind: "numeric",
                    prompt: "Evaluate lim(x→0) tan(x)/x. (Hint: tan(x)/x = (sin(x)/x)·(1/cos(x)).)",
                    starter: "",
                    hint: "sin(x)/x → 1 and 1/cos(x) → 1.",
                    validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01
                        ? { pass: true, message: "Correct — (sin(x)/x)(1/cos x) → 1·1 = 1." }
                        : { pass: false, message: "Not quite. Split into (sin(x)/x)·(1/cos x); both → 1." },
                },
            ],
            quiz: {
                questions: [
                    {
                        q: "The squeeze theorem requires that…",
                        choices: [
                            "f is continuous",
                            "g(x) ≤ f(x) ≤ h(x) near a, with g and h sharing the same limit",
                            "f is a polynomial",
                            "the limit is zero",
                        ],
                        answer: 1,
                        explain: "If f is trapped between g and h, and both outer functions tend to the same L, then f must tend to L as well.",
                    },
                    {
                        q: "lim(x→0) sin(x)/x equals…",
                        choices: ["0", "1", "∞", "undefined"],
                        answer: 1,
                        explain: "A unit-circle area argument squeezes the ratio between cos x and 1; both tend to 1, so the limit is 1 (x in radians).",
                    },
                ],
            },
        },
    ],
};
