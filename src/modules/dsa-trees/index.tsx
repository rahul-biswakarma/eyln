import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";

function BinaryTrees() {
  return (
    <div className="prose">
      <p>
        A <strong>tree</strong> is a set of nodes connected so that there is exactly one path between any
        two of them — no cycles, one <strong>root</strong>, and every other node reached through a single
        <strong> parent</strong>. A <strong>binary tree</strong> restricts each node to at most two
        children, conventionally called <code>left</code> and <code>right</code>. The power of the shape
        is that it turns a linear list into something you can navigate by making a <em>choice</em> at each
        step, which is what opens the door to logarithmic-time operations later.
      </p>
      <p>
        Two numbers describe a node's position. Its <strong>depth</strong> is the number of edges from the
        root; its <strong>height</strong> is the number of edges on the longest path down to a leaf. The
        height of the tree is the height of the root. A binary tree with <M>{`n`}</M> nodes has height
        between <M>{`\\lfloor \\log_2 n \\rfloor`}</M> (perfectly balanced) and <M>{`n - 1`}</M> (a
        degenerate "stick"). That range is the entire story of why balance matters: most tree operations
        cost <M>{`O(h)`}</M>, so a tall tree is a slow tree.
      </p>
      <Code
        lang="ts"
        filename="node.ts"
        code={`interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

// A leaf has no children; an internal node has at least one.
function isLeaf<T>(n: TreeNode<T>): boolean {
  return n.left === null && n.right === null;
}`}
      />
      <p>
        We <strong>traverse</strong> a tree to visit every node exactly once. There are two families.
        <strong> Depth-first (DFS)</strong> plunges down one branch before backtracking, and comes in three
        flavors distinguished by <em>when</em> you visit the current node relative to its subtrees:
      </p>
      <ul>
        <li>
          <strong>Pre-order</strong> — node, then left, then right. Useful for <em>copying</em> a tree or
          serializing its structure top-down.
        </li>
        <li>
          <strong>In-order</strong> — left, then node, then right. On a binary search tree this visits
          values in <strong>sorted order</strong> — a fact worth memorizing.
        </li>
        <li>
          <strong>Post-order</strong> — left, then right, then node. You visit children before parents, so
          it is the order for <em>freeing</em> a tree or computing a value that depends on subtree results.
        </li>
      </ul>
      <p>
        <strong>Breadth-first (BFS)</strong>, or level-order, visits all nodes at depth 0, then depth 1,
        and so on, using a queue instead of the call stack.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "DFS (recursive)",
            lang: "ts",
            code: `function inorder<T>(n: TreeNode<T> | null, out: T[]): void {
  if (n === null) return;   // base case: empty subtree
  inorder(n.left, out);     // 1. left
  out.push(n.value);        // 2. node
  inorder(n.right, out);    // 3. right
}
// Swap the three lines' order to get pre-/post-order.`,
          },
          {
            label: "BFS (queue)",
            lang: "ts",
            code: `function bfs<T>(root: TreeNode<T> | null): T[] {
  const out: T[] = [];
  const queue: TreeNode<T>[] = root ? [root] : [];
  while (queue.length > 0) {
    const n = queue.shift()!;    // dequeue front
    out.push(n.value);
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return out;
}`,
          },
        ]}
      />
      <p>
        Every traversal is <M>{`O(n)`}</M> time — each node and edge is touched once. Space is the
        subtlety: recursive DFS uses stack depth <M>{`O(h)`}</M>, while BFS's queue can hold an entire
        level, up to <M>{`O(n)`}</M> nodes in a wide, balanced tree.
      </p>
      <div className="notice warn">
        <span className="lbl">Gotcha: recursion depth</span>
        Recursive DFS on a degenerate tree of height <M>{`n`}</M> can overflow the call stack. For
        adversarial or very deep inputs, convert to an explicit stack — the same algorithm, with a
        <code> stack.pop()</code> loop replacing the recursive calls.
      </div>
    </div>
  );
}

