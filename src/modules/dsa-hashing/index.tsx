import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code } from "../../components/code-block";

function HashFunctions() {
  return (
    <div className="prose">
      <p>
        Arrays give you <M>{`O(1)`}</M> access <em>by integer index</em>. But most of the time you
        want to look something up by a <em>key</em> that isn't a small integer — a name, a URL, a
        userID. The hashing idea is audacious: <strong>turn any key into an array index with a
        function</strong>, then use the array's <M>{`O(1)`}</M> indexing directly.
      </p>
      <p>
        A <strong>hash function</strong> <M>{`h`}</M> maps a key to a bucket index in{" "}
        <M>{`[0, m)`}</M>, where <M>{`m`}</M> is the number of buckets:
      </p>
      <MBlock>{`h : \\text{Key} \\to \\{0, 1, \\ldots, m-1\\}`}</MBlock>
      <p>
        Two properties make a hash function <em>good</em>. First, it must be{" "}
        <strong>deterministic</strong>: the same key always hashes to the same bucket, or you could
        never find anything again. Second, it should <strong>spread keys uniformly</strong> across
        buckets, so no single bucket becomes a hotspot. A typical string hash folds every character
        into an accumulator with a multiplier, then reduces mod <M>{`m`}</M>:
      </p>
      <Code
        lang="ts"
        filename="hash.ts"
        code={`// A classic polynomial (Java-style) string hash: h = s[0]*31^{k-1} + ... + s[k-1].
function hashString(s: string, m: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0; // | 0 keeps it a 32-bit int
  }
  return ((h % m) + m) % m;             // non-negative bucket in [0, m)
}
console.log(hashString("cat", 16), hashString("cat", 16)); // deterministic: same twice`}
      />
      <p>
        The multiplier (31 here) mixes character positions so "cat" and "act" land in different
        buckets — position matters, unlike a plain character sum. The final double-mod guards against
        a negative result from integer overflow.
      </p>

      <h3>The Division Method vs. the Multiplication Method</h3>
      <p>
        Once a key has been folded into a large integer <M>{`k`}</M>, we still must compress it into{" "}
        <M>{`[0, m)`}</M>. There are two classical reductions, and the choice interacts subtly with the
        value of <M>{`m`}</M>.
      </p>
      <ul>
        <li>
          <strong>Division method</strong>: take the remainder directly.
          <MBlock>{`h(k) = k \\bmod m`}</MBlock>
          It is a single instruction, but it is <em>fragile in the low bits of </em><M>{`m`}</M>. If{" "}
          <M>{`m = 2^p`}</M>, then <M>{`k \\bmod m`}</M> keeps only the low <M>{`p`}</M> bits of{" "}
          <M>{`k`}</M> and throws away all the high-bit mixing you worked for. For the same reason a
          power of ten is bad for decimal keys. The safe choice is a <strong>prime</strong> not close
          to a power of two, so every bit of <M>{`k`}</M> influences the bucket.
        </li>
        <li>
          <strong>Multiplication method</strong>: multiply by an irrational-flavored constant{" "}
          <M>{`A \\in (0,1)`}</M>, keep the fractional part, then scale to <M>{`m`}</M>.
          <MBlock>{`h(k) = \\big\\lfloor\\, m \\cdot ( k A \\bmod 1 ) \\,\\big\\rfloor`}</MBlock>
          Here <M>{`k A \\bmod 1`}</M> denotes the fractional part <M>{`kA - \\lfloor kA \\rfloor`}</M>.
          Because the fractional part already scrambles the value, <M>{`m`}</M> is now
          <em> unconstrained</em> — a power of two is fine and makes the final scale a bit shift.
          Knuth's recommended multiplier is the fractional part of the golden ratio,
          <MBlock>{`A = \\frac{\\sqrt{5} - 1}{2} \\approx 0.6180339887,`}</MBlock>
          whose continued-fraction expansion is the "most irrational" number, spreading successive keys
          as evenly as possible around the unit circle (the three-distance theorem).
        </li>
      </ul>
      <p>
        A related trap is <strong>modulo bias</strong>. If you draw a raw hash uniformly from{" "}
        <M>{`\\{0, \\ldots, 2^{32}-1\\}`}</M> and reduce it by <M>{`\\bmod m`}</M> when{" "}
        <M>{`m`}</M> does not divide <M>{`2^{32}`}</M>, the first <M>{`2^{32} \\bmod m`}</M> buckets
        receive one extra value each and are therefore slightly more likely — the distribution is no
        longer exactly uniform. It is negligible when <M>{`m \\ll 2^{32}`}</M> but matters when the
        range is comparable to the modulus.
      </p>

      <div className="notice warn">
        <span className="lbl">Hashing is not encryption</span>
        A data-structure hash is built for speed and spread, <em>not</em> security. It's fast to
        compute and often reversible in spirit. And by the pigeonhole principle, mapping infinitely
        many keys into <M>{`m`}</M> buckets <strong>must</strong> produce collisions — which is the
        entire subject of the next lesson.
      </div>
    </div>
  );
}

