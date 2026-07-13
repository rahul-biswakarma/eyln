export type P2 = [
    number,
    number
];
export function catmullRom(p0: P2, p1: P2, p2: P2, p3: P2, t: number): P2 {
    const t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}
export function catmullRomChain(pts: P2[], stepsPerSeg = 16): P2[] {
    if (pts.length < 2)
        return pts.slice();
    const out: P2[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        for (let s = 0; s < stepsPerSeg; s++) {
            out.push(catmullRom(p0, p1, p2, p3, s / stepsPerSeg));
        }
    }
    out.push(pts[pts.length - 1]);
    return out;
}
export function bezier(p0: P2, p1: P2, p2: P2, p3: P2, t: number): P2 {
    const u = 1 - t;
    const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
    return [
        b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
        b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1],
    ];
}
export function arcLength(poly: P2[]): number {
    let L = 0;
    for (let i = 1; i < poly.length; i++) {
        L += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
    }
    return L;
}
export interface Ribbon {
    strip: P2[];
    left: P2[];
    right: P2[];
}
export function extrudeRibbon(center: P2[], halfWidth: number): Ribbon {
    const left: P2[] = [];
    const right: P2[] = [];
    const n = center.length;
    for (let i = 0; i < n; i++) {
        const prev = center[Math.max(0, i - 1)];
        const next = center[Math.min(n - 1, i + 1)];
        let tx = next[0] - prev[0];
        let ty = next[1] - prev[1];
        const len = Math.hypot(tx, ty) || 1;
        tx /= len;
        ty /= len;
        const nx = -ty, ny = tx;
        left.push([center[i][0] + nx * halfWidth, center[i][1] + ny * halfWidth]);
        right.push([center[i][0] - nx * halfWidth, center[i][1] - ny * halfWidth]);
    }
    const strip: P2[] = [];
    for (let i = 0; i < n; i++) {
        strip.push(left[i], right[i]);
    }
    return { strip, left, right };
}