function BST() {
  return (
    <div className="prose">
      <p>
        A <strong>binary search tree (BST)</strong> is a binary tree that maintains a single ordering
        invariant: for every node, <em>all</em> values in its left subtree are smaller and <em>all</em>{" "}
        values in its right subtree are larger. That invariant is what lets you binary-search a tree the
        way you binary-search a sorted array — at each node you discard an entire subtree.
      </p>
      <MBlock>{`\\text{left subtree} < \\text{node} < \\text{right subtree} \\quad \\text{(for every node)}`}</MBlock>
      <p>
        Searching starts at the root and compares. If the target is smaller, go left; if larger, go right;
        if equal, you found it. Insertion follows the identical path and attaches the new value where the
        search "falls off" the tree at a null child, which automatically preserves the invariant.
      </p>
      <Code
        lang="ts"
        filename="bst.ts"
        code={`function search(root: TreeNode<number> | null, key: number): TreeNode<number> | null {
  let cur = root;
  while (cur !== null) {
    if (key === cur.value) return cur;
    cur = key < cur.value ? cur.left : cur.right;  // discard the other half
  }
  return null;
}

function insert(root: TreeNode<number> | null, key: number): TreeNode<number> {
  if (root === null) return { value: key, left: null, right: null };
  if (key < root.value) root.left = insert(root.left, key);
  else if (key > root.value) root.right = insert(root.right, key);
  return root;   // duplicates ignored here
}`}
      />
      <p>
        Both operations walk a single root-to-leaf path, so they cost <M>{`O(h)`}</M>. When the tree is
        balanced, <M>{`h = O(\\log n)`}</M> and lookups are fast. But here is the trap: insertion order
        determines shape. Insert <code>1, 2, 3, 4, 5</code> in order and every node becomes a right child —
        you have built a linked list with extra pointers, and search degrades to <M>{`O(n)`}</M>.
      </p>
      <div className="notice">
        <span className="lbl">In-order = sorted</span>
        Because of the invariant, an in-order traversal of a BST emits its keys in ascending order. This is
        the quickest way to sanity-check that a tree really is a valid BST.
      </div>
      <div className="notice warn">
        <span className="lbl">Gotcha: sorted input is the worst case</span>
        Inserting already-sorted (or reverse-sorted) data into a plain BST produces the degenerate stick.
        Real systems either shuffle, use a balanced variant, or use a tree that self-balances — the topic
        of the next lesson.
      </div>
    </div>
  );
}

function Balanced() {
  return (
    <div className="prose">
      <p>
        A plain BST is only as fast as it is short. <strong>Self-balancing</strong> trees add rules and a
        repair step (<strong>rotations</strong>) that keep the height at <M>{`O(\\log n)`}</M> no matter
        the insertion order. A rotation is a local, <M>{`O(1)`}</M> pointer rewiring that changes a node's
        depth while <em>preserving</em> the BST invariant — the in-order sequence is unchanged.
      </p>
      <p>Two designs dominate real code:</p>
      <ul>
        <li>
          <strong>AVL trees</strong> store a balance factor per node and require the heights of a node's
          two subtrees to differ by at most 1. They are rigidly balanced, so lookups are very fast, but
          they may rotate more often on insert/delete.
        </li>
        <li>
          <strong>Red-black trees</strong> color each node red or black and enforce that every root-to-leaf
          path has the same number of black nodes. This is a looser guarantee, allowing height up to
          <M>{`2\\log_2(n+1)`}</M>, but it means fewer rotations — which is why library maps
          (C++ <code>std::map</code>, Java <code>TreeMap</code>) use them.
        </li>
      </ul>
      <MBlock>{`\\text{search, insert, delete} = O(\\log n) \\quad \\text{guaranteed, worst case}`}</MBlock>
      <p>
        You rarely implement these from scratch, so the goal here is the <em>mental model</em>: a balanced
        BST gives you a sorted, dynamic collection with logarithmic everything — insert, delete, lookup,
        predecessor/successor, and range queries — which a hash table cannot do because it throws ordering
        away.
      </p>
      <Code
        lang="ts"
        filename="rotate.ts"
        code={`// A single left rotation: pivot 'x' descends, its right child 'y' rises.
// In-order order (and thus the BST invariant) is preserved.
function rotateLeft(x: TreeNode<number>): TreeNode<number> {
  const y = x.right!;     // y becomes the new subtree root
  x.right = y.left;       // y's left subtree hangs off x
  y.left = x;             // x becomes y's left child
  return y;
}`}
      />
      <div className="notice">
        <span className="lbl">When to reach for a balanced tree</span>
        Choose a balanced BST over a hash table when you need <strong>ordered</strong> operations: "give me
        the smallest key &gt; 50", range scans, or in-order iteration. If you only need point lookups, a
        hash table's <M>{`O(1)`}</M> average beats <M>{`O(\\log n)`}</M>.
      </div>
    </div>
  );
}

