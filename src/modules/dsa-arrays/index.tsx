import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code } from "../../components/code-block";
import { Notice } from "../../components/ui";
function ContiguousMemory() {
    return (<div className="prose">
      <p>
        An array is the most physically honest data structure there is: <strong>a run of equal-sized
        slots laid end to end in memory</strong>. Nothing else. That single layout decision — that
        element <M>{`i`}</M> sits at a fixed offset from the start — is where every array superpower
        and every array weakness comes from.
      </p>
      <p>
        Because each slot is the same size, the address of element <M>{`i`}</M> is pure arithmetic:
      </p>
      <MBlock>{`\\text{addr}(i) = \\text{base} + i \\times \\text{sizeof(element)}`}</MBlock>
      <p>
        The CPU computes that in one multiply-and-add regardless of whether <M>{`i`}</M> is 0 or
        1,000,000. That is what "<strong>random access in <M>{`O(1)`}</M></strong>" means: indexing
        is not a search, it is a formula. Contrast a linked list, where finding element{" "}
        <M>{`i`}</M> means walking <M>{`i`}</M> pointers — <M>{`O(n)`}</M>.
      </p>

      <h3>Multi-Dimensional Arrays: Row-Major vs. Column-Major Layout</h3>
      <p>
        In physical computer memory, address space is strictly one-dimensional. To store a 2D grid/matrix of size <M>{`R \\times C`}</M> (Rows by Columns), we must flatten it. There are two primary layouts:
      </p>
      <ul>
        <li>
          <strong>Row-Major Order</strong>: Elements are stored row-by-row consecutively. 
          This is the default in C, C++, and most graphics/engine code. 
          The memory offset for cell <M>{`(r, c)`}</M> is:
          <MBlock>{`\\text{offset}(r, c) = r \\times C + c`}</MBlock>
        </li>
        <li>
          <strong>Column-Major Order</strong>: Elements are stored column-by-column consecutively. 
          This is the default in Fortran, MATLAB, and WebGL/OpenGL matrices. 
          The memory offset for cell <M>{`(r, c)`}</M> is:
          <MBlock>{`\\text{offset}(r, c) = c \\times R + r`}</MBlock>
        </li>
      </ul>

      <h3>Cache Line Locality and Strided Access</h3>
      <p>
        Contiguity also gives you <strong>cache locality</strong> for free. Memory is fetched in
        cache lines (~64 bytes), so touching <code>a[i]</code> drags <code>a[i+1..]</code> into fast
        cache with it. 
      </p>
      <p>
        When iterating a row-major 2D array, traversing row-by-row (incrementing <M>{`c`}</M> in the inner loop) accesses adjacent memory addresses, utilizing 100% of the cache line. 
        Traversing column-by-column (incrementing <M>{`r`}</M> in the inner loop) creates a <strong>strided access pattern</strong>. If the row size exceeds the cache size, this causes constant cache misses (cache thrashing), which can make the code run up to 10× slower despite having the same Big-O.
      </p>

      <Code lang="ts" filename="indexing.ts" code={`const a = [10, 20, 30, 40];
// a[2] is NOT a search. The engine computes base + 2 * 8 bytes and reads.
console.log(a[2]);        // 30, in O(1)

// The cost model of the operations:
a[2] = 99;                // O(1)  — overwrite in place
const last = a[a.length - 1];  // O(1)  — length is stored, not counted
a.push(50);               // O(1)  amortized (see dynamic arrays)
a.unshift(5);             // O(n)  — every element shifts right one slot!
a.splice(1, 1);           // O(n)  — delete-in-middle shifts the tail left`}/>
      <Notice warn>
        <span className="lbl">The insert/delete tax</span>
        Fast indexing has a price: inserting or deleting anywhere but the end forces every later
        element to shift, which is <M>{`O(n)`}</M>. <code>unshift</code>, <code>shift</code>, and
        mid-array <code>splice</code> are linear. If you find yourself doing those in a loop, you
        probably want a different structure — or a different algorithm.
      </Notice>
    </div>);
}
function DynamicArrays() {
    return (<div className="prose">
      <p>
        A raw array has a fixed size, but <code>Array</code> in JS, <code>vector</code> in C++, and{" "}
        <code>list</code> in Python grow on demand. They are <strong>dynamic arrays</strong>: a fixed
        buffer plus a <em>length</em>, with a promise to reallocate a bigger buffer when you run out
        of room. You met the analysis in the complexity module — here is the mechanism.
      </p>
      <p>
        The invariant is <M>{`\\text{length} \\le \\text{capacity}`}</M>. A <code>push</code> while
        there is spare capacity is a single write, <M>{`O(1)`}</M>. A <code>push</code> into a full
        buffer must allocate a larger one (typically <strong>2×</strong>) and copy everything across
        — <M>{`O(n)`}</M> for that one call. Because the buffer doubles, those copies get
        exponentially rarer, and the total copy cost for <M>{`n`}</M> pushes is a geometric series:
      </p>
      <MBlock>{`\\sum_{i=0}^{\\log_2 n} 2^i = 2n - 1 = O(n) \\;\\Rightarrow\\; O(1) \\text{ amortized per push}`}</MBlock>

      <h3>Generalizing the Growth Factor: Why 2× (or 1.5×)</h3>
      <p>
        Doubling is a choice, not a law. Suppose instead you grow the buffer by an arbitrary factor{" "}
        <M>{`b > 1`}</M>. Starting from capacity 1, resizes happen at capacities{" "}
        <M>{`1, b, b^2, \\ldots`}</M> up to <M>{`n`}</M>, and each resize copies the elements present.
        The total copy work to reach <M>{`n`}</M> is again geometric, and it settles to a clean
        closed form:
      </p>
      <MBlock>{`\\sum_{i=0}^{\\log_b n} b^i = \\frac{b^{\\log_b n + 1} - 1}{b - 1} \\approx \\frac{b}{b - 1}\\, n \\;\\Rightarrow\\; \\frac{b}{b-1} \\text{ copies amortized per push}`}</MBlock>
      <p>
        Read that coefficient <M>{`\\frac{b}{b-1}`}</M> carefully: it is the entire tradeoff. At{" "}
        <M>{`b = 2`}</M> you pay <M>{`2`}</M> copies per element but can waste up to{" "}
        <M>{`(b-1)n = n`}</M> slots of memory (a buffer half-empty right after a resize). At{" "}
        <M>{`b = 1.5`}</M> you pay <M>{`3`}</M> copies per element yet waste at most <M>{`0.5n`}</M>{" "}
        — trading a bigger constant on time for a smaller constant on space. Both remain{" "}
        <M>{`O(1)`}</M> amortized and <M>{`O(n)`}</M> space; only the constants move.
      </p>
      <p>
        There is a subtler reason implementations like some C++ standard libraries prefer{" "}
        <M>{`b < 2`}</M>. If the factor stays below the golden ratio{" "}
        <M>{`\\varphi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618`}</M>, the sum of all previously freed
        buffers can eventually exceed the size of the next request, letting the allocator{" "}
        <em>reuse</em> that freed space instead of always marching forward into fresh memory. Above{" "}
        <M>{`\\varphi`}</M> each new buffer is larger than everything freed so far, so reuse never
        catches up.
      </p>
      <Code lang="ts" filename="dynarray.ts" code={`class DynArray<T> {
  private buf: (T | undefined)[] = new Array(1);
  private len = 0;
  get size() { return this.len; }
  get(i: number): T { return this.buf[i] as T; }        // O(1)

  push(x: T): void {
    if (this.len === this.buf.length) this.grow();       // rare O(n)
    this.buf[this.len++] = x;                             // usual O(1)
  }
  private grow(): void {
    const bigger = new Array<T | undefined>(this.buf.length * 2); // double
    for (let i = 0; i < this.len; i++) bigger[i] = this.buf[i];
    this.buf = bigger;
  }
  pop(): T | undefined { return this.len ? this.buf[--this.len] : undefined; } // O(1)
}`}/>
      <Notice>
        <span className="lbl">Preallocate when you can</span>
        If you know you'll push <M>{`n`}</M> items, size the buffer once up front
        (<code>new Array(n)</code> and fill by index). You skip every intermediate reallocation and
        copy — same Big-O, but a real constant-factor win and steadier latency.
      </Notice>
    </div>);
}
function TwoPointer() {
    return (<div className="prose">
      <p>
        The <strong>two-pointer technique</strong> replaces a nested loop with two indices that move
        toward or alongside each other, collapsing an <M>{`O(n^2)`}</M> scan into a single{" "}
        <M>{`O(n)`}</M> pass. It works whenever the array has structure — usually <em>sortedness</em>
        {" "}— that lets you rule out whole regions with one comparison.
      </p>
      <p>
        Canonical problem: given a <strong>sorted</strong> array, is there a pair summing to a target{" "}
        <M>{`t`}</M>? Put one pointer at each end. If <M>{`a[lo] + a[hi] > t`}</M> the sum is too big,
        so the largest element can't participate — move <M>{`hi`}</M> left. If it's too small, move{" "}
        <M>{`lo`}</M> right. Each step retires one element, so the pointers meet after at most{" "}
        <M>{`n`}</M> steps.
      </p>
      <MBlock>{`\\text{sorted pair-sum: } O(n) \\text{ time},\\; O(1) \\text{ space} \\;\\; \\text{vs. brute force } O(n^2)`}</MBlock>

      <h3>The Loop Invariant and Why It Is Correct</h3>
      <p>
        "It works" is not the same as "it is correct." The pair-sum method earns a proof, and the
        proof rests on a single <strong>loop invariant</strong> — a statement that is true before the
        loop, preserved by every iteration, and strong enough at the end to give the answer. Here it
        is:
      </p>
      <MBlock>{`\\text{Invariant: if a valid pair exists, at least one such pair } (p, q) \\text{ has } lo \\le p < q \\le hi.`}</MBlock>
      <p>
        <strong>Initialization.</strong> Before the loop <M>{`lo = 0`}</M> and <M>{`hi = n-1`}</M>, so
        the window <M>{`[lo, hi]`}</M> is the whole array and the claim is trivially true.
      </p>
      <p>
        <strong>Maintenance.</strong> Suppose the invariant holds and{" "}
        <M>{`a[lo] + a[hi] > t`}</M>. Because the array is sorted, for <em>every</em> index{" "}
        <M>{`k`}</M> with <M>{`lo \\le k`}</M> we have <M>{`a[k] + a[hi] \\ge a[lo] + a[hi] > t`}</M>,
        so <M>{`a[hi]`}</M> cannot be part of any pair with the current or a larger partner — it is
        safe to discard by setting <M>{`hi \\gets hi - 1`}</M>. The symmetric argument justifies{" "}
        <M>{`lo \\gets lo + 1`}</M> when the sum is too small. Each move eliminates only elements that
        provably belong to no solution, so the invariant survives.
      </p>
      <p>
        <strong>Termination.</strong> The quantity <M>{`hi - lo`}</M> strictly decreases every
        iteration and the loop stops at <M>{`lo \\ge hi`}</M>, so it runs at most <M>{`n`}</M> times —
        giving the <M>{`O(n)`}</M> bound directly, and guaranteeing that if a pair existed we found it
        before the window collapsed.
      </p>
      <Code lang="ts" filename="two-pointer.ts" code={`// Assumes 'a' is sorted ascending. Returns indices of a pair summing to t.
function pairSum(a: number[], t: number): [number, number] | null {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    const sum = a[lo] + a[hi];
    if (sum === t) return [lo, hi];
    if (sum < t) lo++;    // too small: need a bigger left value
    else hi--;            // too big:  need a smaller right value
  }
  return null;
}

// Same shape: remove duplicates from a sorted array in place, O(n).
function dedupSorted(a: number[]): number {
  if (a.length === 0) return 0;
  let w = 1;                       // write pointer
  for (let r = 1; r < a.length; r++)   // read pointer
    if (a[r] !== a[w - 1]) a[w++] = a[r];
  return w;                        // new logical length
}`}/>
      <Notice warn>
        <span className="lbl">Two-pointer needs a reason</span>
        The end-to-end pair-sum trick is <em>only correct on a sorted array</em> — the ordering is
        what lets you discard a candidate safely. On unsorted data, either sort first
        (<M>{`O(n \\log n)`}</M>) or reach for a hash set (<M>{`O(n)`}</M>, covered in the hashing
        module). Don't apply the pattern where the invariant doesn't hold.
      </Notice>
    </div>);
}
function SlidingWindow() {
    return (<div className="prose">
      <p>
        A <strong>sliding window</strong> is two pointers that bound a contiguous sub-range and move
        the <em>same</em> direction. Instead of recomputing a property (sum, count, set of distinct
        chars) for every sub-array from scratch — <M>{`O(n^2)`}</M> or worse — you maintain it{" "}
        <strong>incrementally</strong> as the window's right edge expands and its left edge contracts.
        Each element enters the window once and leaves once, so the whole thing is <M>{`O(n)`}</M>.
      </p>
      <p>
        Windows come in two flavors. A <strong>fixed-size</strong> window (e.g. "max sum of any{" "}
        <M>{`k`}</M> consecutive elements") slides by adding the new element and subtracting the one
        that fell off. A <strong>variable-size</strong> window grows the right edge greedily and
        shrinks the left edge only when a constraint is violated (e.g. "longest substring with no
        repeated character").
      </p>
      <Code lang="ts" filename="window.ts" code={`// Fixed window: maximum sum of k consecutive elements. O(n).
function maxWindowSum(a: number[], k: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];   // prime the first window
  let best = sum;
  for (let r = k; r < a.length; r++) {
    sum += a[r] - a[r - k];                   // add entering, drop leaving
    best = Math.max(best, sum);
  }
  return best;
}

// Variable window: length of the longest substring with all-distinct chars. O(n).
function longestDistinct(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if (lastSeen.has(c) && lastSeen.get(c)! >= left) left = lastSeen.get(c)! + 1;
    lastSeen.set(c, r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`}/>
      <MBlock>{`\\text{brute force } \\sum_{\\text{all windows}} O(k) = O(nk) \\;\\longrightarrow\\; \\text{sliding window } O(n)`}</MBlock>
      <Notice>
        <span className="lbl">The amortization insight</span>
        The left pointer only ever moves <em>right</em>, and never past the right pointer. So even
        though the inner "shrink" step looks like a loop, across the whole run it advances at most{" "}
        <M>{`n`}</M> times total. That's why a nested-looking algorithm is genuinely linear.
      </Notice>
    </div>);
}
function PrefixSums() {
    return (<div className="prose">
      <p>
        If you need to answer many "<em>what is the sum of elements from index <M>{`i`}</M> to{" "}
        <M>{`j`}</M>?</em>" queries, recomputing each one is <M>{`O(n)`}</M> per query. A{" "}
        <strong>prefix-sum array</strong> precomputes running totals once so every range query
        afterward is <M>{`O(1)`}</M>. It is the array world's version of "trade a little space and
        setup for enormous query speed."
      </p>
      <p>
        Define <M>{`P[0] = 0`}</M> and <M>{`P[k] = a[0] + a[1] + \\cdots + a[k-1]`}</M>. Then the sum
        of the half-open range <M>{`[i, j)`}</M> is a single subtraction:
      </p>
      <MBlock>{`\\sum_{k=i}^{j-1} a[k] = P[j] - P[i]`}</MBlock>
      <p>
        Building <M>{`P`}</M> is one <M>{`O(n)`}</M> pass; after that <M>{`q`}</M> queries cost{" "}
        <M>{`O(q)`}</M> instead of <M>{`O(qn)`}</M>. The same idea powers <strong>subarray-sum</strong>
        {" "}tricks: "count subarrays summing to <M>{`t`}</M>" becomes "for each <M>{`P[j]`}</M>, how
        many earlier <M>{`P[i] = P[j] - t`}</M>?" — answered with a hash map in <M>{`O(n)`}</M>. The
        idea generalizes to 2D (integral images) and to other invertible operators.
      </p>

      <h3>2D Prefix Sums and Inclusion-Exclusion</h3>
      <p>
        In one dimension a range is bounded by two endpoints, so one subtraction suffices. In two
        dimensions a rectangle is bounded by four corners, and the arithmetic that isolates it is the{" "}
        <strong>inclusion-exclusion principle</strong>. Define the 2D prefix sum <M>{`P`}</M> so that{" "}
        <M>{`P[r][c]`}</M> is the sum of the whole sub-rectangle from the origin to (but not
        including) row <M>{`r`}</M> and column <M>{`c`}</M>. It is built in one <M>{`O(RC)`}</M> pass
        with the recurrence
      </p>
      <MBlock>{`P[r][c] = a[r-1][c-1] + P[r-1][c] + P[r][c-1] - P[r-1][c-1],`}</MBlock>
      <p>
        where the final subtraction cancels the top-left region that both <M>{`P[r-1][c]`}</M> and{" "}
        <M>{`P[r][c-1]`}</M> counted. The sum over any axis-aligned rectangle{" "}
        <M>{`[r_1, r_2) \\times [c_1, c_2)`}</M> is then answered in <M>{`O(1)`}</M> by combining four
        corner reads:
      </p>
      <MBlock>{`\\sum_{r_1 \\le r < r_2} \\sum_{c_1 \\le c < c_2} a[r][c] = P[r_2][c_2] - P[r_1][c_2] - P[r_2][c_1] + P[r_1][c_1].`}</MBlock>
      <p>
        The pattern is exactly inclusion-exclusion: start from the big block anchored at the far
        corner, subtract the two overhanging strips above and to the left, then <em>add back</em> the
        top-left block that both subtractions removed. The same skeleton extends to <M>{`d`}</M>{" "}
        dimensions, where a box query costs <M>{`2^d`}</M> corner reads — still <M>{`O(1)`}</M> for
        fixed <M>{`d`}</M>. This precomputed table is the <strong>summed-area table</strong> that
        makes constant-time box blurs and Haar-feature detectors practical in graphics and vision.
      </p>
      <Code lang="ts" filename="prefix.ts" code={`function buildPrefix(a: number[]): number[] {
  const P = new Array<number>(a.length + 1);
  P[0] = 0;
  for (let i = 0; i < a.length; i++) P[i + 1] = P[i] + a[i]; // O(n) once
  return P;
}
// Sum of a[i..j-1] in O(1) after the build:
function rangeSum(P: number[], i: number, j: number): number {
  return P[j] - P[i];
}

const a = [3, 1, 4, 1, 5, 9];
const P = buildPrefix(a);          // [0, 3, 4, 8, 9, 14, 23]
console.log(rangeSum(P, 1, 4));    // a[1]+a[2]+a[3] = 1+4+1 = 6`}/>
      <Notice warn>
        <span className="lbl">Off-by-one and staleness</span>
        Keep the range half-open (<M>{`[i, j)`}</M>) and size <M>{`P`}</M> as <M>{`n+1`}</M> — it
        eliminates the most common indexing bugs. And remember prefix sums assume the array is{" "}
        <strong>static</strong>: any update to <code>a</code> invalidates <M>{`P`}</M> from that point
        on. If you need updates <em>and</em> range queries, you want a Fenwick/segment tree
        (<M>{`O(\\log n)`}</M> each), not a flat prefix array.
      </Notice>
    </div>);
}
export const dsaArrays: Module = {
    id: "dsa-arrays",
    title: "Arrays & Strings",
    icon: "🔢",
    track: "dsa",
    blurb: "Contiguous memory and O(1) indexing, dynamic-array growth, and the workhorse patterns: two pointers, sliding windows, and prefix sums.",
    dependsOn: ["dsa-complexity"],
    lessons: [
        {
            id: "contiguous", title: "Contiguous Memory & Indexing", minutes: 11,
            summary: "Why a[i] is O(1) arithmetic, and why mid-array insert is O(n).",
            Body: ContiguousMemory,
            quiz: {
                questions: [
                    { q: "Why is array indexing a[i] O(1)?", choices: ["The array is sorted", "The address is base + i·sizeof, one arithmetic step", "It searches from the front", "Arrays cache every index"], answer: 1, explain: "Equal-sized contiguous slots make the address a direct formula — no search." },
                    { q: "Which array operation is O(n)?", choices: ["a[i] read", "a.push at the end (amortized)", "a.unshift at the front", "reading a.length"], answer: 2, explain: "unshift inserts at the front, forcing every existing element to shift right." },
                    { q: "Iterating an array in order is faster than scattered access mainly because of…", choices: ["Big-O magic", "Cache locality — contiguous data loads together", "Fewer elements", "Sorting"], answer: 1, explain: "Cache lines pull neighboring elements in together, so sequential access is far friendlier to the cache." },
                ],
            },
            exercises: [
                {
                    id: "addr", kind: "numeric",
                    prompt: "An array of 8-byte doubles starts at address 1000. At what address does element a[5] live? Enter the address.",
                    starter: "", hint: "base + i·sizeof = 1000 + 5·8.",
                    validate: (s) => Math.abs(parseFloat(s) - 1040) < 0.01 ? { pass: true, message: "Correct — 1000 + 5·8 = 1040." } : { pass: false, message: "Compute 1000 + 5 × 8." },
                },
            ],
        },
        {
            id: "dynamic-arrays", title: "Dynamic Arrays & Amortized Push", minutes: 12,
            summary: "Buffer + length + doubling — how push stays O(1) amortized.",
            Body: DynamicArrays,
            quiz: {
                questions: [
                    { q: "A dynamic array reallocates when…", choices: ["Every push", "length exceeds capacity (buffer full)", "You call get()", "Never"], answer: 1, explain: "It grows (typically doubling) only when the fixed buffer runs out of room." },
                    { q: "Amortized push is O(1) because the copies form…", choices: ["A constant", "An arithmetic series Θ(n²)", "A geometric series summing to O(n) total", "A logarithm"], answer: 2, explain: "1 + 2 + 4 + ... + n = 2n − 1, so total copy work is O(n): O(1) per push amortized." },
                    { q: "If you know the final size up front, you should…", choices: ["Push one at a time anyway", "Preallocate the buffer to skip intermediate copies", "Use unshift", "Sort first"], answer: 1, explain: "Preallocating avoids every reallocation — a real constant-factor and latency win." },
                ],
            },
            exercises: [
                {
                    id: "grow-open", kind: "open",
                    prompt: "Explain why dynamic arrays double capacity rather than growing by a fixed number of slots. Give the total copy cost of each strategy for n inserts.",
                    starter: "",
                    rubric: "Full credit: states doubling gives O(n) total copies (geometric series) → O(1) amortized, while fixed-increment growth gives Θ(n²) total copies (arithmetic series). Partial: identifies one of the two costs or gives the right intuition without the Θ classes.",
                    hint: "Sum the copies made at each resize for both strategies.",
                },
            ],
        },
        {
            id: "two-pointer", title: "The Two-Pointer Technique", minutes: 12,
            summary: "Collapse an O(n²) nested loop into one O(n) pass on sorted data.",
            Body: TwoPointer,
            quiz: {
                questions: [
                    { q: "The end-to-end pair-sum two-pointer method requires the array to be…", choices: ["Unsorted", "Sorted", "All positive", "A power of two in length"], answer: 1, explain: "Sortedness is what lets you safely discard the largest or smallest candidate each step." },
                    { q: "When the pair sum exceeds the target, you should…", choices: ["Move the left pointer right", "Move the right pointer left", "Restart", "Move both"], answer: 1, explain: "Too big means the largest element can't be in any valid pair — move hi left to shrink the sum." },
                    { q: "Two pointers converging give what time complexity for pair-sum?", choices: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 2, explain: "Each step retires one element, so the pointers meet in at most n steps." },
                ],
            },
            exercises: [
                {
                    id: "pair", kind: "numeric",
                    prompt: "On sorted a = [1, 3, 4, 6, 8, 11] with target 10, two pointers start at ends. After the FIRST comparison (1+11=12 > 10 → move hi left), what is the new value of a[hi]?",
                    starter: "", hint: "hi moves from index 5 to index 4.",
                    validate: (s) => Math.abs(parseFloat(s) - 8) < 0.01 ? { pass: true, message: "Correct — hi moves to index 4, a[hi] = 8." } : { pass: false, message: "The sum was too big, so hi decrements to index 4." },
                },
            ],
        },
        {
            id: "sliding-window", title: "Sliding Window", minutes: 12,
            summary: "Maintain a range property incrementally for O(n) subarray answers.",
            Body: SlidingWindow,
            quiz: {
                questions: [
                    { q: "A sliding window achieves O(n) by…", choices: ["Sorting the array", "Updating the window property incrementally as edges move", "Recomputing each window from scratch", "Using recursion"], answer: 1, explain: "Adding the entering element and removing the leaving one avoids recomputation." },
                    { q: "In a variable-size window, you shrink the left edge when…", choices: ["Every iteration", "A constraint is violated", "The array ends", "Never"], answer: 1, explain: "You grow greedily and contract only to restore the invariant (e.g. no repeats)." },
                    { q: "Why is a variable window still O(n) despite a nested-looking shrink loop?", choices: ["The left pointer only moves right, at most n times total", "It's actually O(n²)", "The array is sorted", "It uses a hash set"], answer: 0, explain: "Left advances monotonically and never passes right, so total left-moves ≤ n — amortized linear." },
                ],
            },
            exercises: [
                {
                    id: "window", kind: "numeric",
                    prompt: "For a = [2, 1, 5, 1, 3, 2] and k = 3, what is the maximum sum of any 3 consecutive elements?",
                    starter: "", hint: "Windows: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6.",
                    validate: (s) => Math.abs(parseFloat(s) - 9) < 0.01 ? { pass: true, message: "Correct — [5,1,3] sums to 9." } : { pass: false, message: "Slide a window of 3 and take the max: the best is [5,1,3]." },
                },
            ],
        },
        {
            id: "prefix-sums", title: "Prefix Sums", minutes: 11,
            summary: "Precompute running totals for O(1) range-sum queries.",
            Body: PrefixSums,
            quiz: {
                questions: [
                    { q: "With prefix array P, the sum of a[i..j-1] equals…", choices: ["P[j] + P[i]", "P[j] − P[i]", "P[i] − P[j]", "P[j] · P[i]"], answer: 1, explain: "Running totals subtract: P[j] − P[i] is the sum of the half-open range [i, j)." },
                    { q: "Building P then answering q range queries costs…", choices: ["O(qn)", "O(n + q)", "O(n²)", "O(q log n)"], answer: 1, explain: "One O(n) build, then O(1) per query → O(n + q) total, versus O(qn) recomputing." },
                    { q: "Prefix sums assume the underlying array is…", choices: ["Sorted", "Static (no updates)", "All positive", "A power of two"], answer: 1, explain: "Any update invalidates P downstream; for updates + queries you'd use a Fenwick/segment tree." },
                ],
            },
            exercises: [
                {
                    id: "range", kind: "numeric",
                    prompt: "For a = [3, 1, 4, 1, 5, 9], the prefix array is P = [0,3,4,8,9,14,23]. Using P[j] − P[i], what is the sum of a[2..4] (elements at indices 2 and 3, i.e. rangeSum(P, 2, 4))?",
                    starter: "", hint: "P[4] − P[2] = 9 − 4.",
                    validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — P[4] − P[2] = 9 − 4 = 5 (a[2]+a[3] = 4+1)." } : { pass: false, message: "Compute P[4] − P[2]." },
                },
            ],
        },
    ],
};