function Collisions() {
  return (
    <div className="prose">
      <p>
        Since more keys exist than buckets, two distinct keys will sometimes hash to the same index —
        a <strong>collision</strong>. A hash table is really "an array plus a collision-resolution
        strategy." There are two dominant strategies, and the choice shapes the table's entire
        performance character.
      </p>
      <p>
        <strong>Separate chaining</strong>: each bucket holds a small list of entries. On collision,
        you append to that bucket's list; on lookup, you hash to the bucket and scan its (short) list.
        Simple, tolerates high load, and deletion is trivial — but each entry costs a pointer and
        chasing list nodes hurts cache locality.
      </p>
      <p>
        <strong>Open addressing</strong>: everything lives in the array itself, with no side lists.
        On collision, you <em>probe</em> a deterministic sequence of alternative slots until you find
        an empty one.
      </p>

      <h3>Open Addressing Probing Equations</h3>
      <p>
        There are three common open-addressing probing algorithms:
      </p>
      <ul>
        <li>
          <strong>Linear Probing</strong>: Probe successive slots linearly.
          <MBlock>{`h_i(k) = \\big( h(k) + i \\big) \\bmod m, \\quad i = 0, 1, 2, \\dots`}</MBlock>
          It is highly cache-friendly but suffers from <strong>primary clustering</strong> — long contiguous runs of occupied slots that grow rapidly.
        </li>
        <li>
          <strong>Quadratic Probing</strong>: Probe using a quadratic function of the step counter <M>{`i`}</M>:
          <MBlock>{`h_i(k) = \\big( h(k) + c_1 i + c_2 i^2 \\big) \\bmod m, \\quad i = 0, 1, 2, \\dots`}</MBlock>
          This eliminates primary clustering but still exhibits <strong>secondary clustering</strong>, as keys with the same initial hash index trace the exact same probe sequence.
        </li>
        <li>
          <strong>Double Hashing</strong>: Use a second hash function <M>{`h_2(k)`}</M> to compute the step size:
          <MBlock>{`h_i(k) = \\big( h_1(k) + i \\cdot h_2(k) \\big) \\bmod m, \\quad i = 0, 1, 2, \\dots`}</MBlock>
          This eliminates both primary and secondary clustering since the step size depends on the key itself. To ensure the probe sequence visits all <M>{`m`}</M> slots, <M>{`h_2(k)`}</M> must be coprime to <M>{`m`}</M> (e.g., choosing a prime <M>{`m`}</M> and <M>{`h_2(k) > 0`}</M>).
        </li>
      </ul>

      <h3>The Birthday Paradox: Collisions Come Early</h3>
      <p>
        Newcomers assume that if a table has <M>{`m`}</M> buckets you can insert nearly <M>{`m`}</M>{" "}
        keys before colliding. The <strong>birthday paradox</strong> says otherwise: collisions appear
        after only about <M>{`\\sqrt{m}`}</M> insertions. Under simple uniform hashing (each key
        independently uniform over the buckets), the probability that <M>{`n`}</M> keys are{" "}
        <em>all distinct</em> is the product of "each new key misses the ones before it":
      </p>
      <MBlock>{`\\Pr[\\text{no collision}] = \\prod_{i=0}^{n-1}\\left(1 - \\frac{i}{m}\\right)`}</MBlock>
      <p>
        Using <M>{`1 - x \\approx e^{-x}`}</M> for small <M>{`x`}</M>, the product telescopes in the
        exponent (<M>{`\\sum_{i=0}^{n-1} i = \\tfrac{n(n-1)}{2}`}</M>):
      </p>
      <MBlock>{`\\Pr[\\text{no collision}] \\approx \\exp\\!\\left(-\\frac{n(n-1)}{2m}\\right)`}</MBlock>
      <p>
        Setting that probability to <M>{`\\tfrac{1}{2}`}</M> and solving gives the threshold at which a
        collision becomes more likely than not:
      </p>
      <MBlock>{`n \\approx \\sqrt{2m \\ln 2} \\approx 1.177\\sqrt{m}`}</MBlock>
      <p>
        For the classic 365-day case that is <M>{`\\approx 23`}</M> people; for a table of{" "}
        <M>{`m = 10^6`}</M> buckets, only about 1178 keys. The lesson for hashing is blunt: <strong>a
        table with far more empty buckets than entries is still riddled with collisions</strong>, which
        is exactly why we need a resolution strategy from the very first inserts, and why a 64-bit hash
        is chosen so that <M>{`\\sqrt{2^{64}} = 2^{32}`}</M> random keys are needed before a clash is
        likely.
      </p>

      <Code
        lang="ts"
        filename="probe.ts"
        code={`// Open addressing with linear probing (insert). EMPTY marks a free slot.
const EMPTY = Symbol("empty");
function insert(slots: (string | symbol)[], key: string, hash: (s: string, m: number) => number) {
  const m = slots.length;
  let i = hash(key, m);
  while (slots[i] !== EMPTY) {           // occupied — probe forward
    if (slots[i] === key) return;        // already present
    i = (i + 1) % m;                     // linear probe: next slot, wrap around
  }
  slots[i] = key;
}`}
      />
      <div className="notice">
        <span className="lbl">Deletion is the catch with open addressing</span>
        You can't just blank a slot — that would break the probe chain and hide later entries. Real
        implementations use a <strong>tombstone</strong> marker (a "deleted" sentinel) that lookups
        skip over but insertions may reuse. Chaining has no such problem, which is one reason it's a
        common default.
      </div>
    </div>
  );
}