function Heaps() {
  return (
    <div className="prose">
      <p>
        A <strong>binary heap</strong> is a complete binary tree with a weaker order than a BST: the
        <strong> heap property</strong> says each parent is <M>{`\\le`}</M> both children (a{" "}
        <strong>min-heap</strong>) or <M>{`\\ge`}</M> both children (a <strong>max-heap</strong>). Siblings
        are unordered. That is exactly enough structure to find the extreme element in <M>{`O(1)`}</M> — it
        is always the root — which is what a <strong>priority queue</strong> needs.
      </p>
      <p>
        Because the tree is complete, we do not store pointers at all. We flatten it into an array: the
        children of index <M>{`i`}</M> live at <M>{`2i+1`}</M> and <M>{`2i+2`}</M>, and its parent at
        <M>{` \\lfloor (i-1)/2 \\rfloor`}</M>. No per-node allocation, perfect cache locality.
      </p>
      <MBlock>{`\\text{left}(i) = 2i+1, \\quad \\text{right}(i) = 2i+2, \\quad \\text{parent}(i) = \\left\\lfloor \\tfrac{i-1}{2} \\right\\rfloor`}</MBlock>
      <p>
        Two repair operations maintain the property. <strong>Sift-up</strong> (used after inserting at the
        end) swaps a too-small node upward with its parent until it fits. <strong>Sift-down</strong> (used
        after removing the root and moving the last element to the top) swaps a too-large node downward with
        its smaller child. Each walks one root-to-leaf path, so both are <M>{`O(\\log n)`}</M>.
      </p>
      <Code
        lang="ts"
        filename="minheap.ts"
        code={`class MinHeap {
  private a: number[] = [];

  push(x: number): void {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {                          // sift up
      const p = (i - 1) >> 1;
      if (this.a[p] <= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  pop(): number | undefined {                // remove the minimum
    const n = this.a.length;
    if (n === 0) return undefined;
    const top = this.a[0];
    this.a[0] = this.a[n - 1];
    this.a.pop();
    let i = 0;                               // sift down
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < this.a.length && this.a[l] < this.a[m]) m = l;
      if (r < this.a.length && this.a[r] < this.a[m]) m = r;
      if (m === i) break;
      [this.a[m], this.a[i]] = [this.a[i], this.a[m]];
      i = m;
    }
    return top;
  }
}`}
      />
      <p>
        Building a heap from an unsorted array can be done naively with <M>{`n`}</M> pushes at
        <M>{` O(n \\log n)`}</M>, but <strong>heapify</strong> — sifting down every internal node from the
        bottom up — is famously <M>{`O(n)`}</M>. The intuition: most nodes are near the leaves and sift down
        only a short distance, and the sum <M>{`\\sum_{h} \\frac{n}{2^{h+1}} \\cdot h`}</M> converges to a
        constant times <M>{`n`}</M>.
      </p>
      <div className="notice">
        <span className="lbl">Heapsort falls out for free</span>
        Repeatedly popping the max from a max-heap yields a sorted array. Build in <M>{`O(n)`}</M>, then do
        <M>{` n`}</M> pops at <M>{`O(\\log n)`}</M> each: <M>{`O(n \\log n)`}</M> total, in place.
      </div>
      <div className="notice warn">
        <span className="lbl">Gotcha: a heap is not sorted</span>
        The array backing a heap is <em>not</em> in sorted order — only the root is guaranteed extreme. You
        cannot binary-search it. If you need order, use a BST or sort the array.
      </div>
    </div>
  );
}

