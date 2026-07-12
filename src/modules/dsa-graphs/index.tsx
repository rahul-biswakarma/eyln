import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";

function Representations() {
  return (
    <div className="prose">
      <p>
        A <strong>graph</strong> generalizes the tree by dropping every restriction: any node (called a{" "}
        <strong>vertex</strong>) may connect to any other through an <strong>edge</strong>, edges may form
        cycles, and there need not be a root. Formally <M>{`G = (V, E)`}</M> with <M>{`|V| = n`}</M>{" "}
        vertices and <M>{`|E| = m`}</M> edges. Edges may be <strong>directed</strong> (a one-way link) or
        <strong> undirected</strong>, and <strong>weighted</strong> (carrying a cost) or not.
      </p>
      <p>The whole practical question is how you store <M>{`E`}</M>. Two representations dominate:</p>
      <ul>
        <li>
          <strong>Adjacency list</strong> — for each vertex, a list of its neighbors. Total space
          <M>{` O(n + m)`}</M>. Iterating a vertex's neighbors is proportional to its degree.
        </li>
        <li>
          <strong>Adjacency matrix</strong> — an <M>{`n \\times n`}</M> grid where entry
          <M>{` (u, v)`}</M> holds the edge (or its weight, or 0). Space <M>{`O(n^2)`}</M> regardless of how
          few edges exist, but edge existence is an <M>{`O(1)`}</M> lookup.
        </li>
      </ul>
      <MBlock>{`\\text{list: } O(n+m)\\ \\text{space},\\quad \\text{matrix: } O(n^2)\\ \\text{space}`}</MBlock>
      <CodeTabs
        tabs={[
          {
            label: "Adjacency list",
            lang: "ts",
            code: `// graph[u] = list of neighbors (or [neighbor, weight] pairs).
const graph: number[][] = [
  [1, 2],   // 0 -> 1, 0 -> 2
  [2],      // 1 -> 2
  [0, 3],   // 2 -> 0, 2 -> 3
  [],       // 3 -> (none)
];
// Iterate neighbors of u in O(degree(u)):
for (const v of graph[2]) { /* visit edge 2 -> v */ }`,
          },
          {
            label: "Adjacency matrix",
            lang: "ts",
            code: `// adj[u][v] = 1 if edge u -> v exists, else 0.
const adj: number[][] = [
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [1, 0, 0, 1],
  [0, 0, 0, 0],
];
// Edge existence in O(1):
const hasEdge = adj[2][3] === 1;`,
          },
        ]}
      />
      <p>
        The rule of thumb: use an <strong>adjacency list for sparse graphs</strong> (<M>{`m \\ll n^2`}</M>,
        the common case) and reserve the matrix for <strong>dense graphs</strong> or when you need constant-
        time edge queries and <M>{`n`}</M> is small. Most real networks — roads, social graphs, web links —
        are sparse, so the list is the default.
      </p>

      <h3>The Handshaking Lemma and the Density Threshold</h3>
      <p>
        The choice between the two representations rests on how <M>{`m`}</M> relates to <M>{`n`}</M>, and
        that relationship is bounded by a counting identity. The <strong>degree</strong> of a vertex is
        its number of incident edges. Summing degrees over all vertices counts every edge exactly twice —
        once from each endpoint — which gives the <strong>Handshaking Lemma</strong>:
      </p>
      <MBlock>{`\\sum_{v \\in V} \\deg(v) = 2m`}</MBlock>
      <p>
        <strong>Proof.</strong> Consider the incidence pairs <M>{`(v, e)`}</M> where vertex <M>{`v`}</M> is an
        endpoint of edge <M>{`e`}</M>. Counting by vertex, each <M>{`v`}</M> contributes <M>{`\\deg(v)`}</M>
        pairs, for a total of <M>{`\\sum_v \\deg(v)`}</M>. Counting by edge, each edge has exactly two
        endpoints and so contributes <M>{`2`}</M> pairs, for a total of <M>{`2m`}</M>. The two counts equal
        the same quantity. An immediate corollary: the number of odd-degree vertices is always even, since
        the total <M>{`2m`}</M> is even.
      </p>
      <p>
        This pins down the density spectrum. A simple undirected graph has at most{" "}
        <M>{`\\binom{n}{2} = \\tfrac{n(n-1)}{2} = O(n^2)`}</M> edges, so <M>{`m`}</M> ranges from{" "}
        <M>{`0`}</M> up to <M>{`\\Theta(n^2)`}</M>. The two representations formalize as:
      </p>
      <ul>
        <li>
          <strong>Space.</strong> List is <M>{`\\Theta(n + m)`}</M>; matrix is <M>{`\\Theta(n^2)`}</M>{" "}
          unconditionally. The list wins whenever <M>{`m = o(n^2)`}</M>.
        </li>
        <li>
          <strong>Edge query</strong> <M>{`(u, v) \\in E?`}</M> — matrix is <M>{`O(1)`}</M>; list is{" "}
          <M>{`O(\\deg(u))`}</M>, up to <M>{`O(n)`}</M> in the worst case.
        </li>
        <li>
          <strong>Iterate all neighbors of</strong> <M>{`u`}</M> — list is <M>{`O(\\deg(u))`}</M>, optimal;
          matrix is <M>{`O(n)`}</M> even if <M>{`u`}</M> has one neighbor.
        </li>
        <li>
          <strong>Iterate all edges</strong> — list is <M>{`O(n + m)`}</M>; matrix is <M>{`O(n^2)`}</M>.
        </li>
      </ul>
      <p>
        The crossover is <M>{`m = \\Theta(n^2)`}</M>: below it the list is asymptotically smaller and every
        traversal is cheaper, so the matrix is justified only for dense graphs or when constant-time edge
        tests dominate the workload.
      </p>

      <div className="notice warn">
        <span className="lbl">Gotcha: undirected means two entries</span>
        In an undirected graph, an edge <M>{`\\{u, v\\}`}</M> appears in <em>both</em> <code>graph[u]</code>{" "}
        and <code>graph[v]</code> (and symmetrically in the matrix). Forgetting one direction is the classic
        graph bug.
      </div>
    </div>
  );
}

