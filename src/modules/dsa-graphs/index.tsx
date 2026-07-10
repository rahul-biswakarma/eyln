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
