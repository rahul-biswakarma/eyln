import type { Module } from "../../content/types";
import { M, MBlock } from "../../components/Math";
import { Code, CodeTabs } from "../../components/CodeBlock";
import { IntegratorDemo } from "../../widgets/IntegratorDemo";

function GameLoop() {
  return (
    <div className="prose">
      <p>
        Most application code sleeps until an event wakes it. A game is the opposite: it runs a{" "}
        <strong>loop</strong> forever, and each turn of the loop produces one frame. The time
        between frames is <M>{`\\Delta t`}</M> (dt) — everything that moves is scaled by it, so the
        simulation runs at the same speed whether you're at 30 or 144 fps.
      </p>
      <p>
        The subtlety: if you feed the raw frame time straight into physics, a stutter (a big dt)
        can make objects tunnel through walls or explode. The fix is a <strong>fixed timestep</strong>
        — accumulate real time and step the simulation in constant slices:
      </p>
      <Code
        lang="odin" filename="loop.odin"
        code={`FIXED_DT :: 1.0 / 60.0
accumulator: f32 = 0

for running {
    frame_time := get_delta_time()          // real seconds since last frame
    accumulator += min(frame_time, 0.25)     // clamp to avoid spiral of death

    for accumulator >= FIXED_DT {            // step physics in constant slices
        physics_update(FIXED_DT)
        accumulator -= FIXED_DT
    }

    alpha := accumulator / FIXED_DT          // leftover, for interpolation
    render(alpha)                            // draw at the display's rate
}`}
      />
      <div className="notice">
        <span className="lbl">Rule of thumb</span>
        Simulate at a <strong>fixed</strong> dt for stability and determinism; <strong>render</strong>{" "}
        as fast as the display allows, interpolating between the last two physics states.
      </div>
    </div>
  );
}

function Integration() {
  return (
    <div className="prose">
      <p>
        Physics is calculus you don't have a formula for, so you approximate: given acceleration,
        step velocity and position forward by small amounts. The <em>how</em> matters enormously for
        stability.
      </p>
      <p><strong>Explicit (forward) Euler</strong> — update position with the old velocity:</p>
      <MBlock>{`x_{t+1} = x_t + v_t \\, \\Delta t \\qquad v_{t+1} = v_t + a \\, \\Delta t`}</MBlock>
      <p>Simple, but it <em>adds energy</em> over time — orbits spiral out, bouncing balls climb.</p>
      <p><strong>Semi-implicit (symplectic) Euler</strong> — update velocity first, then use the new velocity for position:</p>
      <MBlock>{`v_{t+1} = v_t + a \\, \\Delta t \\qquad x_{t+1} = x_t + v_{t+1} \\, \\Delta t`}</MBlock>
      <p>
        One line reordered, and it becomes energy-stable. This is the workhorse of game physics.
      </p>
      <p>
        <strong>Verlet</strong> stores the previous position instead of velocity — great for cloth,
        ropes, and constraint-based systems (and, not coincidentally, the family Tiny Glade-style
        soft systems lean on).
      </p>
      <IntegratorDemo />
      <div className="notice warn">
        <span className="lbl">See it break</span>
        Select <strong>explicit Euler</strong> and drag <strong>dt</strong> up. The ball gains
        height each bounce — energy created from nothing. Switch to <strong>semi-implicit</strong>{" "}
        at the same dt: stable. This is the single most useful physics lesson.
      </div>
    </div>
  );
}