function BFS() {
  return (
    <div className="prose">
      <p>
        <strong>Breadth-first search</strong> explores a graph in rings of increasing distance from a source:
        first the source, then everything one edge away, then two edges away, and so on. Because it never
        moves to distance <M>{`k+1`}</M> before finishing distance <M>{`k`}</M>, the first time BFS reaches a
        vertex is along a <strong>shortest path</strong> — in an <em>unweighted</em> graph, where every edge
        counts as one step.
      </p>
      <p>
        The engine is a <strong>queue</strong> plus a <strong>visited</strong> set. You enqueue the source,
        then repeatedly dequeue a vertex and enqueue any unvisited neighbor, marking it visited{" "}
        <em>as you enqueue</em> so it never enters the queue twice.
      </p>

      <h3>Theorem: BFS Shortest Path Correctness</h3>
      <p>
        <strong>Theorem</strong>: Let <M>{`d(s, v)`}</M> be the shortest path distance (minimum number of edges) from source <M>{`s`}</M> to vertex <M>{`v`}</M>. 
        BFS visits vertices in non-decreasing order of distance from <M>{`s`}</M>, and when a vertex <M>{`v`}</M> is first discovered (enqueued), the computed distance satisfies <M>{`\\text{dist}[v] = d(s, v)`}</M>.
      </p>
      <p>
        <strong>Proof Sketch</strong>: 
        We proceed by induction on the distance <M>{`k = d(s, v)`}</M>:
      </p>
      <ul>
        <li>
          <strong>Base Case</strong>: For <M>{`k = 0`}</M>, the source <M>{`s`}</M> is initialized with <M>{`\\text{dist}[s] = 0`}</M>, which is correct.
        </li>
        <li>
          <strong>Inductive Step</strong>: Assume all vertices at distance <M>{`\\le k`}</M> are correctly discovered with distance <M>{`\\text{dist}[u] = d(s, u)`}</M>. 
          Let <M>{`v`}</M> be a vertex at distance <M>{`d(s, v) = k + 1`}</M>. By definition, there must be some neighbor <M>{`u`}</M> of <M>{`v`}</M> such that <M>{`d(s, u) = k`}</M> and an edge <M>{`(u, v) \\in E`}</M>. 
          Since <M>{`d(s, u) = k`}</M>, node <M>{`u`}</M> is dequeued during the <M>{`k`}</M>-th phase. When <M>{`u`}</M> is processed, it examines the neighbor <M>{`v`}</M>. 
          Since <M>{`d(s, v) = k + 1`}</M> is larger than <M>{`k`}</M>, <M>{`v`}</M> could not have been visited before this phase. 
          Thus, <M>{`v`}</M> is first discovered via the edge from <M>{`u`}</M>, and we set <M>{`\\text{dist}[v] = \\text{dist}[u] + 1 = k + 1`}</M>. 
          Since any other path to <M>{`v`}</M> has length at least <M>{`k + 1`}</M>, this first discovery gives the exact shortest path.
        </li>
      </ul>

      <Code
        lang="ts"
        filename="bfs.ts"
        code={`function shortestPath(graph: number[][], src: number, dst: number): number {
  const dist = new Array(graph.length).fill(-1);
  const queue: number[] = [src];
  dist[src] = 0;
  while (queue.length > 0) {
    const u = queue.shift()!;          // dequeue
    if (u === dst) return dist[u];
    for (const v of graph[u]) {
      if (dist[v] === -1) {            // first time we see v
        dist[v] = dist[u] + 1;         // one edge farther than u
        queue.push(v);
      }
    }
  }
  return -1;                            // dst unreachable
}`}
      />
      <p>
        Each vertex is enqueued at most once and each edge is examined at most once (twice for undirected),
        giving <M>{`O(n + m)`}</M> time and <M>{`O(n)`}</M> space for the queue and distance array.
      </p>
      <div className="notice">
        <span className="lbl">Why not DFS for shortest paths?</span>
        DFS may reach the target down a long, winding branch before a shorter route is discovered. Only BFS's
        level-by-level order guarantees the <em>fewest edges</em>. For weighted graphs, even BFS is not enough
        — that is Dijkstra's job.
      </div>
      <div className="notice warn">
        <span className="lbl">Gotcha: mark on enqueue, not on dequeue</span>
        If you mark a vertex visited only when you dequeue it, it can be enqueued multiple times before it is
        processed, blowing up the queue and the runtime. Mark it the moment you push it.
      </div>
    </div>
  );
}