function LoadFactor() {
  return (
    <div className="prose">
      <p>
        How full a table is drives how fast it is. The <strong>load factor</strong> is the ratio of
        stored entries to buckets:
      </p>
      <MBlock>{`\\alpha = \\frac{n}{m} \\quad (\\text{entries} / \\text{buckets})`}</MBlock>
      <p>
        For separate chaining, the expected chain length is exactly <M>{`\\alpha`}</M>, so an
        unsuccessful search touches <M>{`1 + \\alpha`}</M> entries on average — <M>{`O(1)`}</M>{" "}
        <em>as long as <M>{`\\alpha`}</M> stays bounded</em>. For open addressing the cost blows up
        far more violently as the table fills; the expected probes for linear probing scale like:
      </p>
      <MBlock>{`\\text{expected probes} \\approx \\frac{1}{2}\\left(1 + \\frac{1}{1 - \\alpha}\\right)`}</MBlock>
      <p>
        At <M>{`\\alpha = 0.5`}</M> that's about 1.5 probes; at <M>{`\\alpha = 0.9`}</M> it's about
        5.5; as <M>{`\\alpha \\to 1`}</M> it explodes toward infinity. So open-addressed tables{" "}
        <strong>resize</strong> once <M>{`\\alpha`}</M> crosses a threshold (commonly 0.5–0.75):
        allocate a bigger array (roughly 2×) and <strong>rehash</strong> every entry into it, because
        the bucket index depends on <M>{`m`}</M>. A resize is <M>{`O(n)`}</M>, but — exactly like the
        dynamic array — doubling makes it <M>{`O(1)`}</M> amortized per insert.
      </p>
      <h3>Expected Search Cost Under Simple Uniform Hashing</h3>
      <p>
        Where does the chain-length claim actually come from? Model each of the <M>{`n`}</M> keys as
        landing in a uniformly random bucket, independently — the <strong>simple uniform hashing</strong>{" "}
        assumption. Let <M>{`X_{ij}`}</M> be the indicator that keys <M>{`i`}</M> and <M>{`j`}</M> collide;
        by uniformity <M>{`\\Pr[X_{ij} = 1] = \\tfrac{1}{m}`}</M>, so <M>{`\\mathbb{E}[X_{ij}] = \\tfrac{1}{m}`}</M>.
      </p>
      <p>
        An <strong>unsuccessful</strong> search probes the whole chain of the target bucket. By
        linearity of expectation over the <M>{`n`}</M> stored keys, that expected chain length is
      </p>
      <MBlock>{`\\mathbb{E}[\\text{length}] = \\sum_{j=1}^{n} \\frac{1}{m} = \\frac{n}{m} = \\alpha,`}</MBlock>
      <p>
        so the miss costs <M>{`\\Theta(1 + \\alpha)`}</M> (the <M>{`1`}</M> pays for hashing and reaching
        the bucket even when it is empty). A <strong>successful</strong> search for a key inserted{" "}
        <M>{`i`}</M>-th scans it plus every key that arrived after it and hit the same bucket, giving
      </p>
      <MBlock>{`\\mathbb{E}[\\text{probes}] = \\frac{1}{n}\\sum_{i=1}^{n}\\left(1 + \\frac{n-i}{m}\\right) = 1 + \\frac{\\alpha}{2} - \\frac{\\alpha}{2n} \\approx 1 + \\frac{\\alpha}{2}.`}</MBlock>
      <p>
        Both are <M>{`\\Theta(1)`}</M> precisely because we hold <M>{`\\alpha`}</M> bounded by a
        constant. Let <M>{`\\alpha`}</M> grow with <M>{`n`}</M> — say by never resizing — and the same
        formulas turn the table into a linked list with <M>{`\\Theta(n)`}</M> lookups.
      </p>

      <h3>Amortized Cost of Rehashing</h3>
      <p>
        Each resize is an <M>{`O(n)`}</M> jolt, yet we still advertise <M>{`O(1)`}</M> inserts. The
        reconciliation is <strong>amortized analysis</strong>. Suppose we double <M>{`m`}</M> whenever the
        table fills. Inserting <M>{`n = 2^k`}</M> keys triggers rehashes at sizes{" "}
        <M>{`1, 2, 4, \\ldots, 2^{k-1}`}</M>, and the copying work is a geometric series:
      </p>
      <MBlock>{`\\sum_{j=0}^{k-1} 2^{j} = 2^{k} - 1 < n.`}</MBlock>
      <p>
        The total rehash cost over all <M>{`n`}</M> inserts is thus <M>{`O(n)`}</M>, so the{" "}
        <strong>amortized</strong> cost per insert is <M>{`O(n)/n = O(1)`}</M>. Equivalently, by the
        accounting method, charge each insert <M>{`3`}</M> credits — one to place the key, two banked so
        that when the table doubles, every key has saved enough to pay for copying itself. Growing by a
        <em> constant</em> amount instead of a constant <em>factor</em> breaks this: adding{" "}
        <M>{`c`}</M> slots at a time forces <M>{`\\Theta(n/c)`}</M> resizes touching{" "}
        <M>{`\\Theta(n^2)`}</M> keys total — <M>{`\\Theta(n)`}</M> amortized per insert. Geometric
        growth is what buys the constant.
      </p>

      <Code
        lang="ts"
        filename="resize.ts"
        code={`class HashSet {
  private buckets: string[][] = Array.from({ length: 8 }, () => []);
  private n = 0;
  private readonly maxLoad = 0.75;

  add(key: string, h: (s: string, m: number) => number) {
    const b = this.buckets[h(key, this.buckets.length)];
    if (!b.includes(key)) { b.push(key); this.n++; }
    if (this.n / this.buckets.length > this.maxLoad) this.resize(h); // keep α bounded
  }
  private resize(h: (s: string, m: number) => number) {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []);  // double m
    for (const bucket of old) for (const key of bucket)               // rehash all
      this.buckets[h(key, this.buckets.length)].push(key);
  }
}`}
      />
      <div className="notice warn">
        <span className="lbl">You must rehash — you can't just copy</span>
        Because the bucket is <M>{`h(k) \\bmod m`}</M> and <M>{`m`}</M> just changed, every key can
        move to a different bucket. Copying entries to the same indices in a bigger array would put
        them where lookups will never search. Every entry gets its bucket recomputed.
      </div>
    </div>
  );
}

