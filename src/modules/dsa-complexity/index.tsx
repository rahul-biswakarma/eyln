import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";

function WhatIsComplexity() {
  return (
    <div className="prose">
      <p>
        Before you can choose between two algorithms you need a way to talk about "how expensive" one
        is <em>without</em> running it on a specific machine with a specific compiler on a specific
        Tuesday. Wall-clock seconds are useless for reasoning: they depend on your CPU, cache, other
        processes, and the input you happened to try. <strong>Complexity analysis</strong> throws all
        of that away and asks a single, portable question: as the input grows, how does the amount of
        work grow?
      </p>
      <p>
        We count <strong>basic operations</strong> — comparisons, additions, array accesses — as a
        function of the input size <M>{`n`}</M>. That count is a function{" "}
        <M>{`T(n)`}</M>. A loop that touches every element once does <M>{`T(n) = n`}</M> work; a pair
        of nested loops over the same array does <M>{`T(n) = n^2`}</M>. The exact constant in front
        (is each iteration 3 operations or 7?) depends on hardware and is exactly what we want to
        ignore, because it does not change which algorithm wins once <M>{`n`}</M> is large.
      </p>
      <MBlock>{`\\text{doubling } n \\text{ multiplies work by } \\frac{T(2n)}{T(n)}`}</MBlock>
      <p>
        This ratio is the whole game. For a linear algorithm doubling the input doubles the work
        (<M>{`\\frac{2n}{n} = 2`}</M>). For a quadratic one it <em>quadruples</em> it
        (<M>{`\\frac{(2n)^2}{n^2} = 4`}</M>). For a logarithmic one it barely moves. Those growth
        rates decide whether your feature ships or times out at scale.
      </p>
      <div className="notice">
        <span className="lbl">Worst / average / best</span>
        Unless we say otherwise, complexity means the <strong>worst case</strong> — the guarantee
        that holds for <em>any</em> input of size <M>{`n`}</M>. Best case ("it's fast if the array is
        already sorted") is rarely a useful promise. Average case matters too, but needs an
        assumption about how inputs are distributed.
      </div>
    </div>
  );
}

function BigOFormal() {
  return (
    <div className="prose">
      <p>
        "Grows like <M>{`n^2`}</M>" needs a precise definition, and asymptotic notation supplies
        three of them. All three are statements about how <M>{`T(n)`}</M> behaves as{" "}
        <M>{`n \\to \\infty`}</M>, ignoring constant factors and small inputs.
      </p>

      <h3>Formal Asymptotic Definitions</h3>
      <ul>
        <li>
          <strong>Big-O (Upper Bound / Ceiling)</strong>:
          <MBlock>{`T(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 > 0 \\quad \\text{such that} \\quad 0 \\le T(n) \\le c\\,g(n) \\quad \\forall n \\ge n_0`}</MBlock>
          This guarantees that <M>{`T(n)`}</M> grows no faster than <M>{`g(n)`}</M> asymptotically.
        </li>
        <li>
          <strong>Big-Omega (Lower Bound / Floor)</strong>:
          <MBlock>{`T(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 > 0 \\quad \\text{such that} \\quad T(n) \\ge c\\,g(n) \\ge 0 \\quad \\forall n \\ge n_0`}</MBlock>
          This guarantees that <M>{`T(n)`}</M> grows at least as fast as <M>{`g(n)`}</M> asymptotically.
        </li>
        <li>
          <strong>Big-Theta (Tight Bound / Exact Fit)</strong>:
          <MBlock>{`T(n) = \\Theta(g(n)) \\iff T(n) = O(g(n)) \\quad \\text{and} \\quad T(n) = \\Omega(g(n))`}</MBlock>
          This requires <M>{`T(n)`}</M> to be bounded above and below by scaled versions of <M>{`g(n)`}</M>, meaning they share the same asymptotic growth class.
        </li>
      </ul>

      <p>
        A concrete example: <M>{`T(n) = 3n^2 + 5n + 100`}</M>. The <M>{`n^2`}</M> term dominates, so
        <M>{`T(n) = \\Theta(n^2)`}</M>. We can also (weakly, but truthfully) say{" "}
        <M>{`T(n) = O(n^3)`}</M> because a ceiling need not be tight. That is why saying "this sort
        is <M>{`O(n^2)`}</M>" is a claim about the worst it can do, not a promise it is ever that
        slow.
      </p>
      <Code
        lang="ts"
        filename="bounds.ts"
        code={`// T(n) = 3n^2 + 5n + 100.  Verify O(n^2): find c, n0 with T(n) <= c*n^2.
// Pick c = 4. Then need 3n^2 + 5n + 100 <= 4n^2, i.e. n^2 - 5n - 100 >= 0,
// which holds for all n >= 14. So (c, n0) = (4, 14) witnesses T = O(n^2).
function T(n: number): number { return 3 * n * n + 5 * n + 100; }
function witness(n: number): boolean { return T(n) <= 4 * n * n; }
console.log(witness(14), witness(100)); // true true`}
      />
      <div className="notice warn">
        <span className="lbl">Common abuse</span>
        People say "O" when they mean "Θ" all the time. Saying an algorithm is{" "}
        <M>{`O(n)`}</M> only claims it is <em>no worse</em> than linear; a constant-time algorithm is
        also <M>{`O(n)`}</M>. When you want to say "exactly this fast, no faster," you mean{" "}
        <M>{`\\Theta`}</M>.
      </div>
    </div>
  );
}

function GrowthClasses() {
  return (
    <div className="prose">
      <p>
        A handful of growth classes cover almost everything you will meet. Ranked from cheapest to
        most ruinous:
      </p>
      <ul>
        <li><strong><M>{`O(1)`}</M> constant</strong> — hash lookup, array index. Input size is irrelevant.</li>
        <li><strong><M>{`O(\\log n)`}</M> logarithmic</strong> — binary search. Each step halves the problem.</li>
        <li><strong><M>{`O(n)`}</M> linear</strong> — one pass over the data.</li>
        <li><strong><M>{`O(n \\log n)`}</M> linearithmic</strong> — the best comparison sorts (merge, heap, quick avg).</li>
        <li><strong><M>{`O(n^2)`}</M> quadratic</strong> — nested loops, naive pairwise checks.</li>
        <li><strong><M>{`O(2^n)`}</M> exponential</strong> — trying every subset; brute-force satisfiability.</li>
      </ul>
      <p>
        The gaps between these are not academic. Suppose one operation takes a nanosecond. For{" "}
        <M>{`n = 60`}</M>, a linear algorithm finishes in 60 ns, an <M>{`n^2`}</M> one in 3.6 µs — and
        a <M>{`2^n`}</M> one takes <M>{`2^{60}`}</M> ns, which is about <strong>36 years</strong>.
        Adding one element to that last input <em>doubles</em> the runtime.
      </p>
      <MBlock>{`O(1) < O(\\log n) < O(n) < O(n\\log n) < O(n^2) < O(2^n) < O(n!)`}</MBlock>
      <Code
        lang="ts"
        filename="growth.ts"
        code={`// Same task (does the array contain a duplicate?) at two complexities.
function hasDupQuadratic(a: number[]): boolean {   // O(n^2) time, O(1) space
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      if (a[i] === a[j]) return true;
  return false;
}
function hasDupLinear(a: number[]): boolean {      // O(n) time, O(n) space
  const seen = new Set<number>();
  for (const x of a) { if (seen.has(x)) return true; seen.add(x); }
  return false;
}`}
      />
      <div className="notice">
        <span className="lbl">Log base doesn't matter</span>
        Inside Big-O, <M>{`\\log_2 n`}</M> and <M>{`\\log_{10} n`}</M> differ only by a constant
        factor (<M>{`\\log_2 n = \\log_2 10 \\cdot \\log_{10} n`}</M>), so we just write{" "}
        <M>{`O(\\log n)`}</M> with no base. That's why binary search on a billion items is only ~30
        steps.
      </div>
    </div>
  );
}

function Amortized() {
  return (
    <div className="prose">
      <p>
        Some operations are usually cheap but occasionally expensive, and analyzing only the
        expensive case overstates the true cost. <strong>Amortized analysis</strong> spreads the cost
        of the rare expensive operations across the many cheap ones to find the <em>average cost per
        operation over a whole sequence</em> — a real guarantee, not a probabilistic one.
      </p>
      <p>
        The canonical example is a <strong>dynamic array</strong> (JavaScript's <code>Array</code>,
        C++'s <code>vector</code>). Appending is <M>{`O(1)`}</M> while there is spare capacity, but
        when the backing buffer is full a push must allocate a bigger buffer and <em>copy every
        existing element</em> — an <M>{`O(n)`}</M> event. If we grow by <strong>doubling</strong>,
        those copies are rare enough that the average still comes out to <M>{`O(1)`}</M>.
      </p>

      <h3>Amortized Methods: Aggregate, Accounting, and Physicist</h3>
      <p>
        Amortized analysis can be conducted using three primary methods:
      </p>
      <ul>
        <li>
          <strong>Aggregate Method</strong>: Calculate the total cost <M>{`T(k)`}</M> of a sequence of <M>{`k`}</M> operations, and divide by <M>{`k`}</M> to find the amortized cost per operation: <M>{`T_a = T(k)/k`}</M>. 
          As derived below, <M>{`k`}</M> dynamic array pushes cost <M>{`O(k)`}</M> total, giving <M>{`O(1)`}</M> amortized cost.
        </li>
        <li>
          <strong>Accounting (Banker's) Method</strong>: Assign an artificial amortized charge <M>{`c_i`}</M> to each operation. 
          If the actual cost <M>{`a_i`}</M> is less than <M>{`c_i`}</M>, store the excess "credit" in a bank. 
          For expensive operations where <M>{`a_i > c_i`}</M>, draw from this credit pool to pay the difference. 
          We must ensure the bank balance never drops below zero:
          <MBlock>{`\\sum_{i=1}^k c_i \\ge \\sum_{i=1}^k a_i`}</MBlock>
        </li>
        <li>
          <strong>Physicist's (Potential) Method</strong>: Define a potential function <M>{`\\Phi`}</M> mapping states of the data structure to real numbers. 
          The amortized cost of the <M>{`i`}</M>-th operation is:
          <MBlock>{`c_i = a_i + \\Phi(S_i) - \\Phi(S_{i-1})`}</MBlock>
          If the potential increases, the operation stores energy; if it decreases, the potential is released to pay for expensive actions.
        </li>
      </ul>

      <p>
        Count the copies to insert <M>{`n = 2^k`}</M> items. Resizes happen at sizes{" "}
        <M>{`1, 2, 4, \\ldots, n`}</M>, copying that many elements each time. The total copy work is a
        geometric series:
      </p>
      <MBlock>{`1 + 2 + 4 + \\cdots + n = \\sum_{i=0}^{k} 2^i = 2n - 1 < 2n = O(n)`}</MBlock>
      <p>
        So <M>{`n`}</M> pushes cost <M>{`O(n)`}</M> <em>total</em>, i.e. <M>{`O(1)`}</M>{" "}
        <strong>amortized</strong> each. The magic is the multiplicative growth: doubling makes the
        expensive events exponentially rarer as the array grows. Growing by a fixed{" "}
        <em>additive</em> chunk instead (say +10 each time) gives <M>{`\\Theta(n^2)`}</M> total copies
        — a classic performance trap.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Doubling (good)", lang: "ts", filename: "vec.ts",
            code: `class Vec {
  private buf = new Array<number>(1);
  private len = 0;
  push(x: number) {
    if (this.len === this.buf.length) {       // full: double capacity
      const bigger = new Array<number>(this.buf.length * 2);
      for (let i = 0; i < this.len; i++) bigger[i] = this.buf[i]; // O(n) copy
      this.buf = bigger;
    }
    this.buf[this.len++] = x;                  // O(1) amortized overall
  }
}`,
          },
          {
            label: "Additive (bad)", lang: "ts", filename: "slow.ts",
            code: `// Growing by a constant chunk copies ~n/step elements every step:
// total copies = 10 + 20 + 30 + ... + n  =  Theta(n^2).  Avoid this.
if (this.len === this.buf.length) {
  const bigger = new Array<number>(this.buf.length + 10); // +10, not *2
  /* ...copy... */
}`,
          },
        ]}
      />
      <div className="notice warn">
        <span className="lbl">Amortized ≠ average-case</span>
        Amortized is a <em>worst-case</em> statement about a <em>sequence</em>: any <M>{`n`}</M>{" "}
        pushes cost <M>{`O(n)`}</M>, guaranteed, no probability involved. A single individual push can
        still be <M>{`O(n)`}</M> — which matters for latency-sensitive code where one slow frame is
        unacceptable.
      </div>
    </div>
  );
}

