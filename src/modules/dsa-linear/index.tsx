import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code } from "../../components/CodeBlock";

function LinkedLists() {
  return (
    <div className="prose">
      <p>
        An array stores its elements together and pays for it at the edges (mid-array insert is{" "}
        <M>{`O(n)`}</M>). A <strong>linked list</strong> makes the opposite trade: elements live
        wherever memory is free, and each <strong>node</strong> carries a pointer to the next one. The
        structure <em>is</em> the chain of pointers.
      </p>
      <p>
        A <strong>singly linked list</strong> node holds a value and a <code>next</code> pointer; the
        last node's <code>next</code> is null. A <strong>doubly linked list</strong> adds a{" "}
        <code>prev</code> pointer, so you can walk backward and splice a node out in <M>{`O(1)`}</M>{" "}
        given a reference to it. The cost of that flexibility is an extra pointer per node and more
        bookkeeping.
      </p>

      <h3>Doubly Linked List Pointer Updates</h3>
      <p>
        Splice operations in a doubly linked list require careful rewiring of pointers. Let's look at the exact assignments:
      </p>
      <p>
        <strong>1. Insertion:</strong> To insert a new node <M>{`N`}</M> between existing nodes <M>{`A`}</M> and <M>{`B`}</M> (so <M>{`A \\leftrightarrow B`}</M> becomes <M>{`A \\leftrightarrow N \\leftrightarrow B`}</M>):
      </p>
      <ul>
        <li>Set the new node's outgoing links:
          <MBlock>{`N.\\text{next} = B, \\qquad N.\\text{prev} = A`}</MBlock>
        </li>
        <li>Update the neighboring nodes' incoming links:
          <MBlock>{`A.\\text{next} = N, \\qquad B.\\text{prev} = N`}</MBlock>
        </li>
      </ul>
      <p>
        <strong>2. Deletion:</strong> To remove node <M>{`X`}</M> situated between <M>{`A`}</M> and <M>{`B`}</M> (so <M>{`A \\leftrightarrow X \\leftrightarrow B`}</M> becomes <M>{`A \\leftrightarrow B`}</M>):
      </p>
      <ul>
        <li>Bypass <M>{`X`}</M> by connecting <M>{`A`}</M> and <M>{`B`}</M> directly:
          <MBlock>{`A.\\text{next} = X.\\text{next} \\quad (\\text{which is } B)`}</MBlock>
          <MBlock>{`B.\\text{prev} = X.\\text{prev} \\quad (\\text{which is } A)`}</MBlock>
        </li>
      </ul>

      <p>
        The performance profile is the mirror image of an array:
      </p>
      <MBlock>{`\\begin{array}{lcc} & \\textbf{array} & \\textbf{linked list} \\\\ \\text{index / random access} & O(1) & O(n) \\\\ \\text{insert/delete at a known node} & O(n) & O(1) \\\\ \\text{insert/delete at front} & O(n) & O(1) \\end{array}`}</MBlock>
      <p>
        The catch that Big-O hides: a linked list has <strong>no cache locality</strong>. Its nodes
        are scattered, so every <code>next</code> hop can be a cache miss. In practice a
        contiguous array often beats a linked list even for workloads the list "should" win, purely
        on memory-access constants. Lists shine when you hold direct references to nodes and splice
        constantly (LRU caches, adjacency lists, free lists).
      </p>
      <Code
        lang="ts"
        filename="list.ts"
        code={`class ListNode<T> {
  constructor(public value: T, public next: ListNode<T> | null = null) {}
}

// Insert 'value' immediately after 'node' — O(1), the list's superpower.
function insertAfter<T>(node: ListNode<T>, value: T): void {
  node.next = new ListNode(value, node.next); // rewire two pointers, no shifting
}

// Reverse a singly linked list in place — O(n) time, O(1) space.
function reverse<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null, cur = head;
  while (cur) {
    const next = cur.next; // save before we clobber it
    cur.next = prev;       // flip the pointer backward
    prev = cur; cur = next;
  }
  return prev;             // new head
}`}
      />
      <div className="notice warn">
        <span className="lbl">Save 'next' before you overwrite it</span>
        The single most common linked-list bug is reassigning <code>cur.next</code> before stashing
        the old value, which severs the rest of the list. Whenever you rewire pointers, capture what
        you'll need next <em>first</em>.
      </div>
    </div>
  );
}