function Tries() {
  return (
    <div className="prose">
      <p>
        A <strong>trie</strong> (prefix tree) stores a set of strings by their <em>characters</em>, not by
        comparing whole keys. Each edge is labeled with one character; a path from the root spells a prefix,
        and a flag marks nodes that complete a stored word. Keys with a shared prefix share a path, which is
        why tries shine for autocomplete and dictionaries.
      </p>
      <Code
        lang="ts"
        filename="trie.ts"
        code={`class Trie {
  private children = new Map<string, Trie>();
  private end = false;

  insert(word: string): void {
    let node: Trie = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new Trie());
      node = node.children.get(ch)!;
    }
    node.end = true;
  }

  has(word: string): boolean {
    let node: Trie = this;
    for (const ch of word) {
      const next = node.children.get(ch);
      if (!next) return false;
      node = next;
    }
    return node.end;   // the path exists AND completes a word
  }
}`}
      />
      <p>
        The key win is that lookup, insertion, and prefix queries all cost <M>{`O(L)`}</M> where{" "}
        <M>{`L`}</M> is the length of the key — <strong>independent of how many words are stored</strong>. A
        hash table is also <M>{`O(L)`}</M> to hash the key but cannot answer "which words start with{" "}
        <code>pre</code>?" without scanning everything; a trie answers that by walking to the prefix node and
        enumerating its subtree.
      </p>
      <div className="notice warn">
        <span className="lbl">Gotcha: memory</span>
        A naive trie with a fixed child array per node wastes space when the alphabet is large and words are
        sparse. Use a map (as above) or a compressed <em>radix tree</em> that merges single-child chains.
      </div>
    </div>
  );
}

