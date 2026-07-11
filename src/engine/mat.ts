import type { Vec3 } from "./vec";
import { cross, normalize, sub, dot } from "./vec";

export type Mat4 = number[]; 

export function identity(): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function mul(a: Mat4, b: Mat4): Mat4 {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
}

export function mulVec4(m: Mat4, v: [number, number, number, number]): [number, number, number, number] {
  const o: [number, number, number, number] = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) {
    o[r] = m[0 * 4 + r] * v[0] + m[1 * 4 + r] * v[1] + m[2 * 4 + r] * v[2] + m[3 * 4 + r] * v[3];
  }
  return o;
}

export function translate(t: Vec3): Mat4 {
  const m = identity();
  m[12] = t[0]; m[13] = t[1]; m[14] = t[2];
  return m;
}

export function scaling(s: Vec3): Mat4 {
  const m = identity();
  m[0] = s[0]; m[5] = s[1]; m[10] = s[2];
  return m;
}

export function rotateY(a: number): Mat4 {
  const c = Math.cos(a), s = Math.sin(a);
  const m = identity();
  m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
  return m;
}

export function rotateX(a: number): Mat4 {
  const c = Math.cos(a), s = Math.sin(a);
  const m = identity();
  m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
  return m;
}

export function rotateZ(a: number): Mat4 {
  const c = Math.cos(a), s = Math.sin(a);
  const m = identity();
  m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
  return m;
}

export function lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const f = normalize(sub(center, eye)); 
  const s = normalize(cross(f, up));     
  const u = cross(s, f);                 
  return [
    s[0], u[0], -f[0], 0,
    s[1], u[1], -f[1], 0,
    s[2], u[2], -f[2], 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
  ];
}

export function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
  const t = 1 / Math.tan(fovy / 2);
  const m = new Array(16).fill(0);
  m[0] = t / aspect;
  m[5] = t;
  m[10] = far / (near - far);
  m[11] = -1;
  m[14] = (near * far) / (near - far);
  return m;
}

export function toRows(m: Mat4): number[][] {
  const rows: number[][] = [];
  for (let r = 0; r < 4; r++) rows.push([m[r], m[4 + r], m[8 + r], m[12 + r]]);
  return rows;
}
