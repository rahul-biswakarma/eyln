import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";
function BinarySearch() {
    return (<div className="prose">
      <p>
        <strong>Binary search</strong> finds a target in a <em>sorted</em> array by repeatedly halving the
        search space. You track a range <M>{`[\\text{lo}, \\text{hi}]`}</M> that is guaranteed to contain the
        answer if it exists, probe the middle, and discard the half that cannot hold it. Each step throws away
        half the candidates, so the runtime is:
      </p>
      <MBlock>{`T(n) = T(n/2) + O(1) = O(\\log n)`}</MBlock>
      <p>
        The elegance hides real danger: binary search is famous for off-by-one bugs. The cure is to fix an
        <strong> invariant</strong> and be consistent about whether your range is inclusive on both ends and
        whether <code>mid</code> has been ruled out.
      </p>
      <Code lang="ts" filename="bsearch.ts" code={`// Inclusive range [lo, hi]. Loop while the range is non-empty.
function binarySearch(a: number[], target: number): number {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {                       // <= because hi is inclusive
    const mid = lo + ((hi - lo) >> 1);     // avoids lo+hi overflow
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;     // mid ruled out, go right
    else hi = mid - 1;                     // mid ruled out, go left
  }
  return -1;                                // not found
}`}/>
      <p>
        Two details prevent classic bugs. Computing <code>mid</code> as <code>lo + (hi - lo) / 2</code> rather
        than <code>(lo + hi) / 2</code> avoids integer overflow in fixed-width languages. And every branch
        must <em>shrink</em> the range — writing <code>lo = mid</code> instead of <code>mid + 1</code> can
        loop forever.
      </p>
      <h3>Loop Invariant, Correctness &amp; Termination</h3>
      <p>
        Correctness of binary search is a textbook exercise in <strong>loop invariants</strong>. Fix the
        claim we maintain before every iteration of the <code>while</code> loop:
      </p>
      <MBlock>{`\\textbf{Invariant: } \\text{if } target \\in a, \\text{ then its index lies in } [\\text{lo}, \\text{hi}].`}</MBlock>
      <ul>
        <li>
          <strong>Initialization.</strong> Before the first iteration <M>{`\\text{lo} = 0`}</M> and{" "}
          <M>{`\\text{hi} = n-1`}</M>, so the range is the entire array and the invariant holds trivially.
        </li>
        <li>
          <strong>Maintenance.</strong> Assume the invariant holds and let <M>{`m = \\text{mid}`}</M>. Because{" "}
          <M>{`a`}</M> is sorted, <M>{`a[m] < target`}</M> implies every index <M>{`\\le m`}</M> holds a value{" "}
          <M>{`\\le a[m] < target`}</M>, so the target (if present) must lie in <M>{`[m+1, \\text{hi}]`}</M> —
          exactly the range we keep by setting <M>{`\\text{lo} = m+1`}</M>. The symmetric argument justifies{" "}
          <M>{`\\text{hi} = m-1`}</M>. The invariant survives the iteration.
        </li>
        <li>
          <strong>Termination.</strong> The loop ends either by returning <M>{`m`}</M> (found), or when{" "}
          <M>{`\\text{lo} > \\text{hi}`}</M>, i.e. an empty range. By the invariant an empty range means the
          target is absent, so returning <M>{`-1`}</M> is correct.
        </li>
      </ul>
      <p>
        Termination is guaranteed by a <strong>decreasing variant</strong>: the quantity{" "}
        <M>{`\\text{hi} - \\text{lo} + 1`}</M> (the range size) is a non-negative integer that strictly
        decreases each iteration, because both <M>{`\\text{lo} = m+1`}</M> and <M>{`\\text{hi} = m-1`}</M> move
        past <M>{`m`}</M>. A strictly decreasing non-negative integer cannot fall forever, so the loop halts —
        after at most <M>{`\\lfloor \\log_2 n \\rfloor + 1`}</M> iterations, since the variant roughly halves
        each step. This is precisely why writing <code>lo = mid</code> (which fails to shrink the range when{" "}
        <M>{`m = \\text{lo}`}</M>) breaks termination and can loop forever.
      </p>

      <p>
        The deeper idea is that binary search is not about arrays at all — it works on any
        <strong> monotonic answer space</strong>. If a predicate is false, false, ..., false, true, true, ...,
        you can binary-search for the boundary. "What is the smallest ship capacity that ships all packages in
        D days?" is monotonic in capacity, so you binary-search the <em>answer</em>, not an array.
      </p>
      <div className="notice warn">
        <span className="lbl">Gotcha: it requires sorted data</span>
        Binary search is only valid on sorted (or otherwise monotonic) input. On unsorted data it silently
        returns wrong answers. If you search once, a linear scan at <M>{`O(n)`}</M> may beat sorting first at
        <M>{` O(n \\log n)`}</M>.
      </div>
    </div>);
}
function QuadraticSorts() {
    return (<div className="prose">
      <p>
        The two simplest sorts both run in <M>{`O(n^2)`}</M>, yet they are not useless — they win in specific
        situations, which is exactly why they are worth understanding.
      </p>
      <ul>
        <li>
          <strong>Selection sort</strong> repeatedly finds the minimum of the unsorted suffix and swaps it to
          the front. Always <M>{`O(n^2)`}</M> comparisons regardless of input, but it makes only
          <M>{` O(n)`}</M> swaps — useful when writes are far more expensive than reads.
        </li>
        <li>
          <strong>Insertion sort</strong> grows a sorted prefix, inserting each new element into its place by
          shifting larger elements right. It is <M>{`O(n^2)`}</M> in the worst case but <strong>O(n) on nearly
          sorted data</strong> and has tiny constant factors.
        </li>
      </ul>
      <Code lang="ts" filename="insertion.ts" code={`function insertionSort(a: number[]): void {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {   // shift larger elements right
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;                  // drop key into the gap
  }
}`}/>
      <p>
        Insertion sort's near-sorted speed is why it is the base case inside industrial sorts: below a
        threshold (often ~16 elements), Timsort and introsort switch to insertion sort because its low
        overhead beats the recursion of asymptotically faster algorithms on small arrays.
      </p>
      <div className="notice">
        <span className="lbl">Stability</span>
        Insertion sort is <strong>stable</strong> — equal elements keep their original relative order — because
        it never swaps past an equal key. Selection sort, as usually written, is not.
      </div>

      <h3>Stability: Formal Definition &amp; Which Sorts Have It</h3>
      <p>
        "Keeps equal elements in order" deserves a precise statement. Let the input be{" "}
        <M>{`a_0, a_1, \\dots, a_{n-1}`}</M> and let <M>{`\\sigma`}</M> be the permutation the sort applies, so
        the output is <M>{`a_{\\sigma(0)}, \\dots, a_{\\sigma(n-1)}`}</M>. Write <M>{`k(x)`}</M> for the sort
        <em> key</em> of element <M>{`x`}</M>. A sort is <strong>stable</strong> iff it preserves the input
        order of every pair of equal keys:
      </p>
      <MBlock>{`\\forall i < j,\\quad k(a_i) = k(a_j) \\implies \\sigma^{-1}(i) < \\sigma^{-1}(j)`}</MBlock>
      <p>
        In words: if <M>{`a_i`}</M> came before <M>{`a_j`}</M> and their keys tie, then <M>{`a_i`}</M> still
        comes before <M>{`a_j`}</M> in the output. Stability matters whenever records carry more than their key
        — sorting a table by <em>date</em> after it was already sorted by <em>name</em> should leave same-date
        rows in name order. It is also the property that makes <strong>radix sort</strong> correct: each
        digit-pass must not scramble the order established by earlier passes.
      </p>
      <ul>
        <li>
          <strong>Stable by nature</strong>: insertion sort, merge sort (with a <M>{`\\le`}</M> merge tie-break),
          counting sort, and bubble sort. Each moves an element past another only on a <em>strict</em> key
          inequality.
        </li>
        <li>
          <strong>Not stable as usually written</strong>: selection sort, quicksort, and heapsort. Their
          long-distance swaps can jump one element past an equal-keyed peer, inverting the pair.
        </li>
      </ul>
      <p>
        Any sort can be made stable by augmenting each key with its original index — replace <M>{`k(x)`}</M> with
        the pair <M>{`(k(x), \\text{index}(x))`}</M> and break ties on the index. This restores stability at the
        cost of <M>{`O(n)`}</M> extra space for the indices, which is exactly the trade-off in-place algorithms
        are trying to avoid.
      </p>
    </div>);
}
function MergeSort() {
    return (<div className="prose">
      <p>
        <strong>Merge sort</strong> is the archetype of <strong>divide and conquer</strong>: split the array in
        half, sort each half recursively, then <strong>merge</strong> the two sorted halves into one. Merging
        two sorted lists of total length <M>{`n`}</M> is a linear scan with two pointers, and the recursion has
        depth <M>{`\\log n`}</M>, giving the recurrence:
      </p>
      <MBlock>{`T(n) = 2\\,T(n/2) + O(n) = O(n \\log n)`}</MBlock>
      <CodeTabs tabs={[
            {
                label: "merge sort",
                lang: "ts",
                code: `function mergeSort(a: number[]): number[] {
  if (a.length <= 1) return a;               // base case
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  return merge(left, right);
}`,
            },
            {
                label: "merge step",
                lang: "ts",
                code: `function merge(l: number[], r: number[]): number[] {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < l.length && j < r.length) {
    // '<=' keeps equal elements in left-first order -> STABLE
    if (l[i] <= r[j]) out.push(l[i++]);
    else out.push(r[j++]);
  }
  while (i < l.length) out.push(l[i++]);
  while (j < r.length) out.push(r[j++]);
  return out;
}`,
            },
        ]}/>
      <p>
        Merge sort's virtues: it is <strong>stable</strong> and it guarantees <M>{`O(n \\log n)`}</M>{" "}
        <em>in the worst case</em>, unlike quicksort. Its cost is <M>{`O(n)`}</M> extra memory for the merge
        buffers — which is also why it is the algorithm of choice for <strong>external sorting</strong> (data
        too large for RAM) and for sorting <strong>linked lists</strong>, where merging needs no random access.
      </p>
      <h3>Solving the Recurrence <M>{`T(n) = 2T(n/2) + O(n)`}</M></h3>
      <p>
        The claim that this recurrence is <M>{`O(n \\log n)`}</M> can be derived, not just asserted. Take the
        linear merge work to be <M>{`cn`}</M> for some constant <M>{`c`}</M> and unroll the recursion into a
        tree:
      </p>
      <ul>
        <li>
          <strong>Work per level.</strong> The root does <M>{`cn`}</M> work. It spawns two subproblems of size{" "}
          <M>{`n/2`}</M>, each costing <M>{`c(n/2)`}</M>, so level 1 does <M>{`2 \\cdot c(n/2) = cn`}</M>. In
          general level <M>{`i`}</M> has <M>{`2^i`}</M> subproblems of size <M>{`n/2^i`}</M>:
          <MBlock>{`\\text{work at level } i = 2^i \\cdot c\\,\\frac{n}{2^i} = cn`}</MBlock>
          Every level does the same <M>{`cn`}</M> total work — the branching factor and the shrinking size
          exactly cancel.
        </li>
        <li>
          <strong>Number of levels.</strong> Sizes halve from <M>{`n`}</M> until they reach the base case of{" "}
          <M>{`1`}</M>, which takes <M>{`\\log_2 n`}</M> halvings. Including the root there are{" "}
          <M>{`\\log_2 n + 1`}</M> levels.
        </li>
      </ul>
      <p>
        Summing the identical per-level cost over all levels gives the total:
      </p>
      <MBlock>{`T(n) = \\sum_{i=0}^{\\log_2 n} cn = cn\\,(\\log_2 n + 1) = \\Theta(n \\log n)`}</MBlock>
      <p>
        The same answer drops out of the <strong>Master Theorem</strong>: with <M>{`a = 2`}</M>,{" "}
        <M>{`b = 2`}</M>, and combine cost <M>{`f(n) = \\Theta(n)`}</M>, we compare <M>{`f(n)`}</M> against{" "}
        <M>{`n^{\\log_b a} = n^{\\log_2 2} = n`}</M>. They match, so we are in <strong>Case 2</strong>, which
        contributes the extra <M>{`\\log n`}</M> factor: <M>{`T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)`}</M>.
        Crucially this bound holds for <em>every</em> input — the split is always into equal halves regardless of
        the data — which is why merge sort's <M>{`O(n \\log n)`}</M> is a worst-case guarantee, not an average.
      </p>

      <div className="notice">
        <span className="lbl">The two-pointer merge</span>
        The whole engine is the merge: walk both sorted inputs with a pointer each, always emitting the smaller
        front element. Because inputs are already sorted, one linear pass suffices.
      </div>
    </div>);
}
function QuickSort() {
    return (<div className="prose">
      <p>
        <strong>Quicksort</strong> is the other divide-and-conquer sort, but it divides <em>before</em> it
        recurses. It chooses a <strong>pivot</strong>, <strong>partitions</strong> the array so that everything
        smaller sits left of the pivot and everything larger sits right, then recursively sorts each side. The
        pivot lands in its final position, and no merge step is needed.
      </p>

      <h3>Lomuto vs. Hoare Partitioning Schemes</h3>
      <p>
        Partitioning is the heart of quicksort. There are two primary partitioning schemes:
      </p>
      <ul>
        <li>
          <strong>Lomuto Partitioning</strong>: Easy to implement but less efficient. 
          It chooses the last element as the pivot, scans sequentially using a pointer <M>{`j`}</M>, and swaps elements smaller than the pivot into a growing left partition tracked by index <M>{`i`}</M>. 
          It performs <M>{`O(n)`}</M> swaps and degrades to <M>{`O(n^2)`}</M> comparison/swap complexity if all elements are equal.
        </li>
        <li>
          <strong>Hoare Partitioning</strong>: More efficient and performs roughly 3× fewer swaps. 
          It uses two pointers starting from the ends (<M>{`lo`}</M> and <M>{`hi`}</M>) that converge inward. 
          They search for a pair of elements out of order (left element larger than pivot, right element smaller than pivot) and swap them. 
          It naturally divides equal elements evenly and handles duplicates gracefully.
        </li>
      </ul>

      <CodeTabs tabs={[
            {
                label: "Lomuto Partition",
                lang: "ts",
                code: `function quickSortLomuto(a: number[], lo = 0, hi = a.length - 1): void {
  if (lo >= hi) return;
  const p = partitionLomuto(a, lo, hi);
  quickSortLomuto(a, lo, p - 1);
  quickSortLomuto(a, p + 1, hi);
}

function partitionLomuto(a: number[], lo: number, hi: number): number {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}`,
            },
            {
                label: "Hoare Partition",
                lang: "ts",
                code: `function quickSortHoare(a: number[], lo = 0, hi = a.length - 1): void {
  if (lo >= hi) return;
  const p = partitionHoare(a, lo, hi);
  quickSortHoare(a, lo, p);      // Note: p is included here
  quickSortHoare(a, p + 1, hi);
}

function partitionHoare(a: number[], lo: number, hi: number): number {
  const pivot = a[lo + ((hi - lo) >> 1)];
  let i = lo - 1;
  let j = hi + 1;
  while (true) {
    do { i++; } while (a[i] < pivot);
    do { j--; } while (a[j] > pivot);
    if (i >= j) return j;
    [a[i], a[j]] = [a[j], a[i]]; // swap out-of-order pair
  }
}`,
            },
        ]}/>

      <p>
        On a balanced split the recurrence is <M>{`T(n) = 2T(n/2) + O(n) = O(n \\log n)`}</M>, and quicksort's
        small constant factors and in-place, cache-friendly partition make it the fastest general sort in
        practice. But a bad pivot that splits off just one element per step yields:
      </p>
      <MBlock>{`T(n) = T(n-1) + O(n) = O(n^2)`}</MBlock>
      <p>
        This worst case strikes precisely on already-sorted input if you always pick the last element as pivot.
        The fixes: choose a <strong>random pivot</strong> or a <strong>median-of-three</strong>, which make the
        worst case astronomically unlikely. Production sorts (introsort) go further and switch to heapsort if
        recursion gets too deep, capping the worst case at <M>{`O(n \\log n)`}</M>.
      </p>

      <h3>Why the Average Case Is <M>{`O(n \\log n)`}</M>: the Harmonic Sum</h3>
      <p>
        The gap between quicksort's <M>{`O(n^2)`}</M> worst case and its excellent real-world speed is explained
        by counting the <strong>expected number of comparisons</strong> over random pivot choices. Sort the
        input values as <M>{`z_1 < z_2 < \\dots < z_n`}</M>, and define the indicator{" "}
        <M>{`X_{ij} = 1`}</M> if <M>{`z_i`}</M> and <M>{`z_j`}</M> are ever compared, else <M>{`0`}</M>. Two
        elements are compared at most once (a comparison always involves the pivot, which is then removed), so
        the total comparison count is <M>{`X = \\sum_{i<j} X_{ij}`}</M> and by linearity of expectation:
      </p>
      <MBlock>{`\\mathbb{E}[X] = \\sum_{i<j} \\Pr[z_i \\text{ and } z_j \\text{ are compared}]`}</MBlock>
      <p>
        The key observation: <M>{`z_i`}</M> and <M>{`z_j`}</M> are compared iff the <em>first</em> pivot chosen
        from the range <M>{`\\{z_i, z_{i+1}, \\dots, z_j\\}`}</M> is either <M>{`z_i`}</M> or <M>{`z_j`}</M>. If
        instead some middle element is picked first, it splits <M>{`z_i`}</M> and <M>{`z_j`}</M> into different
        partitions and they never meet. That range holds <M>{`j - i + 1`}</M> elements, each equally likely to
        be picked first, so:
      </p>
      <MBlock>{`\\Pr[z_i \\text{ and } z_j \\text{ compared}] = \\frac{2}{j - i + 1}`}</MBlock>
      <p>
        Substituting and reindexing with <M>{`k = j - i + 1`}</M> turns the double sum into a
        <strong> harmonic sum</strong>:
      </p>
      <MBlock>{`\\mathbb{E}[X] = \\sum_{i=1}^{n-1} \\sum_{j=i+1}^{n} \\frac{2}{j-i+1} = \\sum_{i=1}^{n-1} \\sum_{k=2}^{n-i+1} \\frac{2}{k} \\le 2n \\sum_{k=1}^{n} \\frac{1}{k} = 2n H_n`}</MBlock>
      <p>
        The harmonic number satisfies <M>{`H_n = \\ln n + O(1)`}</M> (it is squeezed by the integral{" "}
        <M>{`\\int_1^n \\frac{dx}{x} = \\ln n`}</M>), so:
      </p>
      <MBlock>{`\\mathbb{E}[X] \\le 2n H_n = 2n(\\ln n + O(1)) = O(n \\log n)`}</MBlock>
      <p>
        So randomized quicksort makes <M>{`\\Theta(n \\log n)`}</M> comparisons <em>in expectation</em> on any
        input — the <M>{`O(n^2)`}</M> case still exists but now requires a run of unlucky pivots whose
        probability decays exponentially. Combined with quicksort's tiny constant factors and cache-friendly
        sequential access, this is why it usually outruns the worst-case-optimal merge sort in practice.
      </p>
      <div className="notice warn">
        <span className="lbl">Gotcha: not stable, and beware the naive pivot</span>
        Standard in-place quicksort is <strong>not stable</strong>. And a fixed first/last-element pivot turns
        sorted data — a very common input — into the <M>{`O(n^2)`}</M> disaster. Randomize the pivot.
      </div>
    </div>);
}
function LowerBound() {
    return (<div className="prose">
      <p>
        Is <M>{`O(n \\log n)`}</M> just the best we have found, or is it a wall? For any sort that learns about
        the data <em>only through comparisons</em>, it is a wall — a proven lower bound.
      </p>

      <h3>Mathematical Proof of the <M>{`\\Omega(n \\log n)`}</M> Lower Bound</h3>
      <p>
        We model any comparison sort as a <strong>binary decision tree</strong> where each internal node represents a comparison <M>{`a_i \\le a_j`}</M>, and each leaf represents a unique sorted permutation of the input:
      </p>
      <ul>
        <li>
          For an input array of size <M>{`n`}</M>, there are <M>{`n!`}</M> possible permutations. The decision tree must have at least <M>{`n!`}</M> leaves so it can correctly sort every possible input permutation:
          <MBlock>{`L \\ge n!`}</MBlock>
        </li>
        <li>
          A binary tree of height <M>{`h`}</M> has at most <M>{`2^h`}</M> leaves. Therefore:
          <MBlock>{`2^h \\ge L \\ge n!`}</MBlock>
        </li>
        <li>
          Taking the binary logarithm of both sides:
          <MBlock>{`h \\ge \\log_2(n!)`}</MBlock>
        </li>
        <li>
          Using Stirling's approximation (<M>{`\\ln(n!) \\approx n \\ln n - n`}</M>) or simply bounding the factorial:
          <MBlock>{`n! \\ge \\left( \\frac{n}{2} \\right)^{n/2}`}</MBlock>
          <MBlock>{`\\log_2(n!) \\ge \\log_2\\left( \\left( \\frac{n}{2} \\right)^{n/2} \\right) = \\frac{n}{2} \\log_2\\left(\\frac{n}{2}\\right) = \\frac{n}{2}(\\log_2 n - 1) = \\Omega(n \\log n)`}</MBlock>
        </li>
      </ul>
      <p>
        Since <M>{`h`}</M> represents the maximum number of comparisons (the tree height / worst-case path), any comparison-based sort must make <M>{`\\Omega(n \\log n)`}</M> comparisons in the worst case.
      </p>

      <p>
        You <em>can</em> beat it by not comparing. <strong>Non-comparison sorts</strong> exploit the structure
        of the keys:
      </p>
      <ul>
        <li>
          <strong>Counting sort</strong> — for integer keys in a small range <M>{`[0, k)`}</M>, tally each
          value's frequency and reconstruct. <M>{`O(n + k)`}</M> time, and stable.
        </li>
        <li>
          <strong>Radix sort</strong> — sort by digit, least-significant first, using a stable counting sort per
          digit. For <M>{`d`}</M> digits: <M>{`O(d(n + k))`}</M>, effectively linear when <M>{`d`}</M> is small.
        </li>
      </ul>
      <Code lang="ts" filename="counting.ts" code={`function countingSort(a: number[], k: number): number[] {
  const count = new Array(k).fill(0);
  for (const x of a) count[x]++;              // tally frequencies
  const out: number[] = [];
  for (let v = 0; v < k; v++) {
    for (let c = 0; c < count[v]; c++) out.push(v);
  }
  return out;                                  // O(n + k)
}`}/>
      <div className="notice warn">
        <span className="lbl">Gotcha: the range k matters</span>
        Counting/radix sorts are only linear when the key range <M>{`k`}</M> (or digit count) is small relative
        to <M>{`n`}</M>. Counting-sort of 32-bit integers with <M>{`k = 2^{32}`}</M> is a memory catastrophe;
        that is what radix's digit-by-digit approach fixes.
      </div>
    </div>);
}
export const dsaSorting: Module = {
    id: "dsa-sorting",
    title: "Sorting & Searching",
    icon: "🔀",
    track: "dsa",
    blurb: "Binary search, the quadratic sorts, merge sort and quicksort, and the comparison-sort lower bound.",
    dependsOn: ["dsa-arrays"],
    lessons: [
        {
            id: "binary-search",
            title: "Binary Search",
            minutes: 14,
            summary: "The halving invariant, off-by-one pitfalls, and searching an answer space.",
            Body: BinarySearch,
            quiz: {
                questions: [
                    {
                        q: "Binary search runs in what time on a sorted array of n elements?",
                        choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                        answer: 1,
                        explain: "Each comparison halves the remaining search space, giving log2(n) steps.",
                    },
                    {
                        q: "Why compute mid as lo + (hi - lo) / 2 rather than (lo + hi) / 2?",
                        choices: [
                            "It is faster",
                            "It avoids integer overflow when lo + hi is large",
                            "It rounds differently",
                            "It is required by the language",
                        ],
                        answer: 1,
                        explain: "In fixed-width integer languages, lo + hi can overflow; the subtraction form stays within range.",
                    },
                ],
            },
            exercises: [
                {
                    id: "bsearch-steps",
                    kind: "numeric",
                    prompt: "What is the maximum number of comparisons binary search needs on a sorted array of 1,000,000 elements? (Use ceil(log2 n).) Enter an integer.",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 20) < 0.01
                        ? { pass: true, message: "Correct — log2(1,000,000) ≈ 19.93, so ceil is 20 comparisons." }
                        : { pass: false, message: "Not quite. Compute ceil(log2(1,000,000)) ≈ ceil(19.93)." },
                    hint: "2^20 = 1,048,576 > 1,000,000 > 2^19.",
                },
            ],
        },
        {
            id: "quadratic-sorts",
            title: "The O(n²) Sorts",
            minutes: 12,
            summary: "Insertion and selection sort — and the cases where they still win.",
            Body: QuadraticSorts,
            quiz: {
                questions: [
                    {
                        q: "Insertion sort's running time on already-sorted input is…",
                        choices: ["O(n^2)", "O(n)", "O(log n)", "O(n log n)"],
                        answer: 1,
                        explain: "Each element is already in place, so the inner shift loop never runs — a single O(n) pass.",
                    },
                    {
                        q: "Selection sort is notable for making only…",
                        choices: ["O(n) comparisons", "O(n) swaps", "O(log n) swaps", "no comparisons"],
                        answer: 1,
                        explain: "It does O(n^2) comparisons but only one swap per pass, useful when writes are expensive.",
                    },
                ],
            },
        },
        {
            id: "merge-sort",
            title: "Merge Sort",
            minutes: 13,
            summary: "Divide and conquer, the two-pointer merge, stability, guaranteed O(n log n).",
            Body: MergeSort,
            quiz: {
                questions: [
                    {
                        q: "Merge sort's recurrence T(n) = 2T(n/2) + O(n) solves to…",
                        choices: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
                        answer: 1,
                        explain: "log n levels, each doing O(n) merge work, gives O(n log n) — in the worst case, not just average.",
                    },
                    {
                        q: "A key advantage of merge sort over quicksort is that it…",
                        choices: [
                            "Sorts in place with no extra memory",
                            "Guarantees O(n log n) worst case and is stable",
                            "Is always faster in practice",
                            "Needs no comparisons",
                        ],
                        answer: 1,
                        explain: "Merge sort has no O(n^2) worst case and preserves the order of equal elements; the cost is O(n) extra space.",
                    },
                ],
            },
            exercises: [
                {
                    id: "merge-levels",
                    kind: "numeric",
                    prompt: "Merge sort on n = 64 elements recurses until subarrays have size 1. How many levels of merging are there (i.e. log2(64))? Enter an integer.",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 6) < 0.01
                        ? { pass: true, message: "Correct — 2^6 = 64, so there are 6 levels, each doing O(n) work: 6 * 64 = O(n log n)." }
                        : { pass: false, message: "Not quite. Solve 2^levels = 64." },
                    hint: "How many times can you halve 64 to reach 1?",
                },
            ],
        },
        {
            id: "quicksort",
            title: "Quicksort",
            minutes: 14,
            summary: "Partitioning, pivot choice, the O(n²) worst case, and how to avoid it.",
            Body: QuickSort,
            quiz: {
                questions: [
                    {
                        q: "Quicksort's worst-case time, triggered by consistently bad pivots, is…",
                        choices: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
                        answer: 1,
                        explain: "If each partition peels off just one element, the recursion depth is n and total work is O(n^2).",
                    },
                    {
                        q: "Which pivot strategy makes the O(n^2) worst case very unlikely?",
                        choices: [
                            "Always the first element",
                            "Always the last element",
                            "A random element or median-of-three",
                            "The largest element",
                        ],
                        answer: 2,
                        explain: "Randomization (or median-of-three) prevents an adversarial or sorted input from forcing unbalanced splits.",
                    },
                    {
                        q: "Standard in-place quicksort is…",
                        choices: ["Stable", "Not stable", "Always O(n)", "Comparison-free"],
                        answer: 1,
                        explain: "The partition swaps can reorder equal elements, so quicksort is not stable by default.",
                    },
                ],
            },
        },
        {
            id: "lower-bound",
            title: "The Sorting Lower Bound & Linear Sorts",
            minutes: 13,
            summary: "Why comparison sorts need Ω(n log n), and how counting/radix beat it.",
            Body: LowerBound,
            quiz: {
                questions: [
                    {
                        q: "The Ω(n log n) lower bound applies to sorts that…",
                        choices: [
                            "Use recursion",
                            "Learn about the data only through comparisons",
                            "Use extra memory",
                            "Sort integers",
                        ],
                        answer: 1,
                        explain: "The decision-tree argument bounds any comparison-based sort; non-comparison sorts sidestep it.",
                    },
                    {
                        q: "Counting sort achieves O(n + k) time by…",
                        choices: [
                            "Comparing every pair",
                            "Tallying the frequency of each key in a range [0, k)",
                            "Using a heap",
                            "Recursively halving",
                        ],
                        answer: 1,
                        explain: "It counts occurrences of each value and reconstructs the sorted output — no comparisons, but needs a bounded key range.",
                    },
                ],
            },
            exercises: [
                {
                    id: "why-linear",
                    kind: "open",
                    prompt: "You must sort 10 million 32-bit integers. Explain when counting sort is a poor choice here and how radix sort addresses the problem.",
                    starter: "",
                    rubric: "Full credit: counting sort needs an array of size k = 2^32 (~4 billion), which is infeasible memory; radix sort processes the number a few bits/digits at a time with a small k per pass (e.g. 8 bits -> k = 256), running in O(d(n + k)) with tiny memory. Partial: identifies the memory problem but not radix's digit-by-digit fix.",
                    hint: "Counting sort's memory is proportional to the key range k.",
                },
            ],
        },
    ],
};