function DFSTopo() {
  return (
    <div className="prose">
      <p>
        <strong>Depth-first search</strong> commits to a branch and follows it as deep as possible before
        backtracking, naturally expressed with recursion (the call stack <em>is</em> the stack) or an explicit
        stack. Like BFS it is <M>{`O(n + m)`}</M>, but its exploration order unlocks a different set of
        problems.
      </p>
      <Code
        lang="ts"
        filename="dfs.ts"
        code={`function dfs(graph: number[][], u: number, visited: boolean[]): void {
  visited[u] = true;
  for (const v of graph[u]) {
    if (!visited[v]) dfs(graph, v, visited);   // recurse deeper
  }
}`}
      />
      <p>
        <strong>Cycle detection.</strong> In a directed graph, a cycle exists exactly when DFS encounters a
        vertex that is currently <em>on the recursion stack</em> — a so-called back edge. Tracking a third
        "in-progress" state (white / gray / black) distinguishes a back edge from a harmless re-visit of a
        finished vertex.
      </p>

      <h3>Edge Classification and the Back-Edge Cycle Criterion</h3>
      <p>
        Give every vertex a <strong>discovery time</strong> <M>{`d[v]`}</M> and a{" "}
        <strong>finish time</strong> <M>{`f[v]`}</M> — a counter incremented when DFS first enters and when it
        exits <M>{`v`}</M>. These nested intervals <M>{`[d[v], f[v]]`}</M> obey the{" "}
        <strong>parenthesis theorem</strong>: for any two vertices the intervals are either disjoint or one
        strictly nests inside the other; they never partially overlap. A DFS on a directed graph sorts every
        edge <M>{`(u, v)`}</M> into exactly four classes:
      </p>
      <ul>
        <li>
          <strong>Tree edge</strong> — <M>{`v`}</M> is white (undiscovered) when explored from <M>{`u`}</M>;
          these edges form the DFS forest.
        </li>
        <li>
          <strong>Back edge</strong> — <M>{`v`}</M> is gray (on the stack, an ancestor of <M>{`u`}</M>).
          Equivalently <M>{`d[v] \\le d[u] < f[u] \\le f[v]`}</M>.
        </li>
        <li>
          <strong>Forward edge</strong> — <M>{`v`}</M> is black and a descendant of <M>{`u`}</M> reached by a
          non-tree edge: <M>{`d[u] < d[v]`}</M>.
        </li>
        <li>
          <strong>Cross edge</strong> — <M>{`v`}</M> is black and unrelated (already finished):{" "}
          <M>{`f[v] < d[u]`}</M>.
        </li>
      </ul>
      <p>
        <strong>Theorem.</strong> A directed graph has a cycle if and only if a DFS from any starting
        configuration produces a back edge.
      </p>
      <p>
        <strong>Proof.</strong> (<M>{`\\Leftarrow`}</M>) A back edge <M>{`(u, v)`}</M> means <M>{`v`}</M> is a
        gray ancestor of <M>{`u`}</M>, so the tree path <M>{`v \\rightsquigarrow u`}</M> plus the edge{" "}
        <M>{`(u, v)`}</M> closes a cycle. (<M>{`\\Rightarrow`}</M>) Suppose a cycle <M>{`C`}</M> exists, and
        let <M>{`v`}</M> be the first vertex of <M>{`C`}</M> discovered by DFS. Let <M>{`(u, v)`}</M> be the
        edge of <M>{`C`}</M> entering <M>{`v`}</M>. Every vertex of <M>{`C`}</M> is reachable from{" "}
        <M>{`v`}</M> along cycle edges, so by the <strong>white-path theorem</strong> all of them —{" "}
        including <M>{`u`}</M> — become descendants of <M>{`v`}</M> in the DFS tree and are discovered while{" "}
        <M>{`v`}</M> is still gray. Thus when <M>{`(u, v)`}</M> is explored, <M>{`v`}</M> is still on the
        stack, making <M>{`(u, v)`}</M> a back edge.
      </p>
      <p>
        Note that <strong>undirected</strong> graphs have only tree and back edges — the forward/cross
        distinction vanishes because exploration is symmetric — so the same gray-ancestor test detects
        undirected cycles too (ignoring the immediate parent edge).
      </p>
      <p>
        <strong>Topological sort.</strong> A <strong>directed acyclic graph (DAG)</strong> — dependencies,
        build order, course prerequisites — has a linear ordering where every edge points forward. DFS
        produces it for free: push each vertex onto a list <em>when its recursion finishes</em>, then reverse
        the list. Equivalently, Kahn's algorithm repeatedly removes vertices of in-degree 0.
      </p>
      <Code
        lang="ts"
        filename="toposort.ts"
        code={`function topoSort(graph: number[][]): number[] {
  const n = graph.length;
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  function visit(u: number) {
    visited[u] = true;
    for (const v of graph[u]) if (!visited[v]) visit(v);
    order.push(u);                 // record on FINISH (post-order)
  }
  for (let u = 0; u < n; u++) if (!visited[u]) visit(u);
  return order.reverse();          // finished-last comes first
}`}
      />
      <MBlock>{`\\text{a topological order exists} \\iff \\text{the graph is a DAG (no cycles)}`}</MBlock>

      <h3>Why DFS Post-Order Yields a Valid Topological Order</h3>
      <p>
        <strong>Theorem.</strong> On a DAG, listing vertices in <em>decreasing</em> order of DFS finish time
        <M>{` f[\\cdot]`}</M> (equivalently, pushing on finish and reversing) is a valid topological order: for
        every edge <M>{`(u, v)`}</M>, <M>{`u`}</M> appears before <M>{`v`}</M>.
      </p>
      <p>
        <strong>Proof.</strong> It suffices to show that for every edge <M>{`(u, v)`}</M> we have{" "}
        <M>{`f[u] > f[v]`}</M>. Consider the color of <M>{`v`}</M> at the moment DFS explores the edge{" "}
        <M>{`(u, v)`}</M> while <M>{`u`}</M> is gray:
      </p>
      <ul>
        <li>
          <strong><M>{`v`}</M> is white.</strong> Then <M>{`v`}</M> becomes a descendant of <M>{`u`}</M> in
          the DFS tree, so its interval nests inside: <M>{`d[u] < d[v] < f[v] < f[u]`}</M>. Hence{" "}
          <M>{`f[u] > f[v]`}</M>.
        </li>
        <li>
          <strong><M>{`v`}</M> is black.</strong> Then <M>{`v`}</M> has already finished, so{" "}
          <M>{`f[v] < f[u]`}</M> directly.
        </li>
        <li>
          <strong><M>{`v`}</M> is gray</strong> is impossible: a gray <M>{`v`}</M> would make{" "}
          <M>{`(u, v)`}</M> a back edge, and by the previous theorem back edges exist only when there is a
          cycle — contradicting the DAG hypothesis.
        </li>
      </ul>
      <p>
        In both possible cases <M>{`f[u] > f[v]`}</M>, so <M>{`u`}</M> precedes <M>{`v`}</M> in the
        decreasing-finish-time order. The existence half of the <M>{`\\iff`}</M> follows: every DAG admits a
        topological order (this construction produces one). Conversely, if a cycle existed, its edges would
        force a strict chain <M>{`f[v_1] > f[v_2] > \\cdots > f[v_1]`}</M>, an impossibility — so a
        topological order exists exactly when the graph is acyclic.
      </p>

      <div className="notice warn">
        <span className="lbl">Gotcha: cycles break topo sort</span>
        If the graph contains a directed cycle there is no valid ordering — the dependencies are circular.
        Robust topo-sort code detects the cycle (via the gray-node test) and reports it rather than emitting a
        bogus order.
      </div>
    </div>
  );
}