function Forces() {
  return (
    <div className="prose">
      <p>
        Newton: <M>{`F = ma`}</M>, so acceleration is <M>{`a = F/m`}</M>. Each frame you sum the
        forces on a body, divide by mass, and integrate. Gravity is a constant downward
        acceleration; drag is a force opposing velocity; springs pull toward a rest point.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "Odin", lang: "odin", filename: "body.odin",
            code: `Body :: struct { pos, vel: [3]f32, mass: f32 }

update :: proc(b: ^Body, dt: f32) {
    GRAVITY :: [3]f32{0, -9.81, 0}
    DRAG    :: 0.98

    force := GRAVITY * b.mass
    accel := force / b.mass

    b.vel += accel * dt        // semi-implicit: velocity first
    b.vel *= DRAG              // simple damping
    b.pos += b.vel * dt
}`,
          },
          {
            label: "TypeScript", lang: "ts",
            code: `function update(b, dt) {
  const GRAVITY = [0, -9.81, 0];
  const accel = GRAVITY;            // F/m with F = m*g cancels mass
  b.vel[1] += accel[1] * dt;        // velocity first (semi-implicit)
  b.vel = b.vel.map(v => v * 0.98); // damping
  b.pos[1] += b.vel[1] * dt;
}`,
          },
        ]}
      />
      <p>
        Notice gravity's mass cancels: <M>{`a = mg/m = g`}</M>. That's why a feather and a hammer
        fall together in a vacuum — and why you rarely divide by mass for gravity in code.
      </p>
    </div>
  );
}

function Collision() {
  return (
    <div className="prose">
      <p>
        Collision detection asks: are two shapes overlapping, and if so, how do I push them apart?
        You start with cheap <strong>bounding volumes</strong> and only do exact tests when those
        overlap.
      </p>
      <ul>
        <li>
          <strong>AABB</strong> (axis-aligned bounding box): overlap if the intervals overlap on{" "}
          <em>every</em> axis. Cheapest possible test.
        </li>
        <li>
          <strong>Sphere</strong>: two spheres collide if the distance between centers is less than
          the sum of radii — compare <em>squared</em> distances to skip the square root.
        </li>
        <li>
          <strong>Ray–plane</strong>: the basis of picking (clicking to place a wall on terrain) and
          many queries.
        </li>
      </ul>
      <MBlock>{`\\text{spheres hit} \\iff \\|c_1 - c_2\\|^2 < (r_1 + r_2)^2`}</MBlock>
      <Code
        lang="odin" filename="collide.odin"
        code={`aabb_overlap :: proc(a_min, a_max, b_min, b_max: [3]f32) -> bool {
    return a_min.x <= b_max.x && a_max.x >= b_min.x &&
           a_min.y <= b_max.y && a_max.y >= b_min.y &&
           a_min.z <= b_max.z && a_max.z >= b_min.z
}

// Ray-plane: where does a click ray hit the ground plane y=0?
ray_plane :: proc(origin, dir, plane_n: [3]f32, plane_d: f32) -> (hit: [3]f32, ok: bool) {
    denom := linalg.dot(plane_n, dir)
    if abs(denom) < 1e-6 do return {}, false     // parallel
    t := -(linalg.dot(plane_n, origin) + plane_d) / denom
    return origin + dir * t, t >= 0
}`}
      />
      <div className="notice">
        <span className="lbl">Why this matters for the capstone</span>
        Dropping a wall point onto terrain is a <strong>ray–plane</strong> (or ray–heightfield)
        test: you cast a ray from the camera through the mouse and find where it meets the ground.
        The <strong>Separating Axis Theorem</strong> generalizes AABB to arbitrary convex shapes — if
        there's any axis where the projections don't overlap, the shapes don't touch.
      </div>
    </div>
  );
}

