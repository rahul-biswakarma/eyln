export type Vec2 = [
    number,
    number
];
export type Vec3 = [
    number,
    number,
    number
];
export type Vec4 = [
    number,
    number,
    number,
    number
];
export const v3 = (x: number, y: number, z: number): Vec3 => [x, y, z];
export function add(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
export function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function scale(a: Vec3, s: number): Vec3 {
    return [a[0] * s, a[1] * s, a[2] * s];
}
export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}
export function length(a: Vec3): number {
    return Math.hypot(a[0], a[1], a[2]);
}
export function normalize(a: Vec3): Vec3 {
    const l = length(a);
    return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
}
export function dot2(a: Vec2, b: Vec2): number {
    return a[0] * b[0] + a[1] * b[1];
}
export function cross2(a: Vec2, b: Vec2): number {
    return a[0] * b[1] - a[1] * b[0];
}
export function len2(a: Vec2): number {
    return Math.hypot(a[0], a[1]);
}
export function angleBetween(a: Vec2, b: Vec2): number {
    const la = len2(a), lb = len2(b);
    if (la < 1e-9 || lb < 1e-9)
        return 0;
    return Math.acos(Math.max(-1, Math.min(1, dot2(a, b) / (la * lb))));
}
export const DEG = 180 / Math.PI;
export const RAD = Math.PI / 180;