function Dijkstra() {
  return (
    <div className="prose">
      <p>
        When edges carry <strong>non-negative weights</strong>, "shortest" means least total weight, not
        fewest edges, and BFS no longer suffices. <strong>Dijkstra's algorithm</strong> grows a set of
        vertices whose shortest distance is finalized, always expanding the <em>closest</em> unfinalized
        vertex next. The trick to finding that closest vertex quickly is a <strong>min-heap</strong> (the
        priority queue from the Trees module) keyed by tentative distance.
      </p>

      <h3>Theorem: Dijkstra's Correctness under Non-Negative Weights</h3>
      <p>
        <strong>Theorem</strong>: Let <M>{`d(s, v)`}</M> be the true shortest path distance from source <M>{`s`}</M> to <M>{`v`}</M>. 
        If <M>{`w(e) \\ge 0`}</M> for all <M>{`e \\in E`}</M>, then when any vertex <M>{`u`}</M> is dequeued (finalized) by Dijkstra's algorithm, the tentative distance satisfies <M>{`\\text{dist}[u] = d(s, u)`}</M>.
      </p>
      <p>
        <strong>Proof by Contradiction</strong>:
      </p>
      <p>
        Suppose there is a vertex for which this fails. Let <M>{`u`}</M> be the <em>first</em> vertex dequeued where <M>{`\\text{dist}[u] > d(s, u)`}</M>. Let <M>{`S`}</M> be the set of vertices finalized before <M>{`u`}</M>.
      </p>
      <ol>
        <li>
          Consider a true shortest path <M>{`P`}</M> from <M>{`s`}</M> to <M>{`u`}</M>. Since <M>{`s \\in S`}</M> and <M>{`u \\notin S`}</M>, there must be a first edge <M>{`(x, y)`}</M> in <M>{`P`}</M> leaving <M>{`S`}</M> (so <M>{`x \\in S`}</M> and <M>{`y \\notin S`}</M>).
        </li>
        <li>
          Since <M>{`x \\in S`}</M> was finalized before <M>{`u`}</M>, by our assumption of minimality, its distance was correct: <M>{`\\text{dist}[x] = d(s, x)`}</M>.
        </li>
        <li>
          When <M>{`x`}</M> was finalized, the edge <M>{`(x, y)`}</M> was relaxed, which set:
          <MBlock>{`\\text{dist}[y] \\le \\text{dist}[x] + w(x, y) = d(s, x) + w(x, y) = d(s, y)`}</MBlock>
        </li>
        <li>
          Because edge weights are non-negative, the remaining path from <M>{`y`}</M> to <M>{`u`}</M> has non-negative cost, meaning <M>{`d(s, y) \\le d(s, u)`}</M>.
        </li>
        <li>
          Combining these inequalities:
          <MBlock>{`\\text{dist}[y] \\le d(s, y) \\le d(s, u) < \\text{dist}[u]`}</MBlock>
        </li>
        <li>
          This implies <M>{`\\text{dist}[y] < \\text{dist}[u]`}</M>. Since the priority queue always selects the node with the minimum tentative distance, <M>{`y`}</M> must have been dequeued before <M>{`u`}</M>, which contradicts the fact that <M>{`u`}</M> was dequeued before <M>{`y`}</M>.
        </li>
      </ol>
      <p>
        Thus, the assumption is false, and every finalized vertex has a correct distance.
      </p>

      <Code
        lang="ts"
        filename="dijkstra.ts"
        code={`// graph[u] = array of [neighbor, weight]. Uses a min-heap 'pq'.
function dijkstra(graph: [number, number][][], src: number): number[] {
  const dist = new Array(graph.length).fill(Infinity);
  dist[src] = 0;
  const pq = new MinHeap();          // items: [distance, vertex]
  pq.push([0, src]);
  while (!pq.isEmpty()) {
    const [d, u] = pq.pop()!;
    if (d > dist[u]) continue;       // stale entry — skip
    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {   // relax the edge
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`}
      />
      <p>
        Each edge triggers at most one heap push, and each push/pop is <M>{`O(\\log n)`}</M>, so with a binary
        heap Dijkstra runs in:
      </p>
      <MBlock>{`O\\big((n + m)\\log n\\big)`}</MBlock>
      <p>
        The <strong>relaxation</strong> step — "is going through <M>{`u`}</M> cheaper than the best route to
        <M>{` v`}</M> found so far?" — is the heart of the algorithm. The <strong>lazy</strong> variant shown
        above leaves outdated entries in the heap and skips them on pop with the <code>d &gt; dist[u]</code>{" "}
        guard, which is simpler than decrease-key and fast enough in practice.
      </p>
      <div className="notice warn">
        <span className="lbl">Gotcha: no negative edges</span>
        Dijkstra assumes non-negative weights. A negative edge can make a longer path cheaper <em>after</em> a
        vertex was already finalized, silently corrupting results. For negative weights use Bellman-Ford,
        which is slower at <M>{`O(nm)`}</M> but correct.
      </div>
    </div>
  );
}

