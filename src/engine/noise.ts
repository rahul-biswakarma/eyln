// Value, Perlin, and Simplex-flavored noise + fBm. Deterministic (seedable),
// so the browser terrain preview and any shown Odin port can agree.

function hash2(ix: number, iy: number, seed: number): number {
  // Integer hash -> [0,1). Cheap but well-distributed enough for teaching.
  let h = ix * 374761393 + iy * 668265263 + seed * 1442695040;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return (h & 0xffffff) / 0x1000000;
}

function fade(t: number): number {
  // Perlin's 6t^5 - 15t^4 + 10t^3 smootherstep.
  return t * t * t * (t * (t * 6 - 15) + 10);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Value noise in [0,1]. */
export function valueNoise(x: number, y: number, seed = 0): number {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = fade(x - x0), fy = fade(y - y0);
  const v00 = hash2(x0, y0, seed), v10 = hash2(x0 + 1, y0, seed);
  const v01 = hash2(x0, y0 + 1, seed), v11 = hash2(x0 + 1, y0 + 1, seed);
  return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
}

function grad(ix: number, iy: number, seed: number): [number, number] {
  const a = hash2(ix, iy, seed) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)];
}

/** Classic Perlin gradient noise, remapped to [0,1]. */
export function perlin(x: number, y: number, seed = 0): number {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const dx = x - x0, dy = y - y0;
  const dot00 = grad(x0, y0, seed)[0] * dx + grad(x0, y0, seed)[1] * dy;
  const dot10 = grad(x0 + 1, y0, seed)[0] * (dx - 1) + grad(x0 + 1, y0, seed)[1] * dy;
  const dot01 = grad(x0, y0 + 1, seed)[0] * dx + grad(x0, y0 + 1, seed)[1] * (dy - 1);
  const dot11 = grad(x0 + 1, y0 + 1, seed)[0] * (dx - 1) + grad(x0 + 1, y0 + 1, seed)[1] * (dy - 1);
  const u = fade(dx), v = fade(dy);
  const n = lerp(lerp(dot00, dot10, u), lerp(dot01, dot11, u), v);
  return n * 0.5 + 0.5; // [-1,1] -> [0,1]
}

// Simplex-2D. Compact, standard skew/unskew constants.
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
export function simplex(xin: number, yin: number, seed = 0): number {
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s), j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const x0 = xin - (i - t), y0 = yin - (j - t);
  const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;

  const contrib = (dx: number, dy: number, gx: number, gy: number) => {
    let tt = 0.5 - dx * dx - dy * dy;
    if (tt < 0) return 0;
    tt *= tt;
    const g = grad(gx, gy, seed);
    return tt * tt * (g[0] * dx + g[1] * dy);
  };
  const n = contrib(x0, y0, i, j) + contrib(x1, y1, i + i1, j + j1) + contrib(x2, y2, i + 1, j + 1);
  return Math.max(0, Math.min(1, 70 * n * 0.5 + 0.5)); // scale + remap to [0,1]
}

export type NoiseKind = "value" | "perlin" | "simplex";

export function sample(kind: NoiseKind, x: number, y: number, seed = 0): number {
  switch (kind) {
    case "value": return valueNoise(x, y, seed);
    case "perlin": return perlin(x, y, seed);
    case "simplex": return simplex(x, y, seed);
  }
}

export interface FbmOpts {
  kind: NoiseKind;
  octaves: number;
  frequency: number;
  lacunarity: number; // frequency multiplier per octave (~2)
  gain: number;       // amplitude multiplier per octave (~0.5)
  ridged?: boolean;
  seed?: number;
}

/** Fractal Brownian motion in [0,1]. */
export function fbm(x: number, y: number, o: FbmOpts): number {
  let freq = o.frequency, amp = 1, sum = 0, norm = 0;
  for (let i = 0; i < o.octaves; i++) {
    let n = sample(o.kind, x * freq, y * freq, (o.seed ?? 0) + i * 101);
    if (o.ridged) n = 1 - Math.abs(n * 2 - 1); // fold to ridges
    sum += n * amp;
    norm += amp;
    amp *= o.gain;
    freq *= o.lacunarity;
  }
  return norm > 0 ? sum / norm : 0;
}