function SpaceComplexity() {
  return (
    <div className="prose">
      <p>
        Time is only half the budget. <strong>Space complexity</strong> counts the extra memory an
        algorithm needs as a function of <M>{`n`}</M> — usually the <em>auxiliary</em> space,
        excluding the input itself (which you had to store anyway).
      </p>
      <p>
        Reversing an array in place uses <M>{`O(1)`}</M> auxiliary space (a couple of index
        variables). Building a new reversed copy uses <M>{`O(n)`}</M>. Recursion is sneaky: each
        pending call frame lives on the call stack, so a recursion of depth <M>{`d`}</M> costs{" "}
        <M>{`O(d)`}</M> space even if it allocates nothing. Naive recursive Fibonacci is{" "}
        <M>{`O(2^n)`}</M> <em>time</em> but only <M>{`O(n)`}</M> <em>space</em>, because the call tree
        is deep but explored one branch at a time.
      </p>
      <MBlock>{`\\text{merge sort: } \\Theta(n \\log n) \\text{ time},\\; \\Theta(n) \\text{ space} \\qquad \\text{heap sort: } \\Theta(n \\log n) \\text{ time},\\; \\Theta(1) \\text{ space}`}</MBlock>
      <p>
        This is a genuine trade-off you will make constantly: the linear-time duplicate check from
        the growth-classes lesson buys its speed with an <M>{`O(n)`}</M> hash set, while the quadratic
        one uses <M>{`O(1)`}</M> memory. On a memory-constrained device the "slower" one might be the
        only one that fits.
      </p>
      <Code
        lang="ts"
        filename="space.ts"
        code={`function reverseInPlace(a: number[]): void {   // O(1) auxiliary space
  let i = 0, j = a.length - 1;
  while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; }
}
function reverseCopy(a: number[]): number[] {  // O(n) auxiliary space
  const out = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[a.length - 1 - i];
  return out;
}`}
      />
      <div className="notice">
        <span className="lbl">Watch the hidden allocations</span>
        Slicing, spreading (<code>[...arr]</code>), and mapping all allocate <M>{`O(n)`}</M> memory.
        A function that "looks" in-place but calls <code>arr.slice()</code> inside a loop can quietly
        become <M>{`O(n^2)`}</M> in space and time.
      </div>
    </div>
  );
}