function UnionFind() {
  return (
    <div className="prose">
      <p>
        A <strong>disjoint-set union (DSU)</strong>, or <strong>union-find</strong>, tracks a partition of
        elements into disjoint groups and answers one question blisteringly fast: "are <M>{`a`}</M> and{" "}
        <M>{`b`}</M> in the same group?" It supports two operations — <strong>find</strong> (which group is
        <M>{` x`}</M> in?) and <strong>union</strong> (merge the groups of <M>{`a`}</M> and <M>{`b`}</M>). It
        is the engine behind Kruskal's minimum-spanning-tree algorithm and connectivity queries.
      </p>
      <p>
        Each group is a tree; every element points to a parent, and the group's identity is its root. Two
        optimizations make it nearly constant time:
      </p>
      <ul>
        <li>
          <strong>Union by rank</strong> — attach the shorter tree under the taller one so trees stay shallow.
        </li>
        <li>
          <strong>Path compression</strong> — during <code>find</code>, point every node visited directly at
          the root, flattening the tree for next time.
        </li>
      </ul>
      <Code
        lang="ts"
        filename="dsu.ts"
        code={`class DSU {
  private parent: number[];
  private rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);  // each its own root
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);          // path compression
    }
    return this.parent[x];
  }
  union(a: number, b: number): void {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return;                                 // already merged
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                                  // union by rank
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
  }
}`}
      />
      <p>
        With both optimizations, a sequence of <M>{`k`}</M> operations costs
        <M>{` O(k\\,\\alpha(n))`}</M>, where <M>{`\\alpha`}</M> is the inverse Ackermann function —
        effectively a small constant (below 5) for any <M>{`n`}</M> that fits in the universe.
      </p>
      <MBlock>{`\\text{amortized per operation} = O(\\alpha(n)) \\approx O(1)`}</MBlock>

      <h3>The Cut Property and Why Kruskal's Greedy Choice Is Optimal</h3>
      <p>
        A <strong>minimum spanning tree (MST)</strong> of a connected, undirected, weighted graph is a
        spanning tree of least total edge weight. Kruskal's algorithm sorts the <M>{`m`}</M> edges by weight
        and adds each one whose endpoints lie in different components (an <M>{`O(1)`}</M> union-find check),
        skipping any edge that would close a cycle. Its correctness rests on a single structural fact.
      </p>
      <p>
        <strong>Cut Property.</strong> Let <M>{`(S, V \\setminus S)`}</M> be any partition of the vertices
        into two non-empty sides (a <em>cut</em>), and let <M>{`e`}</M> be an edge of strictly minimum weight
        among all edges crossing the cut. Then <M>{`e`}</M> belongs to every MST.
      </p>
      <p>
        <strong>Proof (exchange argument).</strong> Let <M>{`T`}</M> be an MST and suppose{" "}
        <M>{`e = (u, v) \\notin T`}</M>. Since <M>{`T`}</M> is a spanning tree it contains a unique path{" "}
        <M>{`u \\rightsquigarrow v`}</M>. Because <M>{`u \\in S`}</M> and <M>{`v \\in V \\setminus S`}</M>,
        that path must cross the cut on some edge <M>{`e'`}</M>. Form{" "}
        <M>{`T' = T - e' + e`}</M>: removing <M>{`e'`}</M> from the cycle <M>{`e' + (u \\rightsquigarrow v)`}</M>
        and adding <M>{`e`}</M> keeps <M>{`T'`}</M> connected and acyclic, so it is again a spanning tree.
        Its weight is <M>{`w(T') = w(T) - w(e') + w(e)`}</M>. Since <M>{`e`}</M> is the strict minimum crossing
        edge, <M>{`w(e) < w(e')`}</M>, giving <M>{`w(T') < w(T)`}</M> — contradicting the minimality of{" "}
        <M>{`T`}</M>. Hence every MST contains <M>{`e`}</M>. (With ties, the same argument shows <M>{`e`}</M>{" "}
        is contained in <em>some</em> MST.)
      </p>
      <p>
        <strong>Correctness of Kruskal.</strong> When Kruskal considers an edge <M>{`e = (u, v)`}</M> whose
        endpoints are in different components, let <M>{`S`}</M> be the component currently containing{" "}
        <M>{`u`}</M>. Every earlier (lighter) edge crossing the cut <M>{`(S, V \\setminus S)`}</M> was
        rejected, which happens only if both its endpoints were already inside <M>{`S`}</M> — so no such edge
        crosses the cut. Thus <M>{`e`}</M> is the lightest edge crossing <M>{`(S, V \\setminus S)`}</M>, and by
        the cut property it is safe to add. The dual <strong>cycle property</strong> — the heaviest edge on
        any cycle is in no MST — justifies the skips. The dominant cost is sorting the edges:
      </p>
      <MBlock>{`O(m \\log m) = O(m \\log n) \\;\\text{ (sorting)} \\; + \\; O(m\\,\\alpha(n)) \\;\\text{ (union-find)}`}</MBlock>

      <div className="notice">
        <span className="lbl">Where it shines</span>
        Kruskal's MST sorts edges and unions endpoints, skipping any edge whose endpoints are already
        connected. Union-find is also the standard tool for "number of connected components" and dynamic
        connectivity as edges arrive.
      </div>
    </div>
  );
}