export const physics: Module = {
  id: "physics",
  title: "Physics",
  icon: "🎯",
  blurb: "The game loop, numerical integration, forces, and collision — scoped to what a small engine actually needs.",
  dependsOn: ["linear-algebra"],
  lessons: [
    {
      id: "game-loop", title: "The Game Loop & dt", minutes: 12,
      summary: "Fixed vs variable timestep, and why simulation and rendering differ.",
      Body: GameLoop,
      quiz: {
        questions: [
          { q: "Why scale movement by dt?", choices: ["To use more CPU", "So motion is frame-rate independent", "Because Odin requires it", "To add randomness"], answer: 1, explain: "Multiplying by dt makes speed consistent regardless of frame rate." },
          { q: "A fixed timestep for physics gives you…", choices: ["Higher fps", "Stability and determinism", "Prettier graphics", "Less code"], answer: 1, explain: "Constant-size steps keep the simulation stable and reproducible." },
        ],
      },
      exercises: [
        {
          id: "loop-dt60", kind: "numeric", prompt: "A game runs at 60 fps. Enter dt (seconds per frame), rounded to 4 decimals.",
          starter: "", hint: "dt = 1 / fps = 1 / 60.",
          validate: (s) => Math.abs(parseFloat(s) - 0.0167) < 0.001 ? { pass: true, message: "Correct — 1 / 60 ≈ 0.0167 s." } : { pass: false, message: "dt = 1 / fps." },
        },
        {
          id: "loop-dt144", kind: "numeric", prompt: "A monitor refreshes at 144 fps. Enter dt (seconds per frame), rounded to 4 decimals.",
          starter: "", hint: "dt = 1 / 144.",
          validate: (s) => Math.abs(parseFloat(s) - 0.0069) < 0.001 ? { pass: true, message: "Correct — 1 / 144 ≈ 0.0069 s." } : { pass: false, message: "dt = 1 / fps." },
        },
        {
          id: "loop-steps", kind: "numeric", prompt: "With FIXED_DT = 1/60 s and an accumulator of 0.055 s, how many fixed physics steps run this frame?",
          starter: "", hint: "floor(accumulator / FIXED_DT) = floor(0.055 · 60).",
          validate: (s) => Math.abs(parseFloat(s) - 3) < 0.01 ? { pass: true, message: "Correct — 0.055 · 60 = 3.3, so 3 full steps run." } : { pass: false, message: "Count how many whole FIXED_DT slices fit in the accumulator." },
        },
        {
          id: "loop-steps2", kind: "numeric", prompt: "With FIXED_DT = 0.02 s and an accumulator of 0.1 s, how many fixed physics steps run this frame?",
          starter: "", hint: "0.1 / 0.02.",
          validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — 0.1 / 0.02 = 5 steps." } : { pass: false, message: "Divide the accumulator by FIXED_DT and take the floor." },
        },
        {
          id: "loop-alpha", kind: "numeric", prompt: "After stepping, the accumulator holds 0.008 s and FIXED_DT = 0.016 s. Enter the interpolation alpha = accumulator / FIXED_DT, rounded to 2 decimals.",
          starter: "", hint: "0.008 / 0.016.",
          validate: (s) => Math.abs(parseFloat(s) - 0.5) < 0.05 ? { pass: true, message: "Correct — 0.008 / 0.016 = 0.5." } : { pass: false, message: "alpha = leftover accumulator / FIXED_DT." },
        },
      ],
    },
    {
      id: "integration", title: "Numerical Integration", minutes: 14,
      summary: "Euler vs semi-implicit Euler vs Verlet — and why one blows up.",
      Body: Integration,
      quiz: {
        questions: [
          { q: "The game-dev default integrator is…", choices: ["Explicit Euler", "Semi-implicit (symplectic) Euler", "None — use exact formulas", "Random"], answer: 1, explain: "Semi-implicit Euler updates velocity first and is energy-stable — the standard choice." },
          { q: "Explicit Euler at large dt tends to…", choices: ["Lose energy and stop", "Gain energy and become unstable", "Stay perfect", "Crash the compiler"], answer: 1, explain: "It uses stale velocity, injecting energy — orbits spiral out, bounces grow." },
        ],
      },
      exercises: [
        {
          id: "int-vel", kind: "numeric", prompt: "A body has velocity v = 2 m/s and acceleration a = 10 m/s². After one Euler step with dt = 0.5 s, enter the new velocity v = v + a·dt.",
          starter: "", hint: "2 + 10·0.5.",
          validate: (s) => Math.abs(parseFloat(s) - 7) < 0.01 ? { pass: true, message: "Correct — 2 + 5 = 7 m/s." } : { pass: false, message: "v_new = v + a·dt." },
        },
        {
          id: "int-pos-explicit", kind: "numeric", prompt: "Explicit Euler: position x = 0, velocity v = 3 m/s, dt = 0.5 s. Enter the new position x = x + v·dt (using the OLD velocity).",
          starter: "", hint: "0 + 3·0.5.",
          validate: (s) => Math.abs(parseFloat(s) - 1.5) < 0.01 ? { pass: true, message: "Correct — 0 + 1.5 = 1.5 m." } : { pass: false, message: "Explicit Euler uses the old velocity: x + v·dt." },
        },
        {
          id: "int-pos-semi", kind: "numeric", prompt: "Semi-implicit Euler: x = 0, v = 2 m/s, a = 10 m/s², dt = 0.5 s. Update velocity first, then position. Enter the new position.",
          starter: "", hint: "v_new = 2 + 10·0.5 = 7; then x = 0 + v_new·0.5.",
          validate: (s) => Math.abs(parseFloat(s) - 3.5) < 0.01 ? { pass: true, message: "Correct — v_new = 7, x = 7·0.5 = 3.5 m." } : { pass: false, message: "Update velocity first (v + a·dt), then x = x + v_new·dt." },
        },
        {
          id: "int-freefall", kind: "numeric", prompt: "A ball starts at rest (v = 0) and falls under a = -9.81 m/s². After one step with dt = 1 s, enter the new velocity, rounded to 2 decimals.",
          starter: "", hint: "0 + (-9.81)·1.",
          validate: (s) => Math.abs(parseFloat(s) - (-9.81)) < 0.05 ? { pass: true, message: "Correct — v = -9.81 m/s (falling)." } : { pass: false, message: "v_new = v + a·dt = 0 + (-9.81)·1." },
        },
      ],
    },
    {
      id: "forces", title: "Forces, Gravity, Damping", minutes: 10,
      summary: "F = ma each frame; why gravity ignores mass.",
      Body: Forces,
      quiz: {
        questions: [
          { q: "For gravity, why don't we usually divide by mass?", choices: ["Mass is always 1", "a = mg/m = g — the mass cancels", "It's a bug", "Gravity has no force"], answer: 1, explain: "Gravitational force is m·g, so acceleration is g regardless of mass." },
        ],
      },
      exercises: [
        {
          id: "force-accel", kind: "numeric", prompt: "A net force of 20 N acts on a body of mass 4 kg. Enter the acceleration a = F/m in m/s².",
          starter: "", hint: "20 / 4.",
          validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — 20 / 4 = 5 m/s²." } : { pass: false, message: "a = F / m." },
        },
        {
          id: "force-net", kind: "numeric", prompt: "A body feels a thrust of 50 N up and gravity of 30 N down. Enter the net force (up positive) in newtons.",
          starter: "", hint: "50 − 30.",
          validate: (s) => Math.abs(parseFloat(s) - 20) < 0.01 ? { pass: true, message: "Correct — 50 − 30 = 20 N upward." } : { pass: false, message: "Sum the forces: 50 up minus 30 down." },
        },
        {
          id: "force-weight", kind: "numeric", prompt: "Using g = 9.81 m/s², enter the gravitational force (weight) on a 2 kg mass, in newtons. Round to 2 decimals.",
          starter: "", hint: "F = m·g = 2·9.81.",
          validate: (s) => Math.abs(parseFloat(s) - 19.62) < 0.05 ? { pass: true, message: "Correct — 2 · 9.81 = 19.62 N." } : { pass: false, message: "F = m·g." },
        },
        {
          id: "force-damp", kind: "numeric", prompt: "A velocity of 10 m/s is damped by multiplying by 0.98 each step. Enter the velocity after one step.",
          starter: "", hint: "10 · 0.98.",
          validate: (s) => Math.abs(parseFloat(s) - 9.8) < 0.01 ? { pass: true, message: "Correct — 10 · 0.98 = 9.8 m/s." } : { pass: false, message: "Multiply the velocity by the damping factor 0.98." },
        },
        {
          id: "force-accel-g", kind: "numeric", prompt: "A 5 kg body feels a gravitational force of 49.05 N. Enter the resulting acceleration a = F/m, rounded to 2 decimals.",
          starter: "", hint: "49.05 / 5.",
          validate: (s) => Math.abs(parseFloat(s) - 9.81) < 0.05 ? { pass: true, message: "Correct — 49.05 / 5 = 9.81 m/s², i.e. g regardless of mass." } : { pass: false, message: "a = F / m." },
        },
      ],
    },
    {
      id: "collision", title: "Collision Basics", minutes: 13,
      summary: "AABB, sphere, ray–plane, and the separating-axis idea.",
      Body: Collision,
      quiz: {
        questions: [
          { q: "Two spheres collide when…", choices: ["Their radii are equal", "Center distance < sum of radii", "They share a color", "Always"], answer: 1, explain: "Compare center distance (squared) to the squared sum of radii." },
          { q: "Placing a wall point on terrain by clicking uses a…", choices: ["Sphere test", "Ray–plane / ray–heightfield test", "Dot product only", "Sorting algorithm"], answer: 1, explain: "You cast a ray from the camera through the cursor and find the ground hit." },
        ],
      },
      exercises: [
        {
          id: "col-centerdist", kind: "numeric", prompt: "Two sphere centers are at (0, 0, 0) and (3, 4, 0). Enter the distance between the centers.",
          starter: "", hint: "√(3² + 4²).",
          validate: (s) => Math.abs(parseFloat(s) - 5) < 0.01 ? { pass: true, message: "Correct — √25 = 5." } : { pass: false, message: "Distance = √(3² + 4² + 0²)." },
        },
        {
          id: "col-spheres", kind: "numeric", prompt: "Sphere A (center distance 5 apart from B) has radius 2, sphere B has radius 4. Do they overlap? Enter 1 for yes, 0 for no.",
          starter: "", hint: "They overlap if center distance < sum of radii (2 + 4 = 6).",
          validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01 ? { pass: true, message: "Correct — 5 < 6, so the spheres overlap." } : { pass: false, message: "Compare distance 5 with the sum of radii 6." },
        },
        {
          id: "col-penetration", kind: "numeric", prompt: "Two spheres with radii 3 and 4 have centers 5 apart. Enter the penetration depth = (r1 + r2) − distance.",
          starter: "", hint: "(3 + 4) − 5.",
          validate: (s) => Math.abs(parseFloat(s) - 2) < 0.01 ? { pass: true, message: "Correct — 7 − 5 = 2 units of overlap." } : { pass: false, message: "Penetration = sum of radii minus center distance." },
        },
        {
          id: "col-aabb", kind: "numeric", prompt: "AABB A spans x ∈ [0, 4], AABB B spans x ∈ [3, 7]. On the x-axis, do the intervals overlap? Enter 1 for yes, 0 for no.",
          starter: "", hint: "Overlap if A.min ≤ B.max and A.max ≥ B.min.",
          validate: (s) => Math.abs(parseFloat(s) - 1) < 0.01 ? { pass: true, message: "Correct — [0,4] and [3,7] overlap on [3,4]." } : { pass: false, message: "Check 0 ≤ 7 and 4 ≥ 3 — both hold." },
        },
        {
          id: "col-aabb2", kind: "numeric", prompt: "AABB A spans x ∈ [0, 2], AABB B spans x ∈ [5, 9]. Do the x-intervals overlap? Enter 1 for yes, 0 for no.",
          starter: "", hint: "Is A.max = 2 ≥ B.min = 5?",
          validate: (s) => Math.abs(parseFloat(s) - 0) < 0.01 ? { pass: true, message: "Correct — 2 < 5, so there is a separating gap: no overlap." } : { pass: false, message: "A.max = 2 is below B.min = 5, so they do not overlap." },
        },
      ],
    },
  ],
};