function MapsInPractice() {
  return (
    <div className="prose">
      <p>
        A <strong>hash set</strong> stores keys for membership tests; a <strong>hash map</strong>{" "}
        stores key→value pairs. JavaScript ships both as <code>Set</code> and <code>Map</code>, and
        they give you the headline guarantee: <strong>average <M>{`O(1)`}</M></strong> insert, lookup,
        and delete. That constant-time membership is what makes hashing beat sorting for so many
        problems.
      </p>
      <p>
        Consider "does this array contain a duplicate?" Sorting-based: sort (<M>{`O(n \\log n)`}</M>),
        then scan adjacent pairs. Hash-based: insert into a set, stop when you re-see a key —{" "}
        <M>{`O(n)`}</M> expected. When you only need <em>membership or counts</em> and don't need the
        data ordered, hashing wins:
      </p>
      <MBlock>{`\\text{sort + scan: } O(n \\log n) \\qquad\\text{vs.}\\qquad \\text{hash set: } O(n) \\text{ expected}`}</MBlock>
      <p>
        The word <em>expected</em> is doing real work. Hash operations are <M>{`O(1)`}</M>{" "}
        <strong>on average</strong>, assuming a decent hash and bounded load factor. A pathological
        input (or an adversary who crafts colliding keys) can degrade a table to <M>{`O(n)`}</M> per
        operation — every key in one bucket. Sorting, by contrast, offers a hard{" "}
        <M>{`O(n \\log n)`}</M> worst-case guarantee and gives you <em>ordering</em> as a byproduct,
        which hashing throws away.
      </p>
      <h3>Universal Hashing: Defeating the Adversary</h3>
      <p>
        The <M>{`O(n)`}</M> worst case above is not hypothetical. For any <em>fixed</em> hash function{" "}
        <M>{`h`}</M>, an attacker who knows it can precompute a set of keys that all collide, collapsing
        every operation to a linear scan (a real denial-of-service vector against web servers). The fix
        is to stop committing to one function: pick <M>{`h`}</M> <strong>at random</strong> from a
        carefully designed family <M>{`\\mathcal{H}`}</M> at table-creation time.
      </p>
      <p>
        A family <M>{`\\mathcal{H}`}</M> of functions into <M>{`[0, m)`}</M> is called{" "}
        <strong>universal</strong> if for every pair of distinct keys the chance of collision over the
        random choice of <M>{`h`}</M> is no worse than the ideal <M>{`\\tfrac{1}{m}`}</M>:
      </p>
      <MBlock>{`\\forall\\, x \\neq y : \\quad \\Pr_{h \\in \\mathcal{H}}\\big[\\, h(x) = h(y) \\,\\big] \\le \\frac{1}{m}.`}</MBlock>
      <p>
        The crucial shift is <em>where the randomness lives</em>: the keys are fixed and possibly
        adversarial, but <M>{`h`}</M> is random and secret, so no fixed input can be "bad" in
        expectation. This bound is exactly what the chain-length proof needed —{" "}
        <M>{`\\mathbb{E}[X_{xy}] = \\Pr[h(x)=h(y)] \\le \\tfrac{1}{m}`}</M> — so the expected search cost{" "}
        <M>{`\\Theta(1 + \\alpha)`}</M> now holds <strong>for any input whatsoever</strong>, not just
        under the optimistic uniform-hashing assumption.
      </p>
      <p>
        A standard universal family is the <strong>Carter–Wegman</strong> construction. Fix a prime{" "}
        <M>{`p`}</M> larger than any key, and draw <M>{`a \\in \\{1, \\ldots, p-1\\}`}</M> and{" "}
        <M>{`b \\in \\{0, \\ldots, p-1\\}`}</M> uniformly:
      </p>
      <MBlock>{`h_{a,b}(x) = \\big( (a\\,x + b) \\bmod p \\big) \\bmod m.`}</MBlock>
      <p>
        Requiring <M>{`\\Pr[h(x)=h(y)] \\le \\tfrac{c}{m}`}</M> for a constant <M>{`c`}</M> gives the
        weaker but often sufficient <M>{`c`}</M>-universal notion. This is why production hash tables
        (and languages like Python, Rust, and Java's newer maps) seed their hash with a random,
        per-process value: it is universal hashing turning a devastating worst case into an{" "}
        <em>expected</em>-case guarantee an attacker cannot force.
      </p>

      <Code
        lang="ts"
        filename="when-hash.ts"
        code={`// Membership / dedup where order doesn't matter → hashing wins.
function hasDuplicate(a: number[]): boolean {   // O(n) expected
  const seen = new Set<number>();
  for (const x of a) { if (seen.has(x)) return true; seen.add(x); }
  return false;
}

// If you ALSO need sorted output or nearest-neighbor / range queries,
// a hash gives you none of that — sort or use a tree instead.`}
      />
      <div className="notice">
        <span className="lbl">Choose hashing when…</span>
        …you need fast membership, counting, or key→value lookup and you <em>don't</em> need sorted
        order, range queries ("all keys between x and y"), or a worst-case guarantee. If you need
        those, reach for a sorted array or a balanced tree (<M>{`O(\\log n)`}</M>).
      </div>
    </div>
  );
}

function HashPatterns() {
  return (
    <div className="prose">
      <p>
        A large fraction of array/string problems reduce to three hash-map moves. Learn to recognize
        them and half of interview-style problems become mechanical.
      </p>
      <p>
        <strong>Frequency counting</strong>: one pass building a <code>Map&lt;key, count&gt;</code>.
        Anagram checks, "most common element," "first non-repeating character," majority element —
        all fall out of a frequency map in <M>{`O(n)`}</M>.
      </p>
      <p>
        <strong>Deduplication / membership</strong>: throw everything into a <code>Set</code> to
        collapse duplicates or test "have I seen this?" in <M>{`O(1)`}</M>. Cycle-in-a-sequence
        detection, visited-node tracking in graph search, and "unique elements" all use this.
      </p>
      <p>
        <strong>Complement lookup (two-sum)</strong>: the marquee pattern. To find a pair summing to{" "}
        <M>{`t`}</M> in an <em>unsorted</em> array, walk once; for each <M>{`x`}</M> ask the set
        whether the complement <M>{`t - x`}</M> was already seen. This is the <M>{`O(n)`}</M> answer
        that beats both the <M>{`O(n^2)`}</M> brute force and the <M>{`O(n \\log n)`}</M> sort-then-
        two-pointer approach — and unlike two pointers it needs no sorting.
      </p>
      <Code
        lang="ts"
        filename="patterns.ts"
        code={`// 1) Frequency counting — anagram test in O(n).
function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const freq = new Map<string, number>();
  for (const c of a) freq.set(c, (freq.get(c) ?? 0) + 1);
  for (const c of b) {
    const f = freq.get(c);
    if (!f) return false;              // char missing or already used up
    freq.set(c, f - 1);
  }
  return true;
}

// 3) Complement lookup — two-sum on UNSORTED input, O(n).
function twoSum(a: number[], t: number): [number, number] | null {
  const seen = new Map<number, number>();  // value -> index
  for (let i = 0; i < a.length; i++) {
    const need = t - a[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(a[i], i);
  }
  return null;
}`}
      />
      <div className="notice warn">
        <span className="lbl">Insert AFTER you check</span>
        In the complement pattern, look up <M>{`t - x`}</M> <em>before</em> inserting <M>{`x`}</M>.
        Insert first and an element can pair with itself (e.g. target 8 with a lone 4 falsely
        "matching"). Order of check-then-insert is the whole correctness argument.
      </div>
    </div>
  );
}

export const dsaHashing: Module = {
  id: "dsa-hashing",
  title: "Hashing & Maps",
  icon: "🗄️",
  track: "dsa",
  blurb:
    "Turning keys into array indices: hash functions, collision resolution, load factor and resizing, and the frequency/dedup/two-sum patterns.",
  dependsOn: ["dsa-arrays"],
  lessons: [
    {
      id: "hash-functions", title: "Hash Functions & The Idea", minutes: 12,
      summary: "Map any key to an array index — deterministically and uniformly.",
      Body: HashFunctions,
      quiz: {
        questions: [
          { q: "The two essential properties of a good hash function are…", choices: ["Fast and secure", "Deterministic and uniformly spreading", "Random and slow", "Reversible and encrypted"], answer: 1, explain: "It must give the same bucket for the same key (deterministic) and spread keys evenly (uniform)." },
          { q: "Why does the string hash multiply by 31 per character instead of just summing char codes?", choices: ["31 is prime and looks nice", "To make character position matter, so 'cat' and 'act' differ", "To encrypt the string", "To make it slower"], answer: 1, explain: "The positional multiplier means anagrams hash differently — a plain sum wouldn't distinguish them." },
          { q: "Collisions are…", choices: ["A bug to be eliminated", "Impossible with a good hash", "Inevitable by the pigeonhole principle", "Only a security concern"], answer: 2, explain: "More possible keys than buckets guarantees some keys share a bucket — collisions must be handled, not avoided." },
        ],
      },
      exercises: [
        {
          id: "bucket", kind: "numeric",
          prompt: "A key hashes to the raw integer 100. With m = 16 buckets, the bucket index is 100 mod 16. Enter it.",
          starter: "", hint: "100 = 6·16 + r.",
          validate: (s) => Math.abs(parseFloat(s) - 4) < 0.01 ? { pass: true, message: "Correct — 100 mod 16 = 4." } : { pass: false, message: "100 − 6·16 = ?" },
        },
      ],
    },
    {
      id: "collisions", title: "Collision Resolution", minutes: 13,
      summary: "Separate chaining vs open addressing, and why deletion differs.",
      Body: Collisions,
      quiz: {
        questions: [
          { q: "Separate chaining resolves collisions by…", choices: ["Probing nearby slots", "Storing a list of entries per bucket", "Rehashing immediately", "Rejecting the key"], answer: 1, explain: "Each bucket holds a short list; colliding keys append to it." },
          { q: "Linear probing's main weakness is…", choices: ["Poor cache behavior", "Clustering — runs of full slots that grow", "It can't wrap around", "It needs pointers"], answer: 1, explain: "Occupied runs merge and lengthen, degrading probe times — primary clustering." },
          { q: "Deleting from an open-addressed table requires a tombstone because…", choices: ["It saves memory", "Blanking a slot would break probe chains and hide later entries", "Tombstones are faster", "You can't delete otherwise"], answer: 1, explain: "A blank slot ends a probe sequence early; a tombstone keeps the chain intact while marking the slot free to reuse." },
        ],
      },
      exercises: [
        {
          id: "collide-open", kind: "open",
          prompt: "Compare separate chaining and open addressing on two axes: cache locality and ease of deletion. State which wins each axis and why.",
          starter: "",
          rubric: "Full credit: open addressing wins cache locality (contiguous array, no pointer chasing), chaining wins ease of deletion (just remove from list vs needing tombstones). Partial: correct on one axis only, or correct directions without the reasoning.",
          hint: "Think about where entries physically live and what happens when you remove one.",
        },
      ],
    },
    {
      id: "load-factor", title: "Load Factor & Resizing", minutes: 12,
      summary: "α = n/m drives performance; cross a threshold and rehash.",
      Body: LoadFactor,
      quiz: {
        questions: [
          { q: "The load factor α is defined as…", choices: ["buckets / entries", "entries / buckets (n/m)", "collisions / entries", "m · n"], answer: 1, explain: "α = n/m. For chaining it's the expected chain length." },
          { q: "As α → 1 in an open-addressed table, expected probes…", choices: ["Stay at 1", "Decrease", "Explode toward infinity", "Become O(log n)"], answer: 2, explain: "The ½(1 + 1/(1−α)) estimate diverges as α approaches 1 — hence resizing before then." },
          { q: "During a resize you must rehash every entry because…", choices: ["The keys changed", "The bucket index h(k) mod m depends on m, which changed", "It's faster", "Tombstones require it"], answer: 1, explain: "A new m means new bucket indices; copying to the same slots would misplace keys." },
        ],
      },
      exercises: [
        {
          id: "load", kind: "numeric",
          prompt: "A table has m = 16 buckets and a max load factor of 0.75. What is the maximum number of entries n before a resize is triggered? (n/m ≤ 0.75.)",
          starter: "", hint: "0.75 × 16.",
          validate: (s) => Math.abs(parseFloat(s) - 12) < 0.01 ? { pass: true, message: "Correct — 0.75 × 16 = 12 entries." } : { pass: false, message: "Compute 0.75 × 16." },
        },
      ],
    },
    {
      id: "maps-in-practice", title: "Sets, Maps & Beating Sorting", minutes: 12,
      summary: "Average O(1) ops, the 'expected' caveat, and when to prefer trees.",
      Body: MapsInPractice,
      quiz: {
        questions: [
          { q: "Hash set operations are O(1)…", choices: ["In the worst case, guaranteed", "On average / expected, with a good hash and bounded load", "Never", "Only for integers"], answer: 1, explain: "The guarantee is expected O(1); adversarial collisions can degrade it to O(n)." },
          { q: "For a duplicate check where order doesn't matter, hashing beats sorting because…", choices: ["O(n) expected vs O(n log n)", "It uses less memory", "Sorting is buggy", "Hashing sorts too"], answer: 0, explain: "A single hash pass is linear; sorting first is O(n log n) and you don't need the order." },
          { q: "You should prefer a balanced tree over a hash map when you need…", choices: ["Fast membership only", "Range queries or sorted iteration", "Less code", "Integer keys"], answer: 1, explain: "Trees give ordered traversal and range queries in O(log n); hashing throws order away." },
        ],
      },
      exercises: [
        {
          id: "expected-open", kind: "open",
          prompt: "A hash map gives 'expected O(1)' operations while a balanced tree gives 'worst-case O(log n)'. Describe one scenario where you'd deliberately choose the tree despite its slower average, and why.",
          starter: "",
          rubric: "Full credit: names a concrete reason — need for worst-case guarantees (adversarial input / latency SLAs), sorted iteration, or range queries — and ties it to the tree's ordering or hard bound. Partial: gives a valid reason without connecting it to the tree's specific advantage.",
          hint: "Think about adversarial inputs, ordering, or range queries.",
        },
      ],
    },
    {
      id: "hash-patterns", title: "Common Hash Patterns", minutes: 12,
      summary: "Frequency counting, dedup/membership, and complement two-sum.",
      Body: HashPatterns,
      quiz: {
        questions: [
          { q: "Checking if two strings are anagrams with a frequency map is…", choices: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], answer: 2, explain: "One pass to count, one pass to decrement — linear." },
          { q: "The complement (two-sum) pattern finds a pair summing to t in unsorted data in…", choices: ["O(n²)", "O(n log n)", "O(n) with a hash map", "O(log n)"], answer: 2, explain: "For each x, look up t − x in the map — one linear pass, no sorting needed." },
          { q: "In the complement pattern you should look up t − x…", choices: ["After inserting x", "Before inserting x", "It doesn't matter", "Twice"], answer: 1, explain: "Checking before inserting prevents an element from falsely pairing with itself." },
        ],
      },
      exercises: [
        {
          id: "twosum", kind: "numeric",
          prompt: "Running two-sum on a = [3, 5, 2, 8] with target t = 10, using a 'value → index' map and checking the complement before inserting: what is the index i at which the algorithm first returns a match (the SECOND element of the found pair)?",
          starter: "", hint: "At i=3, a[3]=8, need 2, which was seen at index 2. So it returns [2, 3].",
          validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01 ? { pass: true, message: "Correct — at i = 3 (value 8), the complement 2 was already in the map, so it returns [2, 3]." } : { pass: false, message: "Walk through: the match is found when 8 looks up its complement 2. What index is 8 at?" },
        },
      ],
    },
  ],
};