export const dsaGraphs: Module = {
  id: "dsa-graphs",
  title: "Graphs",
  icon: "🕸️",
  track: "dsa",
  blurb: "Representing networks and searching them: adjacency structures, BFS, DFS, Dijkstra, and union-find.",
  dependsOn: ["dsa-trees", "dsa-hashing"],
  lessons: [
    {
      id: "representations",
      title: "Graph Representations",
      minutes: 12,
      summary: "Adjacency list vs matrix and the sparse/dense tradeoff.",
      Body: Representations,
      quiz: {
        questions: [
          {
            q: "An adjacency list uses how much space for a graph with n vertices and m edges?",
            choices: ["O(n^2)", "O(n + m)", "O(m^2)", "O(n * m)"],
            answer: 1,
            explain: "One entry per vertex plus one per edge (two for undirected) totals O(n + m).",
          },
          {
            q: "An adjacency matrix is the better choice when…",
            choices: [
              "The graph is sparse",
              "The graph is dense or you need O(1) edge-existence checks and n is small",
              "You never query edges",
              "There are no weights",
            ],
            answer: 1,
            explain: "The matrix pays O(n^2) space unconditionally, worth it only when edges are plentiful or O(1) lookups matter.",
          },
        ],
      },
      exercises: [
        {
          id: "matrix-space",
          kind: "numeric",
          prompt:
            "A graph has 2,000 vertices and 6,000 directed edges. How many cells does its adjacency matrix have? Enter the number.",
          starter: "",
          validate: (s) =>
            Math.abs(parseFloat(s) - 4000000) < 0.5
              ? { pass: true, message: "Correct — n^2 = 2000^2 = 4,000,000 cells, of which only 6,000 are non-zero. Very wasteful here; use a list." }
              : { pass: false, message: "Not quite. An adjacency matrix is n x n cells regardless of edge count." },
          hint: "The matrix is always n x n.",
        },
      ],
    },
    {
      id: "bfs",
      title: "Breadth-First Search",
      minutes: 13,
      summary: "Level-order exploration and shortest paths in unweighted graphs.",
      Body: BFS,
      quiz: {
        questions: [
          {
            q: "In an unweighted graph, BFS finds the shortest path because…",
            choices: [
              "It uses a stack",
              "It visits vertices in order of increasing distance from the source",
              "It sorts the edges first",
              "It uses edge weights",
            ],
            answer: 1,
            explain: "BFS finishes all vertices at distance k before any at distance k+1, so the first arrival is via the fewest edges.",
          },
          {
            q: "When should you mark a vertex as visited in BFS?",
            choices: [
              "When you dequeue it",
              "When you enqueue it",
              "After the whole search finishes",
              "Never",
            ],
            answer: 1,
            explain: "Marking on enqueue prevents the same vertex from being pushed multiple times and keeps the run O(n + m).",
          },
        ],
      },
      exercises: [
        {
          id: "bfs-dist",
          kind: "open",
          prompt:
            "You run BFS from node A. Node X is enqueued while processing a node at distance 3. What is X's shortest-path distance from A, and why can BFS guarantee it?",
          starter: "",
          rubric:
            "Full credit: distance 4 (one more than the node at distance 3), and BFS guarantees it because it explores strictly in order of increasing distance, so X's first discovery is along a shortest path. Partial: correct number but weak justification.",
          hint: "A neighbor is exactly one edge farther than the vertex that discovers it.",
        },
      ],
    },
    {
      id: "dfs-topo",
      title: "DFS, Cycles & Topological Sort",
      minutes: 15,
      summary: "Recursion and stacks, back edges for cycle detection, ordering a DAG.",
      Body: DFSTopo,
      quiz: {
        questions: [
          {
            q: "A topological ordering of a directed graph exists if and only if the graph…",
            choices: ["Is connected", "Has no directed cycle (is a DAG)", "Is undirected", "Has weighted edges"],
            answer: 1,
            explain: "A cycle creates a circular dependency with no valid linear order; only DAGs can be topologically sorted.",
          },
          {
            q: "In DFS-based topological sort, a vertex is added to the output…",
            choices: [
              "When it is first discovered",
              "When its recursion finishes (post-order), then the list is reversed",
              "In random order",
              "Only if it is a leaf",
            ],
            answer: 1,
            explain: "Recording on finish and reversing places dependency-free vertices first.",
          },
          {
            q: "DFS detects a cycle in a directed graph when it reaches a vertex that is…",
            choices: [
              "Already finished",
              "Currently on the recursion stack (a back edge)",
              "A leaf",
              "The source",
            ],
            answer: 1,
            explain: "An edge to a vertex still in progress (gray) closes a cycle; an edge to a finished (black) vertex does not.",
          },
        ],
      },
    },
    {
      id: "dijkstra",
      title: "Dijkstra's Shortest Path",
      minutes: 16,
      summary: "Greedy relaxation with a min-heap for non-negative weighted graphs.",
      Body: Dijkstra,
      quiz: {
        questions: [
          {
            q: "Dijkstra's algorithm requires that all edge weights be…",
            choices: ["Integers", "Non-negative", "Equal", "At most 1"],
            answer: 1,
            explain: "A negative edge can undercut an already-finalized distance, so Dijkstra is only correct with non-negative weights.",
          },
          {
            q: "With a binary heap, Dijkstra runs in…",
            choices: ["O(n^2)", "O((n + m) log n)", "O(n + m)", "O(m^2)"],
            answer: 1,
            explain: "Each edge causes at most one heap push, and each heap operation is O(log n).",
          },
        ],
      },
      exercises: [
        {
          id: "relax",
          kind: "open",
          prompt:
            "The best known distance to vertex v is 10. We pop u with dist[u] = 7, and there is an edge u -> v of weight 2. Does Dijkstra update dist[v]? To what, and what is this step called?",
          starter: "",
          rubric:
            "Full credit: yes, because 7 + 2 = 9 < 10, so dist[v] becomes 9; the step is called edge relaxation. Partial: correct value but does not name relaxation, or vice versa.",
          hint: "Compare dist[u] + weight against the current dist[v].",
        },
      ],
    },
    {
      id: "union-find",
      title: "Union-Find (Disjoint Set Union)",
      minutes: 13,
      summary: "Near-constant-time connectivity with path compression and union by rank.",
      Body: UnionFind,
      quiz: {
        questions: [
          {
            q: "Path compression speeds up union-find by…",
            choices: [
              "Sorting the elements",
              "Pointing visited nodes directly at the root during find",
              "Deleting merged sets",
              "Using a matrix",
            ],
            answer: 1,
            explain: "Flattening the path during find makes subsequent finds shallow, driving amortized cost toward O(1).",
          },
          {
            q: "With union by rank and path compression, the amortized cost per operation is…",
            choices: ["O(log n)", "O(alpha(n)), effectively O(1)", "O(n)", "O(n log n)"],
            answer: 1,
            explain: "The inverse Ackermann function alpha(n) is below 5 for any practical n, so operations are effectively constant time.",
          },
        ],
      },
    },
  ],
};
