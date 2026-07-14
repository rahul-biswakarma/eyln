import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";
import { Notice } from "../../components/ui";
function Recursion() {
    return (<div className="prose">
      <p>
        <strong>Recursion</strong> solves a problem by reducing it to a smaller instance of itself. Two parts
        are non-negotiable: a <strong>base case</strong> that stops the descent, and a{" "}
        <strong>recursive case</strong> that makes progress toward it. Omit or mis-state either and you get
        infinite recursion — a stack overflow.
      </p>
      <p>
        Under the hood, each call pushes a <strong>stack frame</strong> holding its arguments and where to
        return. The frames form the <strong>call stack</strong>; recursion is just an implicit stack the
        language manages for you. That is why recursion depth is bounded by stack size, and why deep recursion
        can crash where an iterative loop would not.
      </p>
      <Code lang="ts" filename="factorial.ts" code={`function factorial(n: number): number {
  if (n <= 1) return 1;          // base case — stops the recursion
  return n * factorial(n - 1);   // recursive case — smaller input
}
// factorial(3) = 3 * factorial(2) = 3 * (2 * factorial(1)) = 3 * 2 * 1`}/>
      <p>
        We reason about a recursive algorithm's cost with a <strong>recurrence relation</strong> — an equation
        expressing <M>{`T(n)`}</M> in terms of smaller inputs. Factorial does <M>{`O(1)`}</M> work per call and
        recurses once on <M>{`n-1`}</M>:
      </p>
      <MBlock>{`T(n) = T(n-1) + O(1) = O(n)`}</MBlock>
      <p>
        A subtle case is <strong>tail recursion</strong>, where the recursive call is the very last action.
        Some languages optimize it into a loop with no stack growth, but JavaScript engines generally do{" "}
        <em>not</em>, so deep tail recursion still overflows in practice.
      </p>

      <h3>Proving Recursive Correctness by Strong Induction</h3>
      <p>
        A recursive function is not "obviously" correct because it calls itself — that reasoning looks
        circular. The rigorous tool that breaks the circle is <strong>strong induction</strong>, and the
        structure of the proof mirrors the structure of the code exactly. To prove that{" "}
        <M>{`\\texttt{factorial}(n) = n!`}</M> for all <M>{`n \\ge 0`}</M>:
      </p>
      <ul>
        <li>
          <strong>Base case</strong>: for <M>{`n \\le 1`}</M> the function returns <M>{`1`}</M>, and
          indeed <M>{`0! = 1! = 1`}</M>. The claim holds outright at the bottom of the recursion.
        </li>
        <li>
          <strong>Inductive hypothesis</strong>: assume the function is correct for <em>every</em> input
          strictly smaller than <M>{`n`}</M> — in particular <M>{`\\texttt{factorial}(n-1) = (n-1)!`}</M>.
          "Strong" means we may assume <em>all</em> smaller cases, not merely the immediately preceding one.
        </li>
        <li>
          <strong>Inductive step</strong>: the recursive case returns{" "}
          <M>{`n \\cdot \\texttt{factorial}(n-1)`}</M>, which by the hypothesis equals{" "}
          <M>{`n \\cdot (n-1)! = n!`}</M>. The claim propagates from smaller inputs to <M>{`n`}</M>.
        </li>
      </ul>
      <MBlock>{`\\underbrace{P(0),\\,P(1)}_{\\text{base}} \\;\\wedge\\; \\big(\\forall k < n:\\ P(k)\\big) \\implies P(n) \\;\\;\\Longrightarrow\\;\\; \\forall n \\ge 0:\\ P(n)`}</MBlock>
      <p>
        The induction is <strong>well-founded</strong> only because each recursive call is on a strictly
        smaller argument that provably reaches a base case — the same condition that guarantees termination.
        Correctness and termination are two sides of one requirement: a <strong>decreasing measure</strong>{" "}
        (here <M>{`n`}</M> itself) that is bounded below. This is why "does every call move toward the base
        case?" is not just a debugging heuristic but the hinge of the correctness proof.
      </p>

      <h3>Tail vs. Non-Tail Recursion and O(d) Stack Space</h3>
      <p>
        Every un-returned call holds a live stack frame, so the space a recursion consumes is set by the
        maximum depth <M>{`d`}</M> of simultaneously-open frames, not by the total number of calls. For a
        linear recursion like factorial, <M>{`d = n`}</M>, giving:
      </p>
      <MBlock>{`S(n) = \\Theta(d) = \\Theta(n) \\text{ stack space}`}</MBlock>
      <p>
        The distinction between tail and non-tail recursion is precisely whether that frame is still needed:
      </p>
      <ul>
        <li>
          <strong>Non-tail</strong>: <M>{`n \\cdot \\texttt{factorial}(n-1)`}</M> must keep the caller's
          frame alive to perform the multiplication <em>after</em> the callee returns. The <M>{`n`}</M>{" "}
          pending multiplications stack up — genuine <M>{`\\Theta(n)`}</M> space.
        </li>
        <li>
          <strong>Tail</strong>: the recursive call is the entire return value, so the caller's frame has
          no remaining work. A compiler performing <strong>tail-call elimination</strong> can reuse the
          single frame in place, collapsing the space to <M>{`\\Theta(1)`}</M> — the recursion becomes a loop.
        </li>
      </ul>
      <Code lang="ts" filename="tail-factorial.ts" code={`// Tail-recursive: an accumulator carries the running product,
// so nothing is pending after the recursive call returns.
function factTail(n: number, acc = 1): number {
  if (n <= 1) return acc;          // base case returns the answer directly
  return factTail(n - 1, acc * n); // recursive call IS the return value
}
// Semantically Theta(1) stack, but V8 does not eliminate tail calls,
// so in practice this still grows the stack Theta(n). Rewrite as a loop
// when depth may be large.`}/>
      <p>
        The general rule: recursion depth <M>{`d`}</M> is the hidden space cost. A balanced divide-and-conquer
        recurses to depth <M>{`\\Theta(\\log n)`}</M> (cheap), but a recursion that peels one element at a
        time reaches depth <M>{`\\Theta(n)`}</M> and can overflow the call stack where an <M>{`O(1)`}</M>-space
        loop would not.
      </p>

      <Notice warn>
        <span className="lbl">Gotcha: the missing base case</span>
        The most common recursion bug is a base case that is never reached — e.g. recursing on <code>n</code>{" "}
        instead of <code>n - 1</code>, or forgetting negative inputs. Always check that every recursive call
        strictly moves toward a base case.
      </Notice>
    </div>);
}
function DivideConquer() {
    return (<div className="prose">
      <p>
        <strong>Divide and conquer</strong> splits a problem into <M>{`a`}</M> subproblems each of size{" "}
        <M>{`n/b`}</M>, solves them recursively, and combines the results in <M>{`f(n)`}</M> time. Merge sort,
        quicksort, and binary search are all instances. Their costs follow one recurrence:
      </p>
      <MBlock>{`T(n) = a\\,T(n/b) + f(n)`}</MBlock>

      <h3>The Master Theorem Recurrence Cases</h3>
      <p>
        The <strong>Master Theorem</strong> provides a recipe to solve recurrences of the form <M>{`T(n) = a\\,T(n/b) + f(n)`}</M> (where <M>{`a \\ge 1`}</M> and <M>{`b > 1`}</M>) by comparing the work done splitting/combining <M>{`f(n)`}</M> against the recursive division tree leaf-level work <M>{`n^{\\log_b a}`}</M>:
      </p>
      <ul>
        <li>
          <strong>Case 1 (Leaf-Heavy / Bottom-Heavy)</strong>: 
          If <M>{`f(n) = O(n^{\\log_b a - \\epsilon})`}</M> for some constant <M>{`\\epsilon > 0`}</M>, then:
          <MBlock>{`T(n) = \\Theta\\left(n^{\\log_b a}\\right)`}</MBlock>
          Here, recursive calls at the leaves dominate the overall cost.
        </li>
        <li>
          <strong>Case 2 (Balanced)</strong>: 
          If <M>{`f(n) = \\Theta(n^{\\log_b a} \\log^k n)`}</M> for some constant <M>{`k \\ge 0`}</M>, then:
          <MBlock>{`T(n) = \\Theta\\left(n^{\\log_b a} \\log^{k+1} n\\right)`}</MBlock>
          The work is evenly distributed across all levels of the recursion tree. For the standard case <M>{`k = 0`}</M> where <M>{`f(n) = \\Theta(n^{\\log_b a})`}</M>, we get <M>{`T(n) = \\Theta(n^{\\log_b a} \\log n)`}</M>.
        </li>
        <li>
          <strong>Case 3 (Root-Heavy / Top-Heavy)</strong>: 
          If <M>{`f(n) = \\Omega(n^{\\log_b a + \\epsilon})`}</M> for some constant <M>{`\\epsilon > 0`}</M>, and if the regularity condition holds (meaning <M>{`a\\,f(n/b) \\le c\\,f(n)`}</M> for some constant <M>{`c < 1`}</M> and all sufficiently large <M>{`n`}</M>), then:
          <MBlock>{`T(n) = \\Theta(f(n))`}</MBlock>
          Here, the work at the root (splitting and combining) dominates.
        </li>
      </ul>

      <p>
        Merge sort has <M>{`a = 2, b = 2, f(n) = O(n)`}</M>, so <M>{`n^{\\log_2 2} = n`}</M> matches
        <M>{` f(n)`}</M> — Case 2 (<M>{`k = 0`}</M>) — giving the familiar <M>{`\\Theta(n \\log n)`}</M>. Binary search has
        <M>{` a = 1, b = 2, f(n) = O(1)`}</M>: <M>{`n^{\\log_2 1} = n^0 = 1`}</M> matches, Case 2 (<M>{`k = 0`}</M>), giving
        <M>{` \\Theta(\\log n)`}</M>.
      </p>
      <Code lang="ts" filename="maxsub.ts" code={`// Divide and conquer: max element via a=2, b=2, f(n)=O(1) combine.
function maxOf(a: number[], lo: number, hi: number): number {
  if (lo === hi) return a[lo];               // base case
  const mid = (lo + hi) >> 1;
  const left = maxOf(a, lo, mid);            // T(n/2)
  const right = maxOf(a, mid + 1, hi);       // T(n/2)
  return Math.max(left, right);              // O(1) combine
}
// T(n) = 2T(n/2) + O(1) -> Case 1 -> O(n)`}/>
      <h3>The Recursion Tree Method: Summing Per-Level Work</h3>
      <p>
        The Master Theorem is a shortcut; the <strong>recursion tree</strong> is the machinery underneath it,
        and it works even when the theorem does not apply. The idea is to draw the tree of calls, compute the
        total work done at each <em>level</em>, then sum over levels. For <M>{`T(n) = a\\,T(n/b) + f(n)`}</M>:
      </p>
      <ul>
        <li>
          <strong>Level <M>{`i`}</M> node count</strong>: the root spawns <M>{`a`}</M> children, each of
          which spawns <M>{`a`}</M> more, so level <M>{`i`}</M> holds <M>{`a^i`}</M> nodes.
        </li>
        <li>
          <strong>Subproblem size at level <M>{`i`}</M></strong>: each division by <M>{`b`}</M> shrinks the
          input, so a level-<M>{`i`}</M> node handles size <M>{`n/b^i`}</M> and does <M>{`f(n/b^i)`}</M> work.
        </li>
        <li>
          <strong>Tree height</strong>: the size hits the base case when <M>{`n/b^i = 1`}</M>, i.e. at level{" "}
          <M>{`i = \\log_b n`}</M>. The bottom level holds <M>{`a^{\\log_b n} = n^{\\log_b a}`}</M> leaves.
        </li>
      </ul>
      <p>
        Total cost is the sum of per-level work down the tree plus the leaf work:
      </p>
      <MBlock>{`T(n) = \\sum_{i=0}^{\\log_b n - 1} a^i\\, f\\!\\left(\\frac{n}{b^i}\\right) + \\Theta\\!\\left(n^{\\log_b a}\\right)`}</MBlock>
      <p>
        The three Master Theorem cases are just which end of this sum wins. Take merge sort with{" "}
        <M>{`a = b = 2`}</M> and <M>{`f(n) = cn`}</M>: level <M>{`i`}</M> does{" "}
        <M>{`2^i \\cdot c\\,(n/2^i) = cn`}</M> work — the <em>same</em> at every level. With{" "}
        <M>{`\\log_2 n`}</M> levels each costing <M>{`cn`}</M>, the sum is the balanced Case 2 result:
      </p>
      <MBlock>{`T(n) = \\sum_{i=0}^{\\log_2 n} cn = cn\\,(\\log_2 n + 1) = \\Theta(n \\log n)`}</MBlock>
      <p>
        When per-level work <em>grows</em> down the tree, the leaves dominate (Case 1); when it{" "}
        <em>shrinks</em>, the root dominates and the sum is a geometric series bounded by its first term
        (Case 3). Drawing the tree tells you which before you reach for any formula.
      </p>

      <Notice>
        <span className="lbl">Reading the recurrence</span>
        The three numbers you need are <M>{`a`}</M> (how many subproblems), <M>{`b`}</M> (the shrink factor),
        and <M>{`f(n)`}</M> (combine cost). Compare <M>{`f(n)`}</M> to <M>{`n^{\\log_b a}`}</M> and pick the
        case — that is the whole method.
      </Notice>
    </div>);
}
function Memoization() {
    return (<div className="prose">
      <p>
        Naive recursion can be catastrophically slow when it re-solves the same subproblem over and over. The
        Fibonacci recurrence <M>{`F(n) = F(n-1) + F(n-2)`}</M> is the poster child: computed directly, it makes
        <M>{` O(\\varphi^n)`}</M> calls — exponential — because <M>{`F(n-2)`}</M> is recomputed in both
        branches, and so on down the tree.
      </p>
      <p>
        <strong>Memoization</strong> is <strong>top-down dynamic programming</strong>: keep the natural
        recursive structure, but cache each result the first time you compute it and return the cached value on
        every later request. This works whenever a problem has <strong>overlapping subproblems</strong> (the
        same sub-instances recur) and <strong>optimal substructure</strong> (the answer is built from
        sub-answers).
      </p>
      <Code lang="ts" filename="fib-memo.ts" code={`function fib(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return n;                    // base cases
  const hit = memo.get(n);
  if (hit !== undefined) return hit;       // cached — no recomputation
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);                     // store before returning
  return result;
}`}/>
      <p>
        The payoff is dramatic. Each of the <M>{`n`}</M> distinct subproblems is computed once and cached, so
        the work collapses from exponential to:
      </p>
      <MBlock>{`O(\\varphi^n) \\;\\longrightarrow\\; O(n) \\text{ time},\\quad O(n) \\text{ space}`}</MBlock>
      <p>
        The recipe generalizes: (1) write the correct recurrence, (2) identify the subproblem's parameters
        (here, just <M>{`n`}</M>), (3) cache on those parameters. The number of distinct parameter combinations
        times the work per subproblem is your runtime.
      </p>
      <Notice warn>
        <span className="lbl">Gotcha: cache key must capture the full state</span>
        Memoization is only correct if the cache key includes <em>every</em> parameter that affects the result.
        Cache on <code>n</code> alone when the answer also depends on a second index, and you will serve wrong
        cached values.
      </Notice>
    </div>);
}
function Tabulation() {
    return (<div className="prose">
      <p>
        <strong>Tabulation</strong> is <strong>bottom-up dynamic programming</strong>: instead of recursing
        from the top and caching, you fill a table starting from the base cases and building up, so that every
        subproblem a cell depends on is already computed when you reach it. No recursion, no call stack — just
        loops over a table.
      </p>
      <p>
        Consider <strong>coin change</strong>: given coin denominations and an amount, find the fewest coins
        that sum to it. Let <M>{`dp[x]`}</M> be the minimum coins for amount <M>{`x`}</M>. Then:
      </p>
      <MBlock>{`dp[x] = \\min_{\\text{coin } c \\le x} \\big(dp[x - c] + 1\\big),\\quad dp[0] = 0`}</MBlock>
      <CodeTabs tabs={[
            {
                label: "coin change",
                lang: "ts",
                code: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                  // base case
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x && dp[x - c] + 1 < dp[x]) {
        dp[x] = dp[x - c] + 1;                // build up from smaller amounts
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
// Time O(amount * coins), space O(amount).`,
            },
            {
                label: "0/1 knapsack",
                lang: "ts",
                code: `function knapsack(w: number[], v: number[], cap: number): number {
  const dp = new Array(cap + 1).fill(0);
  for (let i = 0; i < w.length; i++) {
    // iterate capacity DOWNWARD so each item is used at most once
    for (let c = cap; c >= w[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);
    }
  }
  return dp[cap];
}
// Time O(n * cap), space O(cap).`,
            },
        ]}/>
      <p>
        Top-down and bottom-up compute the same values; the differences are practical. Tabulation avoids
        recursion overhead and stack-overflow risk and often allows <strong>space optimization</strong> (the
        knapsack above keeps a 1-D row instead of a 2-D table). Memoization only computes the subproblems it
        actually needs, which wins when the reachable subproblem set is sparse.
      </p>
      <Notice warn>
        <span className="lbl">Gotcha: iteration direction encodes the constraint</span>
        In 0/1 knapsack, iterating capacity <em>downward</em> ensures each item is used once; iterating upward
        would allow reusing an item — which is actually the (different) <em>unbounded</em> knapsack. The loop
        direction is not cosmetic; it changes the problem.
      </Notice>
    </div>);
}
function Backtracking() {
    return (<div className="prose">
      <p>
        <strong>Backtracking</strong> explores the tree of partial solutions by depth-first recursion: extend
        the current candidate one choice at a time, recurse, and <strong>undo</strong> the choice before trying
        the next. It systematically enumerates combinatorial objects — subsets, permutations, board placements —
        and <strong>prunes</strong> whole branches the moment they cannot lead to a valid solution.
      </p>
      <CodeTabs tabs={[
            {
                label: "subsets",
                lang: "ts",
                code: `function subsets(nums: number[]): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(i: number) {
    if (i === nums.length) { out.push([...path]); return; }
    dfs(i + 1);                 // choice: exclude nums[i]
    path.push(nums[i]);         // choice: include nums[i]
    dfs(i + 1);
    path.pop();                 // UNDO — the backtrack step
  }
  dfs(0);
  return out;                    // 2^n subsets
}`,
            },
            {
                label: "permutations",
                lang: "ts",
                code: `function permutations(nums: number[]): number[][] {
  const out: number[][] = [];
  const used = new Array(nums.length).fill(false);
  const path: number[] = [];
  function dfs() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;    // prune: skip already-used elements
      used[i] = true; path.push(nums[i]);
      dfs();
      used[i] = false; path.pop();   // UNDO
    }
  }
  dfs();
  return out;                    // n! permutations
}`,
            },
        ]}/>
      <p>
        The search space is inherently large — <M>{`2^n`}</M> subsets, <M>{`n!`}</M> permutations — so
        backtracking is exponential in the worst case. Its saving grace is <strong>pruning</strong>: a good
        feasibility check (a partial sum already exceeding the target, a queen already attacked) cuts off entire
        subtrees, so real instances explore far fewer nodes than the bound suggests.
      </p>
      <MBlock>{`\\text{subsets: } O(2^n),\\quad \\text{permutations: } O(n \\cdot n!)`}</MBlock>

      <h3>State-Space Tree Size and Pruning Bounds</h3>
      <p>
        Backtracking's cost is the number of nodes in the <strong>state-space tree</strong> it actually
        visits, times the work per node. Counting nodes exactly gives sharp bounds. For a tree with{" "}
        <strong>branching factor</strong> <M>{`b`}</M> (choices per step) and <strong>depth</strong>{" "}
        <M>{`d`}</M> (steps to a complete candidate), an unpruned search visits a geometric total:
      </p>
      <MBlock>{`N = \\sum_{i=0}^{d} b^i = \\frac{b^{d+1} - 1}{b - 1} = \\Theta(b^d)`}</MBlock>
      <p>
        The exponential in the depth is unavoidable in the worst case — it is the sum being dominated by its
        last, largest level. The two enumeration shapes are special cases:
      </p>
      <ul>
        <li>
          <strong>Subsets</strong>: a binary include/exclude choice at each of <M>{`n`}</M> elements gives{" "}
          <M>{`b = 2`}</M>, <M>{`d = n`}</M>, hence <M>{`\\Theta(2^n)`}</M> leaves — one per subset.
        </li>
        <li>
          <strong>Permutations</strong>: the branching factor <em>shrinks</em> as choices are consumed
          (<M>{`n`}</M> options, then <M>{`n-1`}</M>, …), so the leaf count is{" "}
          <M>{`n \\cdot (n-1) \\cdots 1 = n!`}</M> rather than a fixed <M>{`b^d`}</M>.
        </li>
      </ul>
      <p>
        <strong>Pruning</strong> attacks the exponent, not the constant. If a feasibility test at each node
        eliminates a fraction of the branches so that the <em>effective</em> branching factor drops from{" "}
        <M>{`b`}</M> to <M>{`b'`}</M>, the visited count falls to <M>{`\\Theta(b'^{\\,d})`}</M> — an
        exponential improvement, since it changes the base of the exponent. Bounding <M>{`b'`}</M> is how you
        estimate a pruned search: N-Queens has a naive tree of <M>{`n^n`}</M> placements, but forbidding
        same-column and same-diagonal attacks cuts each level's live branches drastically, so real solvers
        explore vastly fewer than even the <M>{`n!`}</M> column-permutation nodes.
      </p>
      <MBlock>{`\\text{unpruned } \\Theta(b^d) \\;\\xrightarrow{\\text{prune to } b' < b}\\; \\Theta(b'^{\\,d}), \\qquad \\frac{b^d}{b'^{\\,d}} = \\left(\\frac{b}{b'}\\right)^{\\!d} \\text{ speedup}`}</MBlock>
      <p>
        The lesson: because the cost is <M>{`b^d`}</M>, shaving the base <M>{`b`}</M> even slightly compounds
        into an enormous factor at depth <M>{`d`}</M>. That is why a cheap-but-effective feasibility check
        placed as <em>early</em> (as high in the tree) as possible is worth far more than optimizing the
        per-node constant.
      </p>

      <Notice>
        <span className="lbl">The universal shape</span>
        Every backtracker is: <em>choose</em> → <em>recurse</em> → <em>un-choose</em>. Forgetting the un-choose
        (the <code>pop</code> / resetting <code>used</code>) leaks state between branches and is the number-one
        backtracking bug.
      </Notice>
    </div>);
}
export const dsaRecursion: Module = {
    id: "dsa-recursion",
    title: "Recursion & Dynamic Programming",
    icon: "🧠",
    track: "dsa",
    blurb: "From the call stack to the Master Theorem, then memoization, tabulation, and backtracking.",
    dependsOn: ["dsa-trees"],
    lessons: [
        {
            id: "recursion",
            title: "Recursion & the Call Stack",
            minutes: 12,
            summary: "Base and recursive cases, stack frames, and writing recurrences.",
            Body: Recursion,
            quiz: {
                questions: [
                    {
                        q: "Every correct recursive function must have…",
                        choices: [
                            "A loop",
                            "A base case and a recursive case that shrinks toward it",
                            "Exactly two calls",
                            "A global variable",
                        ],
                        answer: 1,
                        explain: "Without a reachable base case the recursion never terminates and overflows the stack.",
                    },
                    {
                        q: "The recurrence T(n) = T(n-1) + O(1) solves to…",
                        choices: ["O(log n)", "O(n)", "O(n^2)", "O(2^n)"],
                        answer: 1,
                        explain: "n levels of O(1) work each is linear — as in factorial.",
                    },
                ],
            },
            exercises: [
                {
                    id: "stack-depth",
                    kind: "numeric",
                    prompt: "factorial(n) recurses once per call down to the base case n <= 1. For factorial(50), how many frames are on the stack at the deepest point (counting the call to factorial(1))? Enter an integer.",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 50) < 0.01
                        ? { pass: true, message: "Correct — frames for n = 50, 49, ..., 1 stack up: 50 frames at maximum depth." }
                        : { pass: false, message: "Not quite. Count the calls from n = 50 down to n = 1 inclusive." },
                    hint: "One frame for each of n = 50, 49, ..., 1.",
                },
            ],
        },
        {
            id: "divide-conquer",
            title: "Divide & Conquer + the Master Theorem",
            minutes: 15,
            summary: "The T(n)=aT(n/b)+f(n) recurrence and its three cases.",
            Body: DivideConquer,
            quiz: {
                questions: [
                    {
                        q: "In the Master Theorem T(n) = a·T(n/b) + f(n), you compare f(n) against…",
                        choices: ["n", "n^(log_b a)", "log n", "a·b"],
                        answer: 1,
                        explain: "The watershed n^(log_b a) is the leaf cost; whether f(n) is smaller, equal, or larger picks the case.",
                    },
                    {
                        q: "Merge sort (a=2, b=2, f(n)=O(n)) falls into which case, giving what result?",
                        choices: [
                            "Case 1, O(n)",
                            "Case 2, O(n log n)",
                            "Case 3, O(n^2)",
                            "Case 1, O(log n)",
                        ],
                        answer: 1,
                        explain: "n^(log_2 2) = n equals f(n) = O(n), so Case 2 gives Θ(n log n).",
                    },
                ],
            },
            exercises: [
                {
                    id: "master-apply",
                    kind: "open",
                    prompt: "An algorithm has recurrence T(n) = 2T(n/2) + O(n^2). Apply the Master Theorem: which case is it, and what is T(n)?",
                    starter: "",
                    rubric: "Full credit: n^(log_2 2) = n^1; f(n) = n^2 grows faster (Ω(n^(1+ε))), so Case 3 applies and T(n) = Θ(n^2). Partial: correct case or answer but not both, or does not compute the watershed.",
                    hint: "Compare f(n) = n^2 to n^(log_b a) = n^1.",
                },
            ],
        },
        {
            id: "memoization",
            title: "Memoization (Top-Down DP)",
            minutes: 14,
            summary: "Caching overlapping subproblems to collapse exponential recursion.",
            Body: Memoization,
            quiz: {
                questions: [
                    {
                        q: "Naive recursive Fibonacci is exponential because it…",
                        choices: [
                            "Uses too much memory",
                            "Recomputes the same subproblems many times",
                            "Has no base case",
                            "Uses a loop",
                        ],
                        answer: 1,
                        explain: "F(n-2) and lower are recomputed across branches; caching each result once fixes it.",
                    },
                    {
                        q: "Dynamic programming applies when a problem has overlapping subproblems and…",
                        choices: ["No base case", "Optimal substructure", "Only one subproblem", "Random inputs"],
                        answer: 1,
                        explain: "Optimal substructure means the overall optimum is built from optimal sub-answers, which DP reuses.",
                    },
                ],
            },
            exercises: [
                {
                    id: "memo-complexity",
                    kind: "open",
                    prompt: "Explain why memoized Fibonacci runs in O(n) time, referring to the number of distinct subproblems and the work per subproblem.",
                    starter: "",
                    rubric: "Full credit: there are n distinct subproblems (fib(0)..fib(n)); each is computed once (subsequent calls hit the cache) doing O(1) work, so total is n × O(1) = O(n). Partial: states O(n) but does not tie it to distinct subproblems × work each.",
                    hint: "Runtime ≈ (number of distinct subproblems) × (work per subproblem).",
                },
            ],
        },
        {
            id: "tabulation",
            title: "Tabulation (Bottom-Up DP)",
            minutes: 15,
            summary: "Filling a table from base cases up — coin change and knapsack.",
            Body: Tabulation,
            quiz: {
                questions: [
                    {
                        q: "Tabulation differs from memoization in that it…",
                        choices: [
                            "Uses recursion and a cache",
                            "Fills a table iteratively from base cases upward, no recursion",
                            "Only works for Fibonacci",
                            "Is always slower",
                        ],
                        answer: 1,
                        explain: "Bottom-up loops compute subproblems in dependency order, avoiding recursion and stack-overflow risk.",
                    },
                    {
                        q: "In 0/1 knapsack with a 1-D table, why iterate capacity downward?",
                        choices: [
                            "It is faster",
                            "So each item is counted at most once (upward would allow reuse)",
                            "To save memory",
                            "It has no effect",
                        ],
                        answer: 1,
                        explain: "Downward iteration reads dp[c - w] from the previous item's row; upward would let the same item be reused.",
                    },
                ],
            },
            exercises: [
                {
                    id: "coin-min",
                    kind: "numeric",
                    prompt: "With coins {1, 3, 4} and amount 6, what is the minimum number of coins? Enter an integer.",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01
                        ? { pass: true, message: "Correct — 3 + 3 = 6 uses 2 coins, beating the greedy 4 + 1 + 1 = 3 coins." }
                        : { pass: false, message: "Not quite. Try combinations; note greedy (4+1+1) is not optimal here." },
                    hint: "Greedy picks 4 first, but 3 + 3 does better.",
                },
            ],
        },
        {
            id: "backtracking",
            title: "Backtracking",
            minutes: 14,
            summary: "Enumerating subsets and permutations with choose/recurse/undo and pruning.",
            Body: Backtracking,
            quiz: {
                questions: [
                    {
                        q: "The defining shape of a backtracking algorithm is…",
                        choices: [
                            "Sort, then scan",
                            "Choose → recurse → un-choose (undo)",
                            "Hash then lookup",
                            "Divide then merge",
                        ],
                        answer: 1,
                        explain: "You make a choice, explore it recursively, then undo it to try the next — the un-choose is essential.",
                    },
                    {
                        q: "How many subsets does a set of n elements have, and how many permutations?",
                        choices: ["n and n", "2^n and n!", "n! and 2^n", "n^2 and n log n"],
                        answer: 1,
                        explain: "Each element is in or out (2^n subsets); orderings of n distinct items number n!.",
                    },
                    {
                        q: "Pruning in backtracking means…",
                        choices: [
                            "Sorting the output",
                            "Abandoning a branch as soon as it cannot yield a valid solution",
                            "Caching results",
                            "Removing duplicate elements",
                        ],
                        answer: 1,
                        explain: "Cutting off infeasible branches early avoids exploring their entire subtrees, the key to practical speed.",
                    },
                ],
            },
        },
    ],
};
