import type { CodeChallenge } from "../types";

export const engineChallenges: CodeChallenge[] = [
  {
    id: "engine-vec3-add",
    title: "Add Two Vectors",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "add"],
    prompt:
      "A vec3 is a plain array <code>[x, y, z]</code>. Given two vec3s <code>a</code> and <code>b</code>, return their component-wise sum <code>[ax+bx, ay+by, az+bz]</code>. All inputs are integers, so no rounding is needed.",
    fnName: "vec3Add",
    starter: "function vec3Add(a, b) {\n  // return [x, y, z]\n}",
    tests: [
      { args: [[1, 2, 3], [4, 5, 6]], expected: [5, 7, 9] },
      { args: [[-1, 0, 2], [1, 0, -2]], expected: [0, 0, 0] },
      { args: [[0, 0, 0], [0, 0, 0]], expected: [0, 0, 0] },
      { args: [[2.5, -1, 3], [0.5, 1, -3]], expected: [3, 0, 0] },
    ],
    hint: "Add each pair of components independently.",
    solution:
      "function vec3Add(a, b) {\n  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];\n}",
  },
  {
    id: "engine-vec3-scale",
    title: "Scale a Vector",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "scale"],
    prompt:
      "Given a vec3 <code>v = [x, y, z]</code> and a scalar <code>s</code>, return <code>[x*s, y*s, z*s]</code>. Inputs are chosen so results are exact; no rounding needed.",
    fnName: "vec3Scale",
    starter: "function vec3Scale(v, s) {\n  // return [x, y, z]\n}",
    tests: [
      { args: [[1, 2, 3], 2], expected: [2, 4, 6] },
      { args: [[1, -2, 3], 0], expected: [0, 0, 0] },
      { args: [[2, 4, 6], 0.5], expected: [1, 2, 3] },
      { args: [[-1, 2, -3], -2], expected: [2, -4, 6] },
    ],
    hint: "Multiply every component by the same scalar.",
    solution:
      "function vec3Scale(v, s) {\n  return [v[0] * s, v[1] * s, v[2] * s];\n}",
  },
  {
    id: "engine-vec3-dot",
    title: "Dot Product",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "dot"],
    prompt:
      "Return the dot product of two vec3s: <code>ax*bx + ay*by + az*bz</code>. This is a single number. Inputs are integers, so the answer is exact.",
    fnName: "vec3Dot",
    starter: "function vec3Dot(a, b) {\n  // return a number\n}",
    tests: [
      { args: [[1, 2, 3], [4, 5, 6]], expected: 32 },
      { args: [[1, 0, 0], [0, 1, 0]], expected: 0 },
      { args: [[-1, -2, -3], [1, 2, 3]], expected: -14 },
      { args: [[2, 2, 2], [3, 3, 3]], expected: 18 },
    ],
    hint: "Sum the products of matching components. Perpendicular vectors give 0.",
    solution:
      "function vec3Dot(a, b) {\n  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];\n}",
  },
  {
    id: "engine-vec3-length",
    title: "Vector Length",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "length", "magnitude"],
    prompt:
      "Return the Euclidean length (magnitude) of a vec3: <code>sqrt(x*x + y*y + z*z)</code>. Return the result rounded to 4 decimals (<code>Math.round(x*1e4)/1e4</code>).",
    fnName: "vec3Length",
    starter: "function vec3Length(v) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [[3, 4, 0]], expected: 5 },
      { args: [[1, 2, 2]], expected: 3 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [[1, 1, 1]], expected: 1.7321 },
    ],
    hint: "Take the square root of the dot product of the vector with itself, then round.",
    solution:
      "function vec3Length(v) {\n  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);\n  return Math.round(l * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-vec3-normalize",
    title: "Normalize a Vector",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "normalize", "unit"],
    prompt:
      "Return the unit vector pointing the same direction as <code>v</code>: divide each component by the length <code>sqrt(x*x+y*y+z*z)</code>. Return each component rounded to 4 decimals. Assume the input is never the zero vector.",
    fnName: "vec3Normalize",
    starter:
      "function vec3Normalize(v) {\n  // return [x, y, z] each rounded to 4 decimals\n}",
    tests: [
      { args: [[3, 4, 0]], expected: [0.6, 0.8, 0] },
      { args: [[0, 0, 5]], expected: [0, 0, 1] },
      { args: [[1, 2, 2]], expected: [0.3333, 0.6667, 0.6667] },
      { args: [[1, 1, 1]], expected: [0.5774, 0.5774, 0.5774] },
    ],
    hint: "Compute the length once, then divide each component by it and round.",
    solution:
      "function vec3Normalize(v) {\n  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);\n  const r = (x) => Math.round((x / l) * 1e4) / 1e4;\n  return [r(v[0]), r(v[1]), r(v[2])];\n}",
  },
  {
    id: "engine-vec3-cross",
    title: "Cross Product",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "cross", "normal"],
    prompt:
      "Return the cross product <code>a x b</code>, which is perpendicular to both inputs: <code>[ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx]</code>. Inputs are integers, so the result is exact.",
    fnName: "vec3Cross",
    starter: "function vec3Cross(a, b) {\n  // return [x, y, z]\n}",
    tests: [
      { args: [[1, 0, 0], [0, 1, 0]], expected: [0, 0, 1] },
      { args: [[0, 1, 0], [0, 0, 1]], expected: [1, 0, 0] },
      { args: [[1, 2, 3], [4, 5, 6]], expected: [-3, 6, -3] },
      { args: [[2, 0, 0], [0, 3, 0]], expected: [0, 0, 6] },
    ],
    hint: "Follow the x, y, z formula carefully. Order matters: a x b = -(b x a).",
    solution:
      "function vec3Cross(a, b) {\n  return [\n    a[1] * b[2] - a[2] * b[1],\n    a[2] * b[0] - a[0] * b[2],\n    a[0] * b[1] - a[1] * b[0],\n  ];\n}",
  },
  {
    id: "engine-angle-between",
    title: "Angle Between Vectors (degrees)",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Vectors",
    tags: ["vector", "angle", "dot"],
    prompt:
      "Return the angle between two vec3s in DEGREES. Use <code>angle = acos( clamp(dot(a,b) / (|a|*|b|), -1, 1) )</code>, convert radians to degrees with <code>rad*180/PI</code>, and round to 4 decimals. Clamp the cosine to [-1, 1] to avoid NaN from floating point.",
    fnName: "angleBetweenDeg",
    starter:
      "function angleBetweenDeg(a, b) {\n  // return the angle in degrees rounded to 4 decimals\n}",
    tests: [
      { args: [[1, 0, 0], [0, 1, 0]], expected: 90 },
      { args: [[1, 0, 0], [1, 0, 0]], expected: 0 },
      { args: [[1, 0, 0], [-1, 0, 0]], expected: 180 },
      { args: [[1, 1, 0], [1, 0, 0]], expected: 45 },
      { args: [[1, 2, 2], [2, 0, 0]], expected: 70.5288 },
    ],
    hint: "Divide the dot product by the product of the two lengths, clamp, acos, then convert to degrees.",
    solution:
      "function angleBetweenDeg(a, b) {\n  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];\n  const la = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);\n  const lb = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);\n  let c = dot / (la * lb);\n  c = Math.max(-1, Math.min(1, c));\n  const deg = (Math.acos(c) * 180) / Math.PI;\n  return Math.round(deg * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-det2",
    title: "2x2 Determinant",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "determinant"],
    prompt:
      "A 2x2 matrix is given row-major as <code>[[a, b], [c, d]]</code>. Return its determinant <code>a*d - b*c</code>. Inputs are integers, so the answer is exact.",
    fnName: "det2",
    starter: "function det2(m) {\n  // return a number\n}",
    tests: [
      { args: [[[1, 2], [3, 4]]], expected: -2 },
      { args: [[[2, 0], [0, 2]]], expected: 4 },
      { args: [[[1, 1], [1, 1]]], expected: 0 },
      { args: [[[3, 8], [4, 6]]], expected: -14 },
    ],
    hint: "Multiply the main diagonal and subtract the product of the anti-diagonal.",
    solution:
      "function det2(m) {\n  return m[0][0] * m[1][1] - m[0][1] * m[1][0];\n}",
  },
  {
    id: "engine-mat4-identity",
    title: "4x4 Identity Matrix",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "identity"],
    prompt:
      "Return the 4x4 identity matrix as a row-major array-of-arrays: 1s on the main diagonal, 0s everywhere else. It takes no arguments.",
    fnName: "mat4Identity",
    starter:
      "function mat4Identity() {\n  // return a 4x4 array-of-arrays\n}",
    tests: [
      {
        args: [],
        expected: [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ],
      },
    ],
    hint: "Row i has a 1 at column i and 0s elsewhere.",
    solution:
      "function mat4Identity() {\n  return [\n    [1, 0, 0, 0],\n    [0, 1, 0, 0],\n    [0, 0, 1, 0],\n    [0, 0, 0, 1],\n  ];\n}",
  },
  {
    id: "engine-mat3-vec",
    title: "3x3 Matrix times Vector",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "transform", "multiply"],
    prompt:
      "A 3x3 matrix <code>m</code> is row-major <code>[[r0], [r1], [r2]]</code>. Multiply it by a column vec3 <code>v</code>: each output component is the dot product of a matrix row with <code>v</code>. Return the resulting vec3. Inputs are integers, so the result is exact.",
    fnName: "mat3Vec",
    starter: "function mat3Vec(m, v) {\n  // return [x, y, z]\n}",
    tests: [
      { args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2, 3, 4]], expected: [2, 3, 4] },
      { args: [[[2, 0, 0], [0, 2, 0], [0, 0, 2]], [1, 2, 3]], expected: [2, 4, 6] },
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 0, -1]], expected: [-2, -2, -2] },
      { args: [[[0, -1, 0], [1, 0, 0], [0, 0, 1]], [1, 0, 5]], expected: [0, 1, 5] },
    ],
    hint: "Output component i = dot(row i of m, v).",
    solution:
      "function mat3Vec(m, v) {\n  return [\n    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],\n    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],\n    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],\n  ];\n}",
  },
  {
    id: "engine-transpose3",
    title: "Transpose a 3x3 Matrix",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "transpose"],
    prompt:
      "Given a 3x3 row-major matrix <code>m</code>, return its transpose: element at <code>[i][j]</code> moves to <code>[j][i]</code>. Return a new array-of-arrays. Inputs are integers.",
    fnName: "transpose3",
    starter: "function transpose3(m) {\n  // return a 3x3 array-of-arrays\n}",
    tests: [
      {
        args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[1, 4, 7], [2, 5, 8], [3, 6, 9]],
      },
      {
        args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      },
      {
        args: [[[0, 1, 0], [0, 0, 0], [0, 0, 0]]],
        expected: [[0, 0, 0], [1, 0, 0], [0, 0, 0]],
      },
    ],
    hint: "The new row i is the old column i. The diagonal stays put.",
    solution:
      "function transpose3(m) {\n  return [\n    [m[0][0], m[1][0], m[2][0]],\n    [m[0][1], m[1][1], m[2][1]],\n    [m[0][2], m[1][2], m[2][2]],\n  ];\n}",
  },
  {
    id: "engine-translation-matrix",
    title: "Build a Translation Matrix",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "translation", "transform"],
    prompt:
      "Given a translation vec3 <code>t = [tx, ty, tz]</code>, build the 4x4 translation matrix (row-major): identity with the translation placed in the last COLUMN of the first three rows. Return it as an array-of-arrays.",
    fnName: "translationMatrix",
    starter:
      "function translationMatrix(t) {\n  // return a 4x4 array-of-arrays\n}",
    tests: [
      {
        args: [[5, 6, 7]],
        expected: [
          [1, 0, 0, 5],
          [0, 1, 0, 6],
          [0, 0, 1, 7],
          [0, 0, 0, 1],
        ],
      },
      {
        args: [[0, 0, 0]],
        expected: [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ],
      },
      {
        args: [[-1, 2, -3]],
        expected: [
          [1, 0, 0, -1],
          [0, 1, 0, 2],
          [0, 0, 1, -3],
          [0, 0, 0, 1],
        ],
      },
    ],
    hint: "Start from the identity and put tx, ty, tz in column index 3 of rows 0, 1, 2.",
    solution:
      "function translationMatrix(t) {\n  return [\n    [1, 0, 0, t[0]],\n    [0, 1, 0, t[1]],\n    [0, 0, 1, t[2]],\n    [0, 0, 0, 1],\n  ];\n}",
  },
  {
    id: "engine-mat2-mul",
    title: "Multiply Two 2x2 Matrices",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Matrices",
    tags: ["matrix", "multiply"],
    prompt:
      "Multiply two 2x2 row-major matrices <code>a</code> and <code>b</code>, returning <code>a*b</code>. Element <code>[i][j]</code> of the result is the dot product of row i of <code>a</code> with column j of <code>b</code>. Inputs are integers.",
    fnName: "mat2Mul",
    starter: "function mat2Mul(a, b) {\n  // return a 2x2 array-of-arrays\n}",
    tests: [
      { args: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [[19, 22], [43, 50]] },
      { args: [[[1, 0], [0, 1]], [[9, 8], [7, 6]]], expected: [[9, 8], [7, 6]] },
      { args: [[[2, 0], [0, 2]], [[1, 1], [1, 1]]], expected: [[2, 2], [2, 2]] },
    ],
    hint: "result[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j]. Matrix multiply is not commutative.",
    solution:
      "function mat2Mul(a, b) {\n  return [\n    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],\n    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],\n  ];\n}",
  },
  {
    id: "engine-deg-to-rad",
    title: "Degrees to Radians",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["angle", "conversion"],
    prompt:
      "Convert an angle in degrees to radians using <code>rad = deg * PI / 180</code>. Return the result rounded to 4 decimals.",
    fnName: "degToRad",
    starter: "function degToRad(deg) {\n  // return radians rounded to 4 decimals\n}",
    tests: [
      { args: [180], expected: 3.1416 },
      { args: [90], expected: 1.5708 },
      { args: [0], expected: 0 },
      { args: [45], expected: 0.7854 },
      { args: [360], expected: 6.2832 },
    ],
    hint: "Multiply by Math.PI / 180, then round.",
    solution:
      "function degToRad(deg) {\n  return Math.round((deg * Math.PI / 180) * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-clamp",
    title: "Clamp a Value",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["clamp", "range"],
    prompt:
      "Clamp <code>x</code> into the inclusive range <code>[lo, hi]</code>: return <code>lo</code> if <code>x &lt; lo</code>, <code>hi</code> if <code>x &gt; hi</code>, otherwise <code>x</code>. Inputs are exact, so no rounding is needed.",
    fnName: "clamp",
    starter: "function clamp(x, lo, hi) {\n  // return a number\n}",
    tests: [
      { args: [5, 0, 10], expected: 5 },
      { args: [-3, 0, 10], expected: 0 },
      { args: [15, 0, 10], expected: 10 },
      { args: [0.5, 0, 1], expected: 0.5 },
      { args: [7, 7, 7], expected: 7 },
    ],
    hint: "Math.max(lo, Math.min(hi, x)) does it in one line.",
    solution:
      "function clamp(x, lo, hi) {\n  return Math.max(lo, Math.min(hi, x));\n}",
  },
  {
    id: "engine-point-in-aabb",
    title: "Point Inside AABB",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["aabb", "bounds", "boolean"],
    prompt:
      "Given a point <code>p = [x, y, z]</code> and an axis-aligned bounding box defined by <code>min</code> and <code>max</code> vec3 corners, return <code>true</code> if the point is inside or on the box (inclusive on all axes), else <code>false</code>.",
    fnName: "pointInAABB",
    starter:
      "function pointInAABB(p, min, max) {\n  // return true or false\n}",
    tests: [
      { args: [[1, 1, 1], [0, 0, 0], [2, 2, 2]], expected: true },
      { args: [[3, 1, 1], [0, 0, 0], [2, 2, 2]], expected: false },
      { args: [[0, 0, 0], [0, 0, 0], [2, 2, 2]], expected: true },
      { args: [[2, 2, 2], [0, 0, 0], [2, 2, 2]], expected: true },
      { args: [[-1, 1, 1], [0, 0, 0], [2, 2, 2]], expected: false },
    ],
    hint: "The point is inside only if every axis satisfies min <= p <= max.",
    solution:
      "function pointInAABB(p, min, max) {\n  return (\n    p[0] >= min[0] && p[0] <= max[0] &&\n    p[1] >= min[1] && p[1] <= max[1] &&\n    p[2] >= min[2] && p[2] <= max[2]\n  );\n}",
  },
  {
    id: "engine-remap",
    title: "Remap a Range",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["remap", "range", "lerp"],
    prompt:
      "Linearly remap <code>x</code> from the input range <code>[inMin, inMax]</code> to the output range <code>[outMin, outMax]</code>: <code>outMin + (x - inMin) * (outMax - outMin) / (inMax - inMin)</code>. Return the result rounded to 4 decimals.",
    fnName: "remap",
    starter:
      "function remap(x, inMin, inMax, outMin, outMax) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [5, 0, 10, 0, 100], expected: 50 },
      { args: [0.5, 0, 1, -1, 1], expected: 0 },
      { args: [0, 0, 10, 0, 100], expected: 0 },
      { args: [2, 0, 4, 10, 20], expected: 15 },
      { args: [75, 0, 100, 0, 255], expected: 191.25 },
    ],
    hint: "First find the normalized position (x - inMin) / (inMax - inMin), then scale into the output range.",
    solution:
      "function remap(x, inMin, inMax, outMin, outMax) {\n  const v = outMin + ((x - inMin) * (outMax - outMin)) / (inMax - inMin);\n  return Math.round(v * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-rotate2d",
    title: "Rotate a 2D Point",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["rotation", "2d", "transform"],
    prompt:
      "Rotate a 2D point <code>p = [x, y]</code> counter-clockwise about the origin by <code>angle</code> RADIANS: <code>x' = x*cos - y*sin</code>, <code>y' = x*sin + y*cos</code>. Return <code>[x', y']</code> with each component rounded to 4 decimals.",
    fnName: "rotate2D",
    starter:
      "function rotate2D(p, angle) {\n  // return [x, y] rounded to 4 decimals\n}",
    tests: [
      { args: [[1, 0], 1.5707963267948966], expected: [0, 1] },
      { args: [[1, 0], 3.141592653589793], expected: [-1, 0] },
      { args: [[2, 0], 0.7853981633974483], expected: [1.4142, 1.4142] },
      { args: [[0, 0], 1], expected: [0, 0] },
      { args: [[3, 4], 0], expected: [3, 4] },
    ],
    hint: "Compute cos(angle) and sin(angle) once, then apply the rotation formula and round.",
    solution:
      "function rotate2D(p, angle) {\n  const c = Math.cos(angle);\n  const s = Math.sin(angle);\n  const r = (v) => Math.round(v * 1e4) / 1e4;\n  return [r(p[0] * c - p[1] * s), r(p[0] * s + p[1] * c)];\n}",
  },
  {
    id: "engine-triangle-area",
    title: "Triangle Area (2D)",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Transforms & Geometry",
    tags: ["triangle", "area", "cross"],
    prompt:
      "Given three 2D points <code>a</code>, <code>b</code>, <code>c</code>, return the area of the triangle they form using the shoelace / cross-product formula: <code>abs((bx-ax)*(cy-ay) - (cx-ax)*(by-ay)) / 2</code>. Return the result rounded to 4 decimals. A degenerate (collinear) triangle has area 0.",
    fnName: "triangleArea",
    starter:
      "function triangleArea(a, b, c) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [[0, 0], [4, 0], [0, 3]], expected: 6 },
      { args: [[0, 0], [2, 0], [0, 2]], expected: 2 },
      { args: [[0, 0], [1, 1], [2, 2]], expected: 0 },
      { args: [[1, 1], [5, 1], [1, 4]], expected: 6 },
    ],
    hint: "The 2D cross product of edge vectors (b-a) and (c-a) gives twice the signed area; take half its absolute value.",
    solution:
      "function triangleArea(a, b, c) {\n  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);\n  return Math.round((Math.abs(cross) / 2) * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-luminance",
    title: "Relative Luminance",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["color", "luminance"],
    prompt:
      "Given a linear RGB color <code>[r, g, b]</code> with components in [0, 1], return its relative luminance: <code>0.2126*r + 0.7152*g + 0.0722*b</code>. Return the result rounded to 4 decimals.",
    fnName: "luminance",
    starter: "function luminance(c) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [[1, 1, 1]], expected: 1 },
      { args: [[1, 0, 0]], expected: 0.2126 },
      { args: [[0, 1, 0]], expected: 0.7152 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [[0.5, 0.5, 0.5]], expected: 0.5 },
    ],
    hint: "Green contributes the most to perceived brightness. Weighted sum, then round.",
    solution:
      "function luminance(c) {\n  const v = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];\n  return Math.round(v * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-color-lerp",
    title: "Interpolate Two Colors",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["color", "lerp", "interpolation"],
    prompt:
      "Linearly interpolate between two RGB colors <code>a</code> and <code>b</code> by parameter <code>t</code> in [0, 1]: each channel is <code>a + (b - a) * t</code>. Return the resulting <code>[r, g, b]</code> with each channel rounded to 4 decimals.",
    fnName: "colorLerp",
    starter:
      "function colorLerp(a, b, t) {\n  // return [r, g, b] rounded to 4 decimals\n}",
    tests: [
      { args: [[0, 0, 0], [1, 1, 1], 0.5], expected: [0.5, 0.5, 0.5] },
      { args: [[1, 0, 0], [0, 0, 1], 0.25], expected: [0.75, 0, 0.25] },
      { args: [[0.2, 0.4, 0.6], [0.8, 0.6, 0.4], 0.5], expected: [0.5, 0.5, 0.5] },
      { args: [[1, 1, 1], [0, 0, 0], 0], expected: [1, 1, 1] },
    ],
    hint: "Apply lerp(a, b, t) = a + (b - a) * t per channel, then round.",
    solution:
      "function colorLerp(a, b, t) {\n  const r = (x, y) => Math.round((x + (y - x) * t) * 1e4) / 1e4;\n  return [r(a[0], b[0]), r(a[1], b[1]), r(a[2], b[2])];\n}",
  },
  {
    id: "engine-lambert",
    title: "Lambert Diffuse Term",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["lighting", "lambert", "dot"],
    prompt:
      "Compute the Lambertian diffuse term <code>max(0, dot(n, l))</code>, where <code>n</code> is the surface normal and <code>l</code> is the direction toward the light (both vec3, assumed unit length). Return the result rounded to 4 decimals. Light behind the surface yields 0.",
    fnName: "lambert",
    starter: "function lambert(n, l) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [[0, 0, 1], [0, 0, 1]], expected: 1 },
      { args: [[0, 0, 1], [0, 0, -1]], expected: 0 },
      { args: [[0, 1, 0], [0, 0, 1]], expected: 0 },
      { args: [[0.6, 0.8, 0], [1, 0, 0]], expected: 0.6 },
    ],
    hint: "Take the dot product, clamp negatives to 0 with Math.max, then round.",
    solution:
      "function lambert(n, l) {\n  const d = n[0] * l[0] + n[1] * l[1] + n[2] * l[2];\n  return Math.round(Math.max(0, d) * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-persp-divide",
    title: "Perspective Divide to NDC",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["clip", "ndc", "perspective"],
    prompt:
      "Given a clip-space coordinate <code>[x, y, z, w]</code>, perform the perspective divide to get normalized device coordinates: divide x, y, z by w. Return <code>[x/w, y/w, z/w]</code> with each component rounded to 4 decimals. Assume <code>w</code> is never 0.",
    fnName: "perspectiveDivide",
    starter:
      "function perspectiveDivide(clip) {\n  // return [x, y, z] rounded to 4 decimals\n}",
    tests: [
      { args: [[2, 4, 6, 2]], expected: [1, 2, 3] },
      { args: [[1, 1, 1, 1]], expected: [1, 1, 1] },
      { args: [[3, -6, 9, 3]], expected: [1, -2, 3] },
      { args: [[5, 10, -20, 4]], expected: [1.25, 2.5, -5] },
    ],
    hint: "Divide the first three components by the fourth (w), then round.",
    solution:
      "function perspectiveDivide(clip) {\n  const w = clip[3];\n  const r = (x) => Math.round((x / w) * 1e4) / 1e4;\n  return [r(clip[0]), r(clip[1]), r(clip[2])];\n}",
  },
  {
    id: "engine-srgb-to-linear",
    title: "sRGB to Linear",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["color", "srgb", "gamma"],
    prompt:
      "Convert a single sRGB channel value <code>c</code> in [0, 1] to linear space using the standard formula: <code>c &lt;= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4</code>. Return the result rounded to 4 decimals.",
    fnName: "srgbToLinear",
    starter:
      "function srgbToLinear(c) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [0.5], expected: 0.214 },
      { args: [0.04045], expected: 0.0031 },
      { args: [0.2], expected: 0.0331 },
    ],
    hint: "Pick the linear branch for small values and the power-curve branch otherwise, then round.",
    solution:
      "function srgbToLinear(c) {\n  const v = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;\n  return Math.round(v * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-reflect",
    title: "Reflect a Vector",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Rendering Math",
    tags: ["reflect", "specular", "vector"],
    prompt:
      "Reflect an incident vec3 <code>I</code> about a unit surface normal <code>N</code> using <code>R = I - 2*dot(I, N)*N</code>. Return <code>R</code> with each component rounded to 4 decimals.",
    fnName: "reflect",
    starter:
      "function reflect(I, N) {\n  // return [x, y, z] rounded to 4 decimals\n}",
    tests: [
      { args: [[1, -1, 0], [0, 1, 0]], expected: [1, 1, 0] },
      { args: [[0, -1, 0], [0, 1, 0]], expected: [0, 1, 0] },
      { args: [[1, 0, 0], [1, 0, 0]], expected: [-1, 0, 0] },
      { args: [[2, -3, 1], [0, 1, 0]], expected: [2, 3, 1] },
    ],
    hint: "Compute the scalar d = dot(I, N) once, then subtract 2*d*N from I component-wise.",
    solution:
      "function reflect(I, N) {\n  const d = I[0] * N[0] + I[1] * N[1] + I[2] * N[2];\n  const r = (i, n) => Math.round((i - 2 * d * n) * 1e4) / 1e4;\n  return [r(I[0], N[0]), r(I[1], N[1]), r(I[2], N[2])];\n}",
  },
  {
    id: "engine-fract",
    title: "Fractional Part",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Procedural / Physics",
    tags: ["fract", "shader"],
    prompt:
      "Return the fractional part of <code>x</code>, defined as <code>x - floor(x)</code> (this matches GLSL <code>fract</code>). For negative inputs this stays in [0, 1): e.g. <code>fract(-0.25) = 0.75</code>. Return the result rounded to 4 decimals.",
    fnName: "fract",
    starter: "function fract(x) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [3.75], expected: 0.75 },
      { args: [0.25], expected: 0.25 },
      { args: [5], expected: 0 },
      { args: [-0.25], expected: 0.75 },
    ],
    hint: "Subtract Math.floor(x) from x. Math.floor rounds toward negative infinity, which handles negatives correctly.",
    solution:
      "function fract(x) {\n  return Math.round((x - Math.floor(x)) * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-euler-integrate",
    title: "Euler Integrate Position",
    difficulty: "Easy",
    practiceTrack: "engine",
    topic: "Procedural / Physics",
    tags: ["physics", "integration", "euler"],
    prompt:
      "Perform one explicit Euler step: given a position vec3 <code>pos</code>, a velocity vec3 <code>vel</code>, and a timestep <code>dt</code>, return the new position <code>pos + vel*dt</code> component-wise. Return each component rounded to 4 decimals.",
    fnName: "eulerIntegrate",
    starter:
      "function eulerIntegrate(pos, vel, dt) {\n  // return [x, y, z] rounded to 4 decimals\n}",
    tests: [
      { args: [[0, 0, 0], [1, 2, 3], 1], expected: [1, 2, 3] },
      { args: [[1, 1, 1], [0, 0, 0], 0.5], expected: [1, 1, 1] },
      { args: [[0, 10, 0], [0, -9.8, 0], 0.1], expected: [0, 9.02, 0] },
      { args: [[2, 3, 4], [1, 1, 1], 2], expected: [4, 5, 6] },
    ],
    hint: "Each new component is old position plus velocity times dt.",
    solution:
      "function eulerIntegrate(pos, vel, dt) {\n  const r = (p, v) => Math.round((p + v * dt) * 1e4) / 1e4;\n  return [r(pos[0], vel[0]), r(pos[1], vel[1]), r(pos[2], vel[2])];\n}",
  },
  {
    id: "engine-smoothstep",
    title: "Smoothstep",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Procedural / Physics",
    tags: ["smoothstep", "shader", "interpolation"],
    prompt:
      "Implement GLSL smoothstep(e0, e1, x): first <code>t = clamp((x - e0) / (e1 - e0), 0, 1)</code>, then return <code>t*t*(3 - 2*t)</code>. Return the result rounded to 4 decimals.",
    fnName: "smoothstep",
    starter:
      "function smoothstep(e0, e1, x) {\n  // return a number rounded to 4 decimals\n}",
    tests: [
      { args: [0, 1, 0.5], expected: 0.5 },
      { args: [0, 1, 0], expected: 0 },
      { args: [0, 1, 1], expected: 1 },
      { args: [0, 1, -1], expected: 0 },
      { args: [0, 10, 5], expected: 0.5 },
      { args: [0, 1, 0.25], expected: 0.1563 },
    ],
    hint: "Clamp the normalized t into [0, 1] BEFORE applying the cubic polynomial.",
    solution:
      "function smoothstep(e0, e1, x) {\n  let t = (x - e0) / (e1 - e0);\n  t = Math.max(0, Math.min(1, t));\n  return Math.round(t * t * (3 - 2 * t) * 1e4) / 1e4;\n}",
  },
  {
    id: "engine-clamp-magnitude",
    title: "Clamp Vector Magnitude",
    difficulty: "Medium",
    practiceTrack: "engine",
    topic: "Procedural / Physics",
    tags: ["vector", "clamp", "physics"],
    prompt:
      "Limit a vec3 <code>v</code> so its length never exceeds <code>maxLen</code>. If <code>|v| &lt;= maxLen</code> return <code>v</code> unchanged; otherwise scale it to length <code>maxLen</code> (keep direction): each component becomes <code>v / |v| * maxLen</code>. Return each component rounded to 4 decimals. The zero vector stays zero.",
    fnName: "clampMagnitude",
    starter:
      "function clampMagnitude(v, maxLen) {\n  // return [x, y, z] rounded to 4 decimals\n}",
    tests: [
      { args: [[3, 4, 0], 10], expected: [3, 4, 0] },
      { args: [[3, 4, 0], 5], expected: [3, 4, 0] },
      { args: [[6, 8, 0], 5], expected: [3, 4, 0] },
      { args: [[0, 0, 0], 5], expected: [0, 0, 0] },
      { args: [[1, 2, 2], 1.5], expected: [0.5, 1, 1] },
    ],
    hint: "Compute the length; if it is within maxLen just round and return, otherwise rescale by maxLen/length.",
    solution:
      "function clampMagnitude(v, maxLen) {\n  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);\n  const r = (x) => Math.round(x * 1e4) / 1e4;\n  if (l <= maxLen) return [r(v[0]), r(v[1]), r(v[2])];\n  const s = maxLen / l;\n  return [r(v[0] * s), r(v[1] * s), r(v[2] * s)];\n}",
  },
  {
    id: "engine-hash-noise",
    title: "1D Hash Noise",
    difficulty: "Hard",
    practiceTrack: "engine",
    topic: "Procedural / Physics",
    tags: ["noise", "hash", "procedural"],
    prompt:
      "Implement the classic shader one-liner pseudo-random hash used for value noise. Given an integer seed <code>n</code>, return <code>fract(sin(n) * 43758.5453123)</code>, where <code>fract(v) = v - floor(v)</code> and <code>sin</code> takes radians. This is fully deterministic and lands in [0, 1). Return the result rounded to 4 decimals.",
    fnName: "hashNoise",
    starter:
      "function hashNoise(n) {\n  // return a number in [0, 1) rounded to 4 decimals\n}",
    tests: [
      { args: [0], expected: 0 },
      { args: [1], expected: 0.5462 },
      { args: [2], expected: 0.5327 },
      { args: [42], expected: 0.3503 },
      { args: [100], expected: 0.1761 },
    ],
    hint: "Multiply sin(n) by the big constant, then take the fractional part with x - Math.floor(x), then round.",
    solution:
      "function hashNoise(n) {\n  const v = Math.sin(n) * 43758.5453123;\n  const f = v - Math.floor(v);\n  return Math.round(f * 1e4) / 1e4;\n}",
  },
];