function Stacks() {
  return (
    <div className="prose">
      <p>
        A <strong>stack</strong> is a collection with one rule: the last thing in is the first thing
        out — <strong>LIFO</strong>. You may only <code>push</code> onto the top and{" "}
        <code>pop</code> from the top, both <M>{`O(1)`}</M>. That constraint is not a limitation, it's
        the point: it models any process that must be unwound in reverse order.
      </p>
      <p>Where the LIFO discipline shows up:</p>
      <ul>
        <li><strong>The call stack.</strong> Function calls push a frame; returning pops it. The most recently called function returns first — LIFO — which is also why deep recursion overflows <em>the stack</em>.</li>
        <li><strong>Undo/redo.</strong> Each action pushes onto an undo stack; undo pops the most recent.</li>
        <li><strong>Expression evaluation & matching.</strong> Balanced-bracket checking and converting/evaluating arithmetic (shunting-yard, RPN) are textbook stack algorithms.</li>
        <li><strong>Iterative DFS.</strong> A stack replaces recursion to traverse trees/graphs without blowing the call stack.</li>
      </ul>
      <p>
        A stack needs no fancy backing store — a dynamic array is ideal, since push/pop at the{" "}
        <em>end</em> are both <M>{`O(1)`}</M> amortized (front operations would be <M>{`O(n)`}</M>, so
        never use the front).
      </p>
      <Code
        lang="ts"
        filename="balanced.ts"
        code={`// Balanced-brackets check — the canonical stack problem, O(n).
function isBalanced(s: string): boolean {
  const stack: string[] = [];
  const close: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);                       // opener: remember it
    } else if (c in close) {
      if (stack.pop() !== close[c]) return false; // must match most-recent opener
    }
  }
  return stack.length === 0;               // nothing left unclosed
}
console.log(isBalanced("([]{})"), isBalanced("([)]")); // true false`}
      />
      <div className="notice">
        <span className="lbl">Why the most-recent opener?</span>
        Brackets nest, and nesting is inherently LIFO: the bracket you must close next is always the
        one you opened most recently. That's exactly a stack's <code>pop</code>. <code>"([)]"</code>{" "}
        fails because the <code>)</code> tries to close a <code>(</code> while a <code>[</code> is
        still the most recent opener.
      </div>
    </div>
  );
}

function QueuesDeques() {
  return (
    <div className="prose">
      <p>
        A <strong>queue</strong> flips the discipline: first in, first out — <strong>FIFO</strong>.
        You <code>enqueue</code> at the back and <code>dequeue</code> from the front, modeling
        anything processed in arrival order: task schedulers, print spoolers, and — crucially —{" "}
        <strong>breadth-first search</strong>, whose level-by-level exploration <em>is</em> a queue.
      </p>
      <p>
        The naive array queue has a trap: dequeuing with <code>arr.shift()</code> is <M>{`O(n)`}</M>{" "}
        because every remaining element shifts down. The fix is a <strong>ring buffer</strong>
        (circular buffer): a fixed array with <code>head</code> and <code>tail</code> indices that
        wrap around using modulo. Both ends become <M>{`O(1)`}</M> with no shifting.
      </p>

      <h3>Ring Buffer Index Arithmetic</h3>
      <p>
        A circular queue of capacity <M>{`C`}</M> manages two indices <M>{`head`}</M> and <M>{`tail`}</M>. 
        The operations update the indices modulo <M>{`C`}</M>:
      </p>
      <ul>
        <li>
          <strong>Enqueue (Insert at back):</strong> Place item at <M>{`tail`}</M> and advance <M>{`tail`}</M>:
          <MBlock>{`\\text{tail} = (\\text{tail} + 1) \\bmod C`}</MBlock>
        </li>
        <li>
          <strong>Dequeue (Remove from front):</strong> Retrieve item at <M>{`head`}</M> and advance <M>{`head`}</M>:
          <MBlock>{`\\text{head} = (\\text{head} + 1) \\bmod C`}</MBlock>
        </li>
        <li>
          <strong>Empty vs. Full states:</strong> 
          We define empty and full using the count of elements <M>{`N`}</M> in the queue:
          <MBlock>{`\\text{Empty} \\iff N = 0, \\qquad \\text{Full} \\iff N = C`}</MBlock>
          If tracking <M>{`N`}</M> is not desired, we can reserve one slot as a sentinel/dead space, where:
          <MBlock>{`\\text{Empty} \\iff \\text{head} = \\text{tail}, \\qquad \\text{Full} \\iff (\\text{tail} + 1) \\bmod C = \\text{head}`}</MBlock>
        </li>
      </ul>

      <p>
        A <strong>deque</strong> (double-ended queue) generalizes both: <M>{`O(1)`}</M> push and pop
        at <em>either</em> end. It's a stack and a queue at once, and it's the workhorse behind the
        monotonic-deque sliding-window-maximum algorithm.
      </p>
      <Code
        lang="ts"
        filename="ringbuffer.ts"
        code={`class RingQueue<T> {
  private buf: (T | undefined)[];
  private head = 0;   // index of the front element
  private tail = 0;   // index where the next enqueue goes
  private count = 0;
  constructor(capacity: number) { this.buf = new Array(capacity); }

  enqueue(x: T): boolean {
    if (this.count === this.buf.length) return false; // full
    this.buf[this.tail] = x;
    this.tail = (this.tail + 1) % this.buf.length;     // wrap around — O(1)
    this.count++;
    return true;
  }
  dequeue(): T | undefined {
    if (this.count === 0) return undefined;
    const x = this.buf[this.head];
    this.head = (this.head + 1) % this.buf.length;     // O(1), no shifting
    this.count--;
    return x;
  }
}`}
      />
      <div className="notice warn">
        <span className="lbl">Distinguish full from empty</span>
        In a ring buffer, <code>head === tail</code> is ambiguous — it can mean empty <em>or</em>
        full. Track an explicit <code>count</code> (as above) or leave one slot always unused. Getting
        this wrong silently drops or overwrites elements.
      </div>
    </div>
  );
}

function FastSlow() {
  return (
    <div className="prose">
      <p>
        The <strong>fast/slow pointer</strong> pattern (Floyd's "tortoise and hare") runs two pointers
        through a linked structure at different speeds. It answers questions about structure using{" "}
        <M>{`O(1)`}</M> extra space — no visited set required.
      </p>
      <p>
        <strong>Cycle detection.</strong> Advance <code>slow</code> by one node and <code>fast</code>{" "}
        by two each step. If the list ends (<code>fast</code> hits null), there's no cycle. If there{" "}
        <em>is</em> a cycle, <code>fast</code> laps the loop and the two <strong>must eventually
        meet</strong> — because inside the cycle the gap between them closes by exactly one node per
        step and can't skip over 0.
      </p>
      <MBlock>{`\\text{gap decreases by } 2 - 1 = 1 \\text{ per step} \\;\\Rightarrow\\; \\text{gap hits } 0 \\Rightarrow \\text{they meet}`}</MBlock>
      <p>
        The same idea finds the <strong>middle</strong> of a list in one pass (when fast reaches the
        end, slow is at the midpoint) and detects duplicate-number cycles in arrays. It's{" "}
        <M>{`O(n)`}</M> time, <M>{`O(1)`}</M> space — strictly better on memory than the obvious
        hash-set approach.
      </p>
      <Code
        lang="ts"
        filename="floyd.ts"
        code={`class Node { constructor(public next: Node | null = null) {} }

// Does the list contain a cycle? Floyd's algorithm — O(n) time, O(1) space.
function hasCycle(head: Node | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;        // +1
    fast = fast.next.next;    // +2
    if (slow === fast) return true; // they met → cycle
  }
  return false;               // fast fell off the end → no cycle
}

// Find the middle node in one pass.
function middle(head: Node | null): Node | null {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow!.next; fast = fast.next.next; }
  return slow;                // slow is at the midpoint
}`}
      />
      <div className="notice">
        <span className="lbl">Why not just a visited set?</span>
        A hash set of visited nodes also detects cycles in <M>{`O(n)`}</M> — but at <M>{`O(n)`}</M>{" "}
        space. Floyd's trick gets the same answer in <M>{`O(1)`}</M> space, which matters when the
        structure is huge or memory is tight. It's the classic space-optimization win.
      </div>
    </div>
  );
}

function MonotonicStack() {
  return (
    <div className="prose">
      <p>
        A <strong>monotonic stack</strong> is an ordinary stack with one extra invariant: its
        contents stay sorted (all-increasing or all-decreasing) as you go from bottom to top. Before
        pushing a new element, you <code>pop</code> everything that would violate the order. It turns
        a family of "find the next/previous greater (or smaller) element" problems from{" "}
        <M>{`O(n^2)`}</M> into <M>{`O(n)`}</M>.
      </p>
      <p>
        The canonical use is <strong>"next greater element"</strong>: for each item, what's the first
        later item bigger than it? Keep a stack of <em>indices</em> whose values are decreasing. When
        a new value arrives that's bigger than the value at the top, that new value is the answer for
        every index you pop — so you pop and resolve them, then push the newcomer.
      </p>
      <p>
        The complexity argument is pure amortization: each index is <strong>pushed once and popped at
        most once</strong> across the whole run. So although there's an inner <code>while</code> loop,
        total work is <M>{`\\le 2n`}</M> operations — <M>{`O(n)`}</M>.
      </p>
      <MBlock>{`\\text{each index: } 1 \\text{ push} + \\le 1 \\text{ pop} \\;\\Rightarrow\\; \\text{total} \\le 2n = O(n)`}</MBlock>
      <Code
        lang="ts"
        filename="monotonic.ts"
        code={`// For each index i, next[i] = value of the first later element greater than a[i],
// or -1 if none. Monotonic (decreasing) stack of indices. O(n).
function nextGreater(a: number[]): number[] {
  const next = new Array<number>(a.length).fill(-1);
  const stack: number[] = [];                 // indices, values decreasing top→down
  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      next[stack.pop()!] = a[i];              // a[i] resolves each popped index
    }
    stack.push(i);                            // maintain the decreasing invariant
  }
  return next;                                // leftover indices keep -1
}
console.log(nextGreater([2, 1, 3, 1])); // [3, 3, -1, -1]`}
      />
      <div className="notice warn">
        <span className="lbl">Store indices, not just values</span>
        Pushing indices (not raw values) lets you also recover <em>distance</em> to the next greater
        element (e.g. "days until a warmer temperature") and index back into the array. Decide up
        front whether you want the next <em>greater</em> or <em>smaller</em> element — it only flips
        the comparison in the while-condition.
      </div>
    </div>
  );
}

export const dsaLinear: Module = {
  id: "dsa-linear",
  title: "Linked Lists, Stacks & Queues",
  icon: "🔗",
  track: "dsa",
  blurb:
    "Pointer-based structures and the disciplines built on them: linked lists, LIFO stacks, FIFO queues and ring buffers, fast/slow pointers, and monotonic stacks.",
  dependsOn: ["dsa-complexity"],
  lessons: [
    {
      id: "linked-lists", title: "Linked Lists", minutes: 13,
      summary: "Nodes and pointers — the mirror image of an array's tradeoffs.",
      Body: LinkedLists,
      quiz: {
        questions: [
          { q: "Accessing the i-th element of a singly linked list is…", choices: ["O(1)", "O(log n)", "O(n) — you walk i pointers", "O(n²)"], answer: 2, explain: "There's no address formula; you follow next pointers one at a time." },
          { q: "The advantage a doubly linked list has over a singly linked one is…", choices: ["Less memory", "O(1) backward traversal and node removal given a reference", "Faster indexing", "Cache locality"], answer: 1, explain: "The prev pointer lets you go backward and splice out a node in O(1)." },
          { q: "Despite good Big-O for splicing, linked lists often lose to arrays because…", choices: ["They use less memory", "They have no cache locality — scattered nodes cause cache misses", "They can't be reversed", "Pointers are slow to declare"], answer: 1, explain: "Non-contiguous nodes defeat the cache, so constant factors favor contiguous arrays." },
        ],
      },
      exercises: [
        {
          id: "reverse-open", kind: "open",
          prompt: "In the in-place list reversal loop, explain why we must save `cur.next` into a temporary before setting `cur.next = prev`. What breaks if we don't?",
          starter: "",
          rubric: "Full credit: setting cur.next = prev overwrites the only pointer to the rest of the list, so without saving it first you lose access to all following nodes (the loop can't advance / the list is severed). Partial: says the list breaks without explaining the lost forward pointer.",
          hint: "cur.next is the only reference to the remainder of the list.",
        },
      ],
    },
    {
      id: "stacks", title: "Stacks (LIFO)", minutes: 11,
      summary: "Last-in-first-out: call stacks, undo, and expression matching.",
      Body: Stacks,
      quiz: {
        questions: [
          { q: "A stack is characterized by…", choices: ["FIFO order", "LIFO — last in, first out", "Random access", "Sorted order"], answer: 1, explain: "Push and pop both act on the top; the most recent element leaves first." },
          { q: "Which is NOT a natural fit for a stack?", choices: ["Undo history", "Function call frames", "Breadth-first search", "Balanced-bracket checking"], answer: 2, explain: "BFS is FIFO (a queue). The other three are inherently LIFO." },
          { q: "'([)]' is not balanced because…", choices: ["It has odd length", "')' tries to close '(' while '[' is the most recent unclosed opener", "Brackets can't nest", "It's too short"], answer: 1, explain: "Nesting is LIFO; the ')' doesn't match the most-recently-opened '[', so the stack top mismatches." },
        ],
      },
      exercises: [
        {
          id: "stack-eval", kind: "numeric",
          prompt: "Evaluate the RPN (postfix) expression '3 4 + 5 *' using a stack. Push numbers; on an operator pop two, apply, push the result. What is the final value?",
          starter: "", hint: "(3 + 4) then × 5.",
          validate: (s) => Math.abs(parseFloat(s) - 35) < 0.01 ? { pass: true, message: "Correct — (3 + 4) × 5 = 35." } : { pass: false, message: "Push 3, 4; '+' pops them → 7; push 5; '*' pops 7 and 5 → 35." },
        },
      ],
    },
    {
      id: "queues-deques", title: "Queues, Deques & Ring Buffers", minutes: 12,
      summary: "FIFO with O(1) ends via circular indexing.",
      Body: QueuesDeques,
      quiz: {
        questions: [
          { q: "A queue processes elements in…", choices: ["LIFO order", "FIFO order", "Sorted order", "Random order"], answer: 1, explain: "First in, first out — enqueue at the back, dequeue from the front." },
          { q: "Why implement a queue as a ring buffer instead of using arr.shift()?", choices: ["shift() is O(n) — it shifts every element; ring buffer dequeue is O(1)", "Ring buffers use less memory", "shift() is undefined", "Ring buffers sort automatically"], answer: 0, explain: "shift() moves all remaining elements down each time; wrapping head/tail indices avoids that." },
          { q: "A deque supports…", choices: ["Push/pop at one end only", "O(1) push and pop at both ends", "Sorted insertion", "Random access only"], answer: 1, explain: "Double-ended: both front and back are O(1), so it acts as stack and queue." },
        ],
      },
      exercises: [
        {
          id: "ring", kind: "numeric",
          prompt: "A ring buffer has capacity 5. head is at index 3. After a dequeue, head advances by (3 + 1) mod 5. What is the new head index?",
          starter: "", hint: "(3 + 1) mod 5.",
          validate: (s) => Math.abs(parseFloat(s) - 4) < 0.01 ? { pass: true, message: "Correct — (3 + 1) mod 5 = 4." } : { pass: false, message: "Compute (3 + 1) mod 5." },
        },
      ],
    },
    {
      id: "fast-slow", title: "The Fast/Slow Pointer Pattern", minutes: 12,
      summary: "Floyd's tortoise & hare — cycle detection in O(1) space.",
      Body: FastSlow,
      quiz: {
        questions: [
          { q: "In Floyd's cycle detection, the pointers move by…", choices: ["Both by 1", "slow by 1, fast by 2", "Both by 2", "slow by 2, fast by 1"], answer: 1, explain: "The speed difference of 1 per step guarantees they meet inside any cycle." },
          { q: "Why must fast and slow meet if a cycle exists?", choices: ["Random chance", "Inside the loop the gap closes by exactly 1 each step, so it reaches 0", "Fast reaches null", "They start together"], answer: 1, explain: "Once both are in the cycle, the gap shrinks by 2−1=1 per step and cannot skip past 0." },
          { q: "Floyd's advantage over a visited hash set is…", choices: ["Faster time complexity", "O(1) space instead of O(n)", "It's simpler to code", "It works on arrays only"], answer: 1, explain: "Both are O(n) time, but Floyd's uses constant extra space." },
        ],
      },
      exercises: [
        {
          id: "middle", kind: "numeric",
          prompt: "A linked list has 7 nodes (indices 0..6). Using the fast/slow middle-finding loop (fast +2, slow +1, stop when fast can't advance), what index does slow end on? (For odd length it lands on the exact middle.)",
          starter: "", hint: "Middle of 7 nodes is index 3.",
          validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01 ? { pass: true, message: "Correct — slow lands on index 3, the exact middle of 7 nodes." } : { pass: false, message: "For 7 nodes, the midpoint index is 3." },
        },
      ],
    },
    {
      id: "monotonic-stack", title: "Monotonic Stack", minutes: 12,
      summary: "Keep a stack sorted to solve next-greater problems in O(n).",
      Body: MonotonicStack,
      quiz: {
        questions: [
          { q: "A monotonic stack maintains the invariant that…", choices: ["It's always empty", "Its contents stay sorted (increasing or decreasing)", "It holds at most 2 items", "It's FIFO"], answer: 1, explain: "You pop violating elements before pushing, keeping the stack monotonic." },
          { q: "The 'next greater element' monotonic-stack algorithm runs in…", choices: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 2, explain: "Each index is pushed once and popped at most once — total work ≤ 2n." },
          { q: "Why push indices rather than values onto the stack?", choices: ["Indices are smaller", "To recover distance/position and index back into the array", "Values can't be pushed", "It changes the complexity"], answer: 1, explain: "Indices let you compute how far away the next greater element is and look up neighbors." },
        ],
      },
      exercises: [
        {
          id: "next-greater", kind: "numeric",
          prompt: "For a = [2, 1, 3, 1], nextGreater returns the value of the first later element greater than each. What is nextGreater[1] (the answer for the element with value 1 at index 1)?",
          starter: "", hint: "After the 1 at index 1, the first larger value is 3.",
          validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01 ? { pass: true, message: "Correct — the next element greater than a[1]=1 is 3." } : { pass: false, message: "Scan right from index 1: the first value greater than 1 is 3." },
        },
      ],
    },
  ],
};
