import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";
function BinaryTrees() {
    return (<div className="prose">
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
      <Code lang="ts" filename="node.ts" code={`interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

// A leaf has no children; an internal node has at least one.
function isLeaf<T>(n: TreeNode<T>): boolean {
  return n.left === null && n.right === null;
}`}/>
      <h3>Height and Node Count Bounds</h3>
      <p>
        The claim that operations are <M>{`O(\\log n)`}</M> <em>when balanced</em> rests on a precise
        counting argument. A binary tree of height <M>{`h`}</M> (edges on the longest root-to-leaf path)
        has at most one node at depth 0, two at depth 1, and in general at most <M>{`2^d`}</M> nodes at
        depth <M>{`d`}</M>. Summing the geometric series over all levels bounds the total:
      </p>
      <MBlock>{`n \\le \\sum_{d=0}^{h} 2^d = 2^{h+1} - 1`}</MBlock>
      <p>
        Rearranging gives a lower bound on the height forced by <M>{`n`}</M> nodes. Since
        <M>{` n \\le 2^{h+1} - 1`}</M> implies <M>{`2^{h+1} \\ge n + 1`}</M>, taking logs yields:
      </p>
      <MBlock>{`h \\ge \\log_2(n + 1) - 1 \\quad\\Longrightarrow\\quad h \\ge \\lfloor \\log_2 n \\rfloor`}</MBlock>
      <p>
        So <strong>no</strong> binary tree with <M>{`n`}</M> nodes can be shorter than
        <M>{` \\lfloor \\log_2 n \\rfloor`}</M> — that is the floor on cost. A <strong>complete</strong>{" "}
        binary tree (every level full except possibly the last, filled left to right) achieves it exactly:
        its height is <M>{`\\lfloor \\log_2 n \\rfloor`}</M>. At the other extreme, a degenerate stick has one
        node per level, so <M>{`h = n - 1 = \\Theta(n)`}</M>. Balancing is the discipline of staying near the
        lower bound rather than drifting toward the upper one.
      </p>
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
      <CodeTabs tabs={[
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
        ]}/>
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
    </div>);
}
function BST() {
    return (<div className="prose">
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
      <Code lang="ts" filename="bst.ts" code={`function search(root: TreeNode<number> | null, key: number): TreeNode<number> | null {
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
}`}/>
      <p>
        Both operations walk a single root-to-leaf path, so they cost <M>{`O(h)`}</M>. When the tree is
        balanced, <M>{`h = O(\\log n)`}</M> and lookups are fast. But here is the trap: insertion order
        determines shape. Insert <code>1, 2, 3, 4, 5</code> in order and every node becomes a right child —
        you have built a linked list with extra pointers, and search degrades to <M>{`O(n)`}</M>.
      </p>
      <h3>Expected Height under Random Insertion</h3>
      <p>
        The worst case is a <M>{`\\Theta(n)`}</M> stick, but that requires an adversarial (sorted) input. If
        the <M>{`n`}</M> keys arrive in <em>random</em> order — each of the <M>{`n!`}</M> permutations equally
        likely — the expected height is far kinder. Let <M>{`D_n`}</M> be the expected depth of a node,
        equivalently the average number of comparisons to find a key. The key inserted first becomes the root
        and splits the remaining keys; conditioning on the rank <M>{`i`}</M> of the root gives the recurrence
        that also governs the average-case analysis of quicksort:
      </p>
      <MBlock>{`D_n = (n - 1) + \\frac{1}{n} \\sum_{i=1}^{n} \\big( D_{i-1} + D_{n-i} \\big)`}</MBlock>
      <p>
        This recurrence solves to <M>{`D_n = 2\\ln n + O(1) \\approx 1.386 \\log_2 n`}</M>, so the expected
        cost of a search on a randomly built BST is <M>{`\\Theta(\\log n)`}</M>. A deeper result (Devroye,
        1986) shows the expected <em>height</em> — the worst path, not the average one — concentrates around
        <M>{` 4.311 \\ln n \\approx 2.99 \\log_2 n`}</M>, still logarithmic.
      </p>
      <MBlock>{`\\mathbb{E}[\\text{search cost}] = \\Theta(\\log n) \\quad\\text{vs.}\\quad \\text{worst case } \\Theta(n)`}</MBlock>
      <p>
        The lesson is sharp: a plain BST is <em>usually</em> fine but offers no guarantee. Balanced trees
        replace "usually" with "always," which is why they back general-purpose ordered maps where the input
        distribution is unknown or hostile.
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
    </div>);
}
function Balanced() {
    return (<div className="prose">
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

      <h3>AVL Tree Balance Factors and Rotations</h3>
      <p>
        For any node <M>{`N`}</M> in an AVL tree, the <strong>Balance Factor (BF)</strong> is the height difference between its left and right subtrees:
      </p>
      <MBlock>{`BF(N) = \\text{height}(N.\\text{left}) - \\text{height}(N.\\text{right})`}</MBlock>
      <p>
        The AVL invariant requires <M>{`|BF(N)| \\le 1`}</M> for every node. 
        If a node's balance factor becomes $+2$ or $-2$ due to insertion/deletion, we trigger one of four rotations depending on the shape of the imbalance:
      </p>
      <ul>
        <li>
          <strong>Left-Left (LL) Case</strong>: <M>{`BF(N) = +2`}</M> and <M>{`BF(N.\\text{left}) \\ge 0`}</M>. 
          The tree is left-heavy. We resolve this imbalance using a single <strong>right rotation</strong> at <M>{`N`}</M>.
        </li>
        <li>
          <strong>Right-Right (RR) Case</strong>: <M>{`BF(N) = -2`}</M> and <M>{`BF(N.\\text{right}) \\le 0`}</M>. 
          The tree is right-heavy. We resolve this imbalance using a single <strong>left rotation</strong> at <M>{`N`}</M>.
        </li>
        <li>
          <strong>Left-Right (LR) Case</strong>: <M>{`BF(N) = +2`}</M> and <M>{`BF(N.\\text{left}) < 0`}</M>. 
          The imbalance is zig-zag. We perform a single <strong>left rotation</strong> on <M>{`N.\\text{left}`}</M>, followed by a single <strong>right rotation</strong> on <M>{`N`}</M>.
        </li>
        <li>
          <strong>Right-Left (RL) Case</strong>: <M>{`BF(N) = -2`}</M> and <M>{`BF(N.\\text{right}) > 0`}</M>. 
          The imbalance is zag-zig. We perform a single <strong>right rotation</strong> on <M>{`N.\\text{right}`}</M>, followed by a single <strong>left rotation</strong> on <M>{`N`}</M>.
        </li>
      </ul>

      <h3>Why AVL Height is Bounded by ~1.44 log n</h3>
      <p>
        The AVL invariant looks weak — subtree heights may differ by 1 — yet it pins the height to
        <M>{` O(\\log n)`}</M>. The proof runs backward: instead of asking "how tall can an AVL tree get,"
        ask "what is the <em>minimum</em> number of nodes <M>{`N(h)`}</M> in an AVL tree of height
        <M>{` h`}</M>?" A shortest such tree has a root whose two subtrees are themselves minimal AVL trees,
        and to be maximally imbalanced they have heights <M>{`h-1`}</M> and <M>{`h-2`}</M>:
      </p>
      <MBlock>{`N(h) = N(h-1) + N(h-2) + 1, \\qquad N(0) = 1,\\; N(1) = 2`}</MBlock>
      <p>
        This is the Fibonacci recurrence in disguise: <M>{`N(h) = F_{h+3} - 1`}</M>, where <M>{`F_k`}</M> is
        the <M>{`k`}</M>-th Fibonacci number. Since Fibonacci numbers grow like the golden ratio
        <M>{` \\varphi = \\frac{1+\\sqrt5}{2} \\approx 1.618`}</M>, we have <M>{`N(h) \\ge \\varphi^{\\,h}`}</M>
        (up to lower-order terms). Inverting <M>{`n \\ge \\varphi^{\\,h}`}</M> bounds the height:
      </p>
      <MBlock>{`h \\le \\log_\\varphi n = \\frac{\\log_2 n}{\\log_2 \\varphi} \\approx 1.4405 \\, \\log_2 n`}</MBlock>
      <p>
        So an AVL tree is never more than about 44% taller than a perfectly balanced one — a tight,
        provable ceiling that guarantees <M>{`O(\\log n)`}</M> search, insert, and delete.
      </p>

      <h3>The Red-Black Black-Height Invariant</h3>
      <p>
        Red-black trees reach the same <M>{`O(\\log n)`}</M> guarantee through coloring rather than explicit
        heights. Every node is red or black, subject to four rules: the root is black; red nodes have black
        children (no two reds in a row); and <strong>every</strong> root-to-leaf path passes through the same
        number of black nodes. That count is the <strong>black-height</strong> <M>{`bh(x)`}</M>.
      </p>
      <p>
        The invariant forces balance through two observations. First, a subtree rooted at <M>{`x`}</M>
        contains at least <M>{`2^{bh(x)} - 1`}</M> internal nodes (provable by induction on height). Second,
        the no-two-reds rule means at most half the nodes on any path are red, so
        <M>{` bh(\\text{root}) \\ge h/2`}</M>. Combining:
      </p>
      <MBlock>{`n \\ge 2^{bh} - 1 \\ge 2^{h/2} - 1 \\quad\\Longrightarrow\\quad h \\le 2 \\log_2(n + 1)`}</MBlock>
      <p>
        That is the looser bound quoted above — up to twice the ideal height, versus AVL's 1.44x. The payoff
        is that the weaker constraint is satisfiable with fewer rotations per update (at most 2 on insert, 3
        on delete), which is why red-black trees win for write-heavy general-purpose maps.
      </p>

      <Code lang="ts" filename="rotate.ts" code={`// A single left rotation: pivot 'x' descends, its right child 'y' rises.
// In-order order (and thus the BST invariant) is preserved.
function rotateLeft(x: TreeNode<number>): TreeNode<number> {
  const y = x.right!;     // y becomes the new subtree root
  x.right = y.left;       // y's left subtree hangs off x
  y.left = x;             // x becomes y's left child
  return y;
}`}/>
      <div className="notice">
        <span className="lbl">When to reach for a balanced tree</span>
        Choose a balanced BST over a hash table when you need <strong>ordered</strong> operations: "give me
        the smallest key &gt; 50", range scans, or in-order iteration. If you only need point lookups, a
        hash table's <M>{`O(1)`}</M> average beats <M>{`O(\\log n)`}</M>.
      </div>
    </div>);
}
function Heaps() {
    return (<div className="prose">
      <p>
        A <strong>binary heap</strong> is a complete binary tree with a weaker order than a BST: the
        <strong> heap property</strong> says each parent is <M>{`\\le`}</M> both children (a{" "}
        <strong>min-heap</strong>) or <M>{`\\ge`}</M> both children (a <strong>max-heap</strong>). Siblings
        are unordered. That is exactly enough structure to find the extreme element in <M>{`O(1)`}</M> — it
        is always the root — which is what a <strong>priority queue</strong> needs.
      </p>
      <p>
        Because the tree is complete, we do not store pointers at all. We flatten it into an array.
      </p>

      <h3>Array-Based Heap Index Arithmetic</h3>
      <p>
        For a complete binary tree flattened into an array, parent-child relationships are calculated using simple arithmetic:
      </p>
      <ul>
        <li>
          <strong>0-Indexed Array</strong>: 
          For any node at index <M>{`i`}</M>:
          <MBlock>{`\\text{left}(i) = 2i + 1`}</MBlock>
          <MBlock>{`\\text{right}(i) = 2i + 2`}</MBlock>
          <MBlock>{`\\text{parent}(i) = \\left\\lfloor \\frac{i - 1}{2} \\right\\rfloor`}</MBlock>
        </li>
        <li>
          <strong>1-Indexed Array</strong>: 
          For any node at index <M>{`i`}</M>:
          <MBlock>{`\\text{left}(i) = 2i`}</MBlock>
          <MBlock>{`\\text{right}(i) = 2i + 1`}</MBlock>
          <MBlock>{`\\text{parent}(i) = \\left\\lfloor \\frac{i}{2} \\right\\rfloor`}</MBlock>
          This is mathematically elegant because multiplication and division by 2 are simple bit shifts (<M>{`i \\ll 1`}</M> and <M>{`i \\gg 1`}</M>).
        </li>
      </ul>

      <p>
        Two repair operations maintain the property. <strong>Sift-up</strong> (used after inserting at the
        end) swaps a too-small node upward with its parent until it fits. <strong>Sift-down</strong> (used
        after removing the root and moving the last element to the top) swaps a too-large node downward with
        its smaller child. Each walks one root-to-leaf path, so both are <M>{`O(\\log n)`}</M>.
      </p>
      <Code lang="ts" filename="minheap.ts" code={`class MinHeap {
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
}`}/>
      <p>
        Building a heap from an unsorted array can be done naively with <M>{`n`}</M> pushes at
        <M>{` O(n \\log n)`}</M>, but <strong>heapify</strong> — sifting down every internal node from the
        bottom up — is famously <M>{`O(n)`}</M>.
      </p>

      <h3>Bottom-Up Heapify is O(n): The Proof</h3>
      <p>
        The naive bound overcounts. Not every sift-down travels the full <M>{`\\log n`}</M> — the cost of
        sifting a node down is proportional to its <em>height</em> <M>{`h`}</M> (distance to its deepest
        leaf), and most nodes sit near the bottom where <M>{`h`}</M> is tiny. In a heap of <M>{`n`}</M> nodes
        there are at most <M>{`\\lceil n / 2^{h+1} \\rceil`}</M> nodes at height <M>{`h`}</M>. Summing the
        work over all heights:
      </p>
      <MBlock>{`T(n) = \\sum_{h=0}^{\\lfloor \\log_2 n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil \\cdot O(h) = O\\!\\left( n \\sum_{h=0}^{\\infty} \\frac{h}{2^{h}} \\right)`}</MBlock>
      <p>
        The sum is a convergent arithmetic-geometric series. Using the identity
        <M>{` \\sum_{h=0}^{\\infty} h x^{h} = \\frac{x}{(1-x)^2}`}</M> evaluated at <M>{`x = \\tfrac12`}</M>:
      </p>
      <MBlock>{`\\sum_{h=0}^{\\infty} \\frac{h}{2^{h}} = \\frac{1/2}{(1 - 1/2)^2} = 2`}</MBlock>
      <p>
        Because the infinite series converges to a <em>constant</em> (2), the total is
        <M>{` T(n) = O(2n) = O(n)`}</M> — linear, not linearithmic. The contrast with <M>{`n`}</M> repeated
        pushes is exactly this: pushing sifts <em>up</em> from a leaf, so early elements (near the root) pay
        the full height, whereas bottom-up heapify sifts <em>down</em>, letting the many cheap leaf-level
        nodes dominate the count in our favor.
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
    </div>);
}
function Tries() {
    return (<div className="prose">
      <p>
        A <strong>trie</strong> (prefix tree) stores a set of strings by their <em>characters</em>, not by
        comparing whole keys. Each edge is labeled with one character; a path from the root spells a prefix,
        and a flag marks nodes that complete a stored word. Keys with a shared prefix share a path, which is
        why tries shine for autocomplete and dictionaries.
      </p>
      <Code lang="ts" filename="trie.ts" code={`class Trie {
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
}`}/>
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
    </div>);
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
                    prompt: "A tree has root 4 with left child 2 (children 1 and 3) and right child 6 (children 5 and 7). Write the pre-order and in-order sequences, and explain why in-order is special for this tree.",
                    starter: "",
                    rubric: "Full credit: pre-order = 4,2,1,3,6,5,7; in-order = 1,2,3,4,5,6,7; notes that in-order yields sorted output because the tree is a BST. Partial: correct one sequence but not the other, or misses the sorted-order insight.",
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
                    prompt: "A perfectly balanced BST holds n = 1,048,575 keys (a full tree of some height h, where n = 2^(h+1) - 1). What is its height h? Enter an integer.",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 19) < 0.01
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
                    prompt: "In a 0-indexed array-backed binary heap, what is the index of the LEFT child of the node at index 6?",
                    starter: "",
                    validate: (s) => Math.abs(parseFloat(s) - 13) < 0.01
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