export const dsaTrees: Module = {
  id: "dsa-trees",
  title: "Trees & Heaps",
  icon: "🌳",
  track: "dsa",
  blurb: "Hierarchical data: binary trees and their traversals, search trees, balancing, heaps, and tries.",
  dependsOn: ["dsa-linear"],
  lessons: [
    {
      id: "binary-trees",
      title: "Binary Trees & Traversals",
      minutes: 14,
      summary: "Structure, height, and the pre/in/post-order and BFS traversals.",
      Body: BinaryTrees,
      quiz: {
        questions: [
          {
            q: "Which traversal visits a node BEFORE its left and right subtrees?",
            choices: ["In-order", "Pre-order", "Post-order", "Level-order"],
            answer: 1,
            explain: "Pre-order is node, then left, then right — good for copying or top-down serialization.",
          },
          {
            q: "BFS (level-order) traversal is implemented with a…",
            choices: ["Recursion only", "Queue", "Stack", "Hash map"],
            answer: 1,
            explain: "A FIFO queue processes one level before the next; the front is dequeued and children enqueued.",
          },
          {
            q: "The time complexity of any full traversal of an n-node tree is…",
            choices: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
            answer: 1,
            explain: "Each node and edge is visited exactly once, so every traversal is linear in n.",
          },
        ],
      },
      exercises: [
        {
          id: "traversal-order",
          kind: "open",
          prompt:
            "A tree has root 4 with left child 2 (children 1 and 3) and right child 6 (children 5 and 7). Write the pre-order and in-order sequences, and explain why in-order is special for this tree.",
          starter: "",
          rubric:
            "Full credit: pre-order = 4,2,1,3,6,5,7; in-order = 1,2,3,4,5,6,7; notes that in-order yields sorted output because the tree is a BST. Partial: correct one sequence but not the other, or misses the sorted-order insight.",
          hint: "Pre-order visits the node first; in-order visits left subtree, node, then right.",
        },
      ],
    },
    {
      id: "bst",
      title: "Binary Search Trees",
      minutes: 14,
      summary: "The ordering invariant, search/insert in O(h), and why balance matters.",
      Body: BST,
      quiz: {
        questions: [
          {
            q: "The BST invariant states that, for every node…",
            choices: [
              "Left child < node < right child, recursively for whole subtrees",
              "The left child is a leaf",
              "Both children are larger than the node",
              "The tree is complete",
            ],
            answer: 0,
            explain: "All keys in the left subtree are smaller and all keys in the right subtree are larger.",
          },
          {
            q: "Inserting the sequence 1, 2, 3, 4, 5 into an empty BST produces a tree of height…",
            choices: ["log2(5) ≈ 2", "0", "4 (a degenerate stick)", "It is balanced automatically"],
            answer: 2,
            explain: "Each value is larger than the last, so every node becomes a right child — a linked list of height n-1 = 4.",
          },
        ],
      },
      exercises: [
        {
          id: "bst-height",
          kind: "numeric",
          prompt:
            "A perfectly balanced BST holds n = 1,048,575 keys (a full tree of some height h, where n = 2^(h+1) - 1). What is its height h? Enter an integer.",
          starter: "",
          validate: (s) =>
            Math.abs(parseFloat(s) - 19) < 0.01
              ? { pass: true, message: "Correct — 2^20 - 1 = 1,048,575, so h = 19. Search costs ~20 comparisons." }
              : { pass: false, message: "Not quite. Solve 2^(h+1) - 1 = 1,048,575, i.e. 2^(h+1) = 2^20." },
          hint: "1,048,575 = 2^20 - 1, and n = 2^(h+1) - 1.",
        },
      ],
    },
    {
      id: "balanced",
      title: "Balanced Trees: AVL & Red-Black",
      minutes: 12,
      summary: "Rotations, the O(log n) guarantee, and when to prefer a tree over a hash table.",
      Body: Balanced,
      quiz: {
        questions: [
          {
            q: "A tree rotation is used to…",
            choices: [
              "Sort the array backing the tree",
              "Rebalance while preserving the BST in-order sequence",
              "Convert a tree to a heap",
              "Delete every node",
            ],
            answer: 1,
            explain: "A rotation is an O(1) local rewiring that changes heights but keeps the in-order order (and thus the invariant) intact.",
          },
          {
            q: "Why do library maps often use red-black trees instead of AVL trees?",
            choices: [
              "They use less memory per node",
              "They guarantee height 1",
              "Looser balancing means fewer rotations on insert/delete",
              "They do not need comparisons",
            ],
            answer: 2,
            explain: "Red-black trees allow slightly taller trees in exchange for cheaper updates, a good tradeoff for general-purpose maps.",
          },
        ],
      },
    },
    {
      id: "heaps",
      title: "Heaps & Priority Queues",
      minutes: 15,
      summary: "Array-backed binary heaps, sift up/down, O(n) heapify, and heapsort.",
      Body: Heaps,
      quiz: {
        questions: [
          {
            q: "In an array-backed heap, the parent of index i is at…",
            choices: ["2i + 1", "floor((i - 1) / 2)", "i / 2 + 1", "i - 1"],
            answer: 1,
            explain: "Children are at 2i+1 and 2i+2, so the parent is at floor((i-1)/2).",
          },
          {
            q: "Popping the minimum from a min-heap of n elements costs…",
            choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            answer: 1,
            explain: "Reading the root is O(1), but restoring the heap property with sift-down walks one path of length O(log n).",
          },
          {
            q: "Building a heap from an unsorted array with heapify (bottom-up sift-down) is…",
            choices: ["O(n)", "O(log n)", "O(n log n)", "O(n^2)"],
            answer: 0,
            explain: "Most nodes are near the leaves and sift down only slightly; the summed work converges to O(n).",
          },
        ],
      },
      exercises: [
        {
          id: "heap-index",
          kind: "numeric",
          prompt:
            "In a 0-indexed array-backed binary heap, what is the index of the LEFT child of the node at index 6?",
          starter: "",
          validate: (s) =>
            Math.abs(parseFloat(s) - 13) < 0.01
              ? { pass: true, message: "Correct — left(i) = 2i + 1 = 13 (and the right child is at 14)." }
              : { pass: false, message: "Not quite. The left child of index i is at 2i + 1." },
          hint: "left(i) = 2i + 1.",
        },
      ],
    },
    {
      id: "tries",
      title: "Tries (Prefix Trees)",
      minutes: 10,
      summary: "Storing strings by character for O(L) lookup and fast prefix queries.",
      Body: Tries,
      quiz: {
        questions: [
          {
            q: "Looking up a key of length L in a trie holding N words costs…",
            choices: ["O(N)", "O(L)", "O(N log N)", "O(L * N)"],
            answer: 1,
            explain: "You walk one character at a time down a single path — cost depends on the key length, not the number of stored words.",
          },
          {
            q: "The main advantage of a trie over a hash set is…",
            choices: [
              "Lower memory usage",
              "Efficient prefix queries (all words starting with 'pre')",
              "It never needs comparisons",
              "Constant-time deletion of the whole set",
            ],
            answer: 1,
            explain: "Shared prefixes share a path, so you can walk to a prefix and enumerate its subtree — something a hash set cannot do.",
          },
        ],
      },
    },
  ],
};