export const dsaComplexity: Module = {
  id: "dsa-complexity",
  title: "Complexity & Big-O",
  icon: "📈",
  track: "dsa",
  blurb:
    "How to measure the cost of an algorithm independent of hardware — Big-O/Ω/Θ, the growth classes, amortized analysis, and space.",
  dependsOn: [],
  lessons: [
    {
      id: "what-is-complexity", title: "What Complexity Means", minutes: 11,
      summary: "Counting operations as a function of input size — and why seconds lie.",
      Body: WhatIsComplexity,
      quiz: {
        questions: [
          { q: "Why don't we measure algorithm cost in wall-clock seconds?", choices: ["Seconds are hard to read", "It depends on hardware, compiler, and the specific input", "Algorithms have no runtime", "Seconds are always the same everywhere"], answer: 1, explain: "Wall-clock time is not portable — it varies by machine and input. Complexity counts operations vs input size instead." },
          { q: "Doubling n makes a quadratic algorithm's work grow by a factor of…", choices: ["2", "3", "4", "8"], answer: 2, explain: "(2n)²/n² = 4. Quadratic work quadruples when the input doubles." },
          { q: "By default, 'complexity' refers to which case?", choices: ["Best case", "Average case", "Worst case", "A random case"], answer: 2, explain: "Unless stated otherwise, we analyze the worst case — the guarantee that holds for any input of size n." },
        ],
      },
      exercises: [
        {
          id: "ratio", kind: "numeric",
          prompt: "An O(n log n) algorithm takes 100 ms on n = 1,000,000. Roughly how many ms on n = 2,000,000? (Use T(2n)/T(n) = 2·(log 2n / log n); with log base 2 and n = 2^20, that ratio is 2·21/20 = 2.1.) Enter the ms.",
          starter: "", hint: "100 × 2.1.",
          validate: (s) => Math.abs(parseFloat(s) - 210) < 0.01 ? { pass: true, message: "Correct — 100 × 2.1 = 210 ms. Linearithmic barely beats a clean doubling." } : { pass: false, message: "Not quite. Multiply 100 by the ratio 2.1." },
        },
      ],
    },
    {
      id: "big-o-formal", title: "Big-O, Ω, and Θ Formally", minutes: 13,
      summary: "The (c, n₀) definitions of the three asymptotic bounds.",
      Body: BigOFormal,
      quiz: {
        questions: [
          { q: "T(n) = O(g(n)) means there exist c, n₀ such that…", choices: ["T(n) = c·g(n) exactly", "T(n) ≥ c·g(n) for all n ≥ n₀", "0 ≤ T(n) ≤ c·g(n) for all n ≥ n₀", "T(n) < g(n) for all n"], answer: 2, explain: "Big-O is an upper bound: past n₀, T is at most a constant multiple of g." },
          { q: "For T(n) = 3n² + 5n + 100, the tight bound is…", choices: ["Θ(n)", "Θ(n²)", "Θ(n³)", "Θ(n log n)"], answer: 1, explain: "The n² term dominates, so T = Θ(n²). It's also O(n³), but that ceiling isn't tight." },
          { q: "Which is the strongest (most precise) claim?", choices: ["T = O(n²)", "T = Ω(n²)", "T = Θ(n²)", "They're equally precise"], answer: 2, explain: "Θ asserts both an upper and lower bound — a tight description of the growth rate." },
        ],
      },
      exercises: [
        {
          id: "witness", kind: "numeric",
          prompt: "For T(n) = 2n + 7, we claim T(n) ≤ 3n for all n ≥ n₀ (so T = O(n) with c = 3). What is the smallest integer n₀ that works?",
          starter: "", hint: "Solve 2n + 7 ≤ 3n, i.e. n ≥ 7.",
          validate: (s) => Math.abs(parseFloat(s) - 7) < 0.01 ? { pass: true, message: "Correct — 2n + 7 ≤ 3n ⇔ n ≥ 7, so n₀ = 7." } : { pass: false, message: "Solve 2n + 7 ≤ 3n for n." },
        },
      ],
    },
    {
      id: "growth-classes", title: "The Growth Classes", minutes: 12,
      summary: "O(1) through O(2ⁿ), and how brutally the gaps widen.",
      Body: GrowthClasses,
      quiz: {
        questions: [
          { q: "Which ordering is correct, cheapest first?", choices: ["O(n) < O(log n) < O(n log n)", "O(log n) < O(n) < O(n log n) < O(n²)", "O(1) < O(n²) < O(n log n)", "O(2ⁿ) < O(n²) < O(n)"], answer: 1, explain: "log n < n < n log n < n². Constants aside, this is the standard ladder." },
          { q: "Binary search on a billion elements takes about how many steps?", choices: ["~1000", "~1,000,000", "~30", "~1,000,000,000"], answer: 2, explain: "log₂(10⁹) ≈ 30. Each step halves the search space — that's the power of O(log n)." },
          { q: "Why do we write O(log n) with no base?", choices: ["Base 10 is standard", "Logs of different bases differ only by a constant factor", "The base is always 2", "Bases don't exist in CS"], answer: 1, explain: "Changing base multiplies by a constant, which Big-O absorbs." },
        ],
      },
      exercises: [
        {
          id: "steps", kind: "numeric",
          prompt: "How many halving steps does binary search need in the worst case on a sorted array of 1024 elements? Enter the number.",
          starter: "", hint: "log₂(1024).",
          validate: (s) => Math.abs(parseFloat(s) - 10) < 0.01 ? { pass: true, message: "Correct — log₂(1024) = 10." } : { pass: false, message: "1024 = 2^k. Find k." },
        },
      ],
    },
    {
      id: "amortized", title: "Amortized Analysis", minutes: 13,
      summary: "Why doubling makes dynamic-array push O(1) on average.",
      Body: Amortized,
      quiz: {
        questions: [
          { q: "Inserting n items into a doubling dynamic array costs how much total copy work?", choices: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 2, explain: "The copies form a geometric series 1 + 2 + ... + n = 2n − 1 = O(n), so O(1) amortized per push." },
          { q: "Growing the buffer by a fixed +k each time instead of doubling makes n pushes cost…", choices: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], answer: 2, explain: "Additive growth copies ~n/k elements per resize, summing to Θ(n²). Always grow multiplicatively." },
          { q: "'O(1) amortized' means…", choices: ["Every single push is O(1)", "Any sequence of n pushes costs O(n) total, guaranteed", "Pushes are O(1) on average with some probability", "Pushes are usually O(n)"], answer: 1, explain: "Amortized is a worst-case guarantee over a sequence, not a probabilistic average. Individual pushes may still be O(n)." },
        ],
      },
      exercises: [
        {
          id: "copies", kind: "numeric",
          prompt: "A doubling array starts at capacity 1. Inserting 16 items triggers resizes at sizes 1, 2, 4, 8. What is the TOTAL number of element copies performed across all resizes?",
          starter: "", hint: "1 + 2 + 4 + 8.",
          validate: (s) => Math.abs(parseFloat(s) - 15) < 0.01 ? { pass: true, message: "Correct — 1 + 2 + 4 + 8 = 15 (= 2·16 − 17... i.e. 2n − 1 with the last resize before 16)." } : { pass: false, message: "Sum the copies at each resize: 1 + 2 + 4 + 8." },
        },
      ],
    },
    {
      id: "space-complexity", title: "Space Complexity", minutes: 11,
      summary: "Auxiliary memory, recursion depth, and the time/space trade-off.",
      Body: SpaceComplexity,
      quiz: {
        questions: [
          { q: "Reversing an array in place uses how much auxiliary space?", choices: ["O(n)", "O(log n)", "O(1)", "O(n²)"], answer: 2, explain: "Two index variables — O(1). Building a reversed copy would be O(n)." },
          { q: "A recursion of depth d that allocates nothing still costs how much space?", choices: ["O(1)", "O(d) for the call stack", "O(2^d)", "None"], answer: 1, explain: "Each pending call frame lives on the stack, so depth-d recursion is O(d) space." },
          { q: "The linear-time duplicate check (with a hash set) vs the quadratic one is an example of…", choices: ["A bug", "A time/space trade-off", "Amortization", "Big-Omega"], answer: 1, explain: "The faster O(n)-time version pays with O(n) memory; the O(1)-space version pays with O(n²) time." },
        ],
      },
      exercises: [
        {
          id: "space-open", kind: "open",
          prompt: "Naive recursive Fibonacci is O(2ⁿ) in time. Explain why its space complexity is only O(n), referencing how the call tree is explored.",
          starter: "",
          rubric: "Full credit: explains that although the call tree has ~2ⁿ nodes, the recursion explores one root-to-leaf path at a time (depth-first), so at most n frames are on the call stack simultaneously — hence O(n) space. Partial: mentions call-stack depth OR that only one branch is active but not both clearly.",
          hint: "How many call frames are alive on the stack at once versus how many total calls happen?",
        },
      ],
    },
  ],
};
