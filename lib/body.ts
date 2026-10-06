/**
 * Turns a solved skeleton into shaded, anatomically shaped SVG paths.
 *
 * Limbs are tapered capsules with separate front/back muscle profiles (calves bulge behind the shin,
 * quads in front of the thigh), the torso follows a curved spine with chest, waist and glute contours,
 * and clothing is drawn as slightly inflated slices of the same shapes so it hugs the body.
 */
import { GROUND, L, Pt, Skeleton } from "./figure";

export type Gender = "male" | "female";
export type View = "side" | "front";

export type Gradient = { x1: number; y1: number; x2: number; y2: number; stops: [number, string][] };
export type Shape = { d: string; fill: string; opacity?: number; stroke?: string; strokeWidth?: number; grad?: Gradient };

/* ---------------- Vector helpers ---------------- */

const v = (x: number, y: number): Pt => ({ x, y });
const plus = (a: Pt, b: Pt): Pt => v(a.x + b.x, a.y + b.y);
const minus = (a: Pt, b: Pt): Pt => v(a.x - b.x, a.y - b.y);
const times = (a: Pt, k: number): Pt => v(a.x * k, a.y * k);
const length = (a: Pt) => Math.hypot(a.x, a.y);
const unit = (a: Pt): Pt => {
  const l = length(a) || 1;
  return v(a.x / l, a.y / l);
};
/** Rotate -90deg on screen: for a limb pointing down this is "forward" (the figure faces right). */
const frontOf = (d: Pt): Pt => v(d.y, -d.x);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Smooth closed path through points (Catmull-Rom converted to cubic Beziers). */
export function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = v(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6);
    const c2 = v(p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6);
    d += `C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d + "Z";
}

/* ---------------- Profiles ---------------- */

type Curve = [number, number][]; // [position 0..1, radius]

function sample(curve: Curve, s: number): number {
  if (s <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    const [s1, r1v] = curve[i];
    if (s <= s1) {
      const [s0, r0] = curve[i - 1];
      const t = (s - s0) / (s1 - s0);
      const e = 0.5 - Math.cos(Math.PI * t) / 2; // smooth between control points
      return r0 + (r1v - r0) * e;
    }
  }
  return curve[curve.length - 1][1];
}

type LimbProfile = { front: Curve; back: Curve };

const PROFILES: Record<Gender, { thigh: LimbProfile; shin: LimbProfile; upperArm: LimbProfile; forearm: LimbProfile; neck: number }> = {
  male: {
    thigh: { front: [[0, 7.4], [0.3, 7.2], [0.75, 5.6], [1, 4.9]], back: [[0, 7.6], [0.35, 6.6], [1, 4.8]] },
    shin: { front: [[0, 4.6], [0.3, 4.3], [1, 2.9]], back: [[0, 4.7], [0.22, 5.9], [0.55, 4.4], [1, 3.0]] },
    upperArm: { front: [[0, 5.0], [0.45, 4.9], [1, 3.5]], back: [[0, 5.0], [0.4, 4.6], [1, 3.4]] },
    forearm: { front: [[0, 3.6], [0.25, 4.1], [1, 2.6]], back: [[0, 3.5], [0.3, 3.7], [1, 2.5]] },
    neck: 3.7,
  },
  female: {
    thigh: { front: [[0, 7.6], [0.3, 7.0], [0.75, 5.3], [1, 4.5]], back: [[0, 8.2], [0.3, 6.9], [1, 4.5]] },
    shin: { front: [[0, 4.3], [0.3, 4.0], [1, 2.6]], back: [[0, 4.4], [0.22, 5.4], [0.55, 4.0], [1, 2.7]] },
    upperArm: { front: [[0, 4.2], [0.45, 3.9], [1, 3.0]], back: [[0, 4.3], [0.4, 4.0], [1, 3.0]] },
    forearm: { front: [[0, 3.1], [0.25, 3.4], [1, 2.3]], back: [[0, 3.0], [0.3, 3.1], [1, 2.2]] },
    neck: 3.1,
  },
};

/**
 * Side-view torso depth profile along the spine (s: -0.22 = bottom of the pelvis, 1 = shoulder joint).
 * front = chest/belly side, back = spine/glute side.
 */
const TORSO_SIDE: Record<Gender, { front: Curve; back: Curve }> = {
  male: {
    front: [[-0.22, 3.0], [-0.12, 6.6], [0.0, 7.6], [0.25, 7.2], [0.48, 7.0], [0.66, 8.8], [0.8, 9.8], [0.93, 8.2], [1.02, 6.0], [1.1, 2.5]],
    back: [[-0.22, 4.5], [-0.12, 8.8], [0.0, 9.8], [0.2, 8.4], [0.45, 7.0], [0.65, 7.8], [0.82, 8.8], [0.95, 8.6], [1.04, 6.4], [1.1, 3.0]],
  },
  female: {
    front: [[-0.22, 3.0], [-0.12, 6.2], [0.0, 7.0], [0.25, 6.4], [0.48, 5.9], [0.62, 6.6], [0.73, 9.6], [0.82, 9.2], [0.92, 6.6], [1.02, 5.2], [1.1, 2.3]],
    back: [[-0.22, 5.0], [-0.12, 9.4], [0.0, 10.4], [0.2, 8.6], [0.45, 6.3], [0.65, 6.8], [0.82, 7.6], [0.95, 7.6], [1.04, 5.8], [1.1, 2.8]],
  },
};

/** Front-view half widths along the spine. */
const TORSO_FRONT: Record<Gender, Curve> = {
  male: [[-0.24, 6], [-0.14, 11.5], [0.02, 12.2], [0.3, 11.0], [0.5, 10.6], [0.7, 12.4], [0.86, 14.6], [0.98, 14.4], [1.06, 9.5], [1.12, 4.5]],
  female: [[-0.24, 6], [-0.14, 12.2], [0.02, 13.2], [0.3, 10.8], [0.5, 8.9], [0.7, 10.6], [0.86, 12.2], [0.98, 11.8], [1.06, 8], [1.12, 4]],
};

/* ---------------- Palettes ---------------- */

type Palette = {
  skin: string; skinShade: string; hair: string; hairHi: string; top: string; topShade: string;
  bottom: string; bottomShade: string; shoe: string; shoeShade: string; sole: string; sock: string; lip: string;
};

export const PALETTES: Record<Gender, Palette> = {
  male: {
    skin: "#d99a72", skinShade: "#b97a55", hair: "#2a221d", hairHi: "#4a3b31", top: "#4f8cff", topShade: "#3a6ed6",
    bottom: "#2f3a4c", bottomShade: "#232c3a", shoe: "#f2f4f8", shoeShade: "#c9ced8", sole: "#b8f34a", sock: "#e9edf3", lip: "#a8644a",
  },
  female: {
    skin: "#eebd96", skinShade: "#d39b74", hair: "#5a321f", hairHi: "#7c4a30", top: "#ff6b8b", topShade: "#e04d70",
    bottom: "#6a5cff", bottomShade: "#5244d8", shoe: "#f2f4f8", shoeShade: "#c9ced8", sole: "#ff6b8b", sock: "#f2f4f8", lip: "#c4626a",
  },
};

/** Darken a hex colour toward the background for limbs on the far side of the body. */
function far(hex: string, k = 0.32) {
  const n = parseInt(hex.slice(1), 16);
  const bg = [10, 14, 19];
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x, i) => Math.round(x + (bg[i] - x) * k));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/** Mix a hex colour toward white (k > 0) or black (k < 0). */
function tone(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const target = k > 0 ? 255 : 0;
  const a = Math.abs(k);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => Math.round(x + (target - x) * a));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/** Cylindrical shading: a gradient across the form, lit edge to shadowed edge. */
function shadeAcross(center: Pt, normal: Pt, halfWidth: number, base: string, strength = 1): Gradient {
  const lit = normal.x * LIGHT.x + normal.y * LIGHT.y > 0 ? normal : times(normal, -1);
  const a = plus(center, times(lit, halfWidth));
  const b = plus(center, times(lit, -halfWidth));
  return {
    x1: r1(a.x), y1: r1(a.y), x2: r1(b.x), y2: r1(b.y),
    stops: [[0, tone(base, 0.16 * strength)], [0.28, tone(base, 0.05 * strength)], [0.62, base], [1, tone(base, -0.26 * strength)]],
  };
}

/* ---------------- Limbs ---------------- */

/** Light comes from the upper left; the side of a limb facing it gets a highlight, the other a shadow. */
const LIGHT = unit(v(-0.45, -0.89));

function capsule(a: Pt, b: Pt, front: (s: number) => number, back: (s: number) => number, from = 0, to = 1, capStart = true, capEnd = true): Pt[] {
  const axis = minus(b, a);
  const len = length(axis);
  const d = unit(axis);
  const n = frontOf(d);
  const at = (s: number, off: number) => plus(plus(a, times(d, len * s)), times(n, off));
  const steps = 7;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = from + ((to - from) * i) / steps;
    pts.push(at(s, front(s)));
  }
  const cap = (s: number, sign: 1 | -1, round: boolean) => {
    const f = front(s);
    const bk = back(s);
    const r = (f - bk) / 2;
    const center = at(s, (f + bk) / 2);
    const out: Pt[] = [];
    for (let k = 1; k < 4; k++) {
      const th = (Math.PI * k) / 4;
      const along = round ? r * Math.sin(th) : r * 0.12 * Math.sin(th);
      out.push(plus(plus(center, times(n, sign * r * Math.cos(th))), times(d, sign * along)));
    }
    return out;
  };
  pts.push(...cap(to, 1, capEnd));
  for (let i = steps; i >= 0; i--) {
    const s = from + ((to - from) * i) / steps;
    pts.push(at(s, back(s)));
  }
  pts.push(...cap(from, -1, capStart));
  return pts;
}

function limbShapes(
  a: Pt,
  b: Pt,
  prof: LimbProfile,
  fill: string,
  opts: { from?: number; to?: number; inflate?: number; shade?: boolean; capStart?: boolean; capEnd?: boolean; symmetric?: boolean } = {},
): Shape[] {
  const { from = 0, to = 1, inflate = 0, shade = true, capStart = true, capEnd = true, symmetric = false } = opts;
  const fr = (s: number) => (symmetric ? (sample(prof.front, s) + sample(prof.back, s)) / 2 : sample(prof.front, s)) + inflate;
  const bk = (s: number) => -((symmetric ? (sample(prof.front, s) + sample(prof.back, s)) / 2 : sample(prof.back, s)) + inflate);
  const d = smoothClosed(capsule(a, b, fr, bk, from, to, capStart, capEnd));
  if (!shade) return [{ d, fill }];
  const mid = (from + to) / 2;
  const axis = minus(b, a);
  const n = frontOf(unit(axis));
  const center = plus(plus(a, times(axis, mid)), times(n, (fr(mid) + bk(mid)) / 2));
  return [{ d, fill, grad: shadeAcross(center, n, (fr(mid) - bk(mid)) / 2, fill) }];
}

/* ---------------- Torso ---------------- */

function spine(sk: Skeleton) {
  const H = sk.hip;
  const S = sk.shoulder;
  const C = minus(times(sk.mid, 2), times(plus(H, S), 0.5)); // control point so the curve passes through mid
  const point = (u: number): Pt => {
    if (u < 0) return plus(H, times(tangent(0), u * (L.pelvis + L.chest)));
    if (u > 1) return plus(S, times(tangent(1), (u - 1) * (L.pelvis + L.chest)));
    const a = (1 - u) * (1 - u);
    const b = 2 * u * (1 - u);
    const c = u * u;
    return v(a * H.x + b * C.x + c * S.x, a * H.y + b * C.y + c * S.y);
  };
  function tangent(u: number): Pt {
    const uu = Math.min(1, Math.max(0, u));
    return unit(plus(times(minus(C, H), 2 * (1 - uu)), times(minus(S, C), 2 * uu)));
  }
  return { point, tangent };
}

function torsoPoints(sk: Skeleton, front: (s: number) => number, back: (s: number) => number, from: number, to: number, steps = 16): Pt[] {
  const sp = spine(sk);
  const pts: Pt[] = [];
  const edge = (s: number, off: number) => plus(sp.point(s), times(frontOf2(sp.tangent(s)), off));
  const across = (s: number, reverse: boolean) => {
    // Points along a cut end keep the spline from overshooting at the corners.
    for (const k of reverse ? [0.25, 0.5, 0.75] : [0.75, 0.5, 0.25]) pts.push(edge(s, front(s) * k - back(s) * (1 - k)));
  };
  for (let i = 0; i <= steps; i++) {
    const s = from + ((to - from) * i) / steps;
    pts.push(edge(s, front(s)));
  }
  across(to, false);
  for (let i = steps; i >= 0; i--) {
    const s = from + ((to - from) * i) / steps;
    pts.push(edge(s, -back(s)));
  }
  across(from, true);
  return pts;
}
/** For the spine (pointing up toward the head), "front" is rotated +90deg: chest side when facing right. */
const frontOf2 = (t: Pt): Pt => v(-t.y, t.x);

/* ---------------- Head ---------------- */

function headShapes(sk: Skeleton, c: Palette, gender: Gender, view: View, tailTip: Pt | null, farTone: boolean): Shape[] {
  const female = gender === "female";
  const r = female ? L.headR * 0.96 : L.headR;
  const crown = sk.headDir;
  const face = v(-crown.y, crown.x);
  const H = sk.head;
  const at = (phi: number, rr: number): Pt => {
    const a = (phi * Math.PI) / 180;
    return plus(H, plus(times(crown, rr * Math.cos(a)), times(face, rr * Math.sin(a))));
  };
  const out: Shape[] = [];
  const skin = farTone ? far(c.skin) : c.skin;

  if (view === "front") {
    const down = times(crown, -1);
    const right = face; // in front view "face" points to the viewer's right
    const P = (x: number, y: number) => plus(H, plus(times(right, x * r), times(down, y * r)));
    // Hair behind (female long hair)
    if (female) out.push({ d: smoothClosed([P(-1.05, -0.3), P(-1.08, 0.7), P(-0.8, 1.15), P(0.8, 1.15), P(1.08, 0.7), P(1.05, -0.3), P(0.6, -1.05), P(-0.6, -1.05)]), fill: c.hair });
    // Ears
    out.push({ d: smoothClosed([P(-1.02, -0.05), P(-1.2, 0.05), P(-1.15, 0.38), P(-0.95, 0.42)]), fill: c.skinShade });
    out.push({ d: smoothClosed([P(1.02, -0.05), P(1.2, 0.05), P(1.15, 0.38), P(0.95, 0.42)]), fill: c.skinShade });
    // Face: rounded jaw, narrower for women
    const jaw = female ? 0.62 : 0.72;
    out.push({ d: smoothClosed([P(0, -1.02), P(0.78, -0.82), P(0.98, -0.15), P(0.92, 0.45), P(jaw, 0.92), P(0, 1.12), P(-jaw, 0.92), P(-0.92, 0.45), P(-0.98, -0.15), P(-0.78, -0.82)]), fill: skin });
    out.push({ d: smoothClosed([P(0.55, -0.2), P(0.95, -0.1), P(0.88, 0.5), P(jaw, 0.9), P(0.35, 1.0), P(0.6, 0.4)]), fill: "#000", opacity: 0.08 });
    // Hair cap
    if (female) {
      out.push({ d: smoothClosed([P(-1.04, 0.1), P(-1.02, -0.55), P(-0.6, -1.05), P(0, -1.14), P(0.6, -1.05), P(1.02, -0.55), P(1.04, 0.1), P(0.86, -0.32), P(0.15, -0.66), P(-0.05, -0.5), P(-0.86, -0.32)]), fill: c.hair });
    } else {
      out.push({ d: smoothClosed([P(-0.98, -0.12), P(-0.95, -0.6), P(-0.55, -1.02), P(0, -1.12), P(0.55, -1.02), P(0.95, -0.6), P(0.98, -0.12), P(0.8, -0.5), P(0, -0.66), P(-0.8, -0.5)]), fill: c.hair });
    }
    // Eyes, brows, nose, mouth
    for (const sx of [-1, 1]) {
      out.push({ d: smoothClosed([P(sx * 0.28, 0.06), P(sx * 0.4, 0.0), P(sx * 0.52, 0.06), P(sx * 0.4, 0.13)]), fill: "#1b1b22" });
      out.push({ d: `M${r1(P(sx * 0.2, -0.17).x)} ${r1(P(sx * 0.2, -0.17).y)}Q${r1(P(sx * 0.4, -0.26).x)} ${r1(P(sx * 0.4, -0.26).y)} ${r1(P(sx * 0.58, -0.16).x)} ${r1(P(sx * 0.58, -0.16).y)}`, fill: "none", stroke: c.hair, strokeWidth: 0.9 });
    }
    out.push({ d: `M${r1(P(0.02, 0.15).x)} ${r1(P(0.02, 0.15).y)}Q${r1(P(0.12, 0.42).x)} ${r1(P(0.12, 0.42).y)} ${r1(P(-0.06, 0.46).x)} ${r1(P(-0.06, 0.46).y)}`, fill: "none", stroke: c.skinShade, strokeWidth: 0.8 });
    out.push({ d: `M${r1(P(-0.22, 0.68).x)} ${r1(P(-0.22, 0.68).y)}Q${r1(P(0, 0.78).x)} ${r1(P(0, 0.78).y)} ${r1(P(0.22, 0.68).x)} ${r1(P(0.22, 0.68).y)}`, fill: "none", stroke: c.lip, strokeWidth: 0.9 });
    return out;
  }

  // ---- Side view ----
  // Ponytail first so the head overlaps its base.
  if (female && tailTip) {
    const tie = at(-112, r * 0.92);
    const ctrl = plus(tie, times(face, -5));
    const pts: Pt[] = [];
    const left: Pt[] = [];
    const right: Pt[] = [];
    const N = 8;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const a = (1 - u) * (1 - u);
      const b = 2 * u * (1 - u);
      const cc = u * u;
      pts.push(v(a * tie.x + b * ctrl.x + cc * tailTip.x, a * tie.y + b * ctrl.y + cc * tailTip.y));
    }
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const q = pts[Math.min(N, i + 1)];
      const o = pts[Math.max(0, i - 1)];
      const n = frontOf(unit(minus(q, o)));
      const w = 3.1 * (1 - i / N) + 0.7 + (i > 1 && i < 5 ? 0.6 : 0);
      left.push(plus(p, times(n, w)));
      right.push(plus(p, times(n, -w)));
    }
    out.push({ d: smoothClosed([...left, ...right.reverse()]), fill: c.hair });
  }

  // Skull + face profile (forehead, nose, lips, chin, jaw)
  out.push({
    d: smoothClosed([
      at(0, r), at(35, r), at(68, r * 1.0), at(84, r * 1.03), at(96, r * 1.17), at(103, r * 1.03), at(112, r * 1.04), at(122, r * 1.0),
      at(136, r * 1.07), at(152, r * 0.98), at(172, r * 0.72), at(-160, r * 0.78), at(-120, r), at(-80, r), at(-40, r),
    ]),
    fill: skin,
  });
  // Ear
  const ear = plus(plus(H, times(face, -r * 0.12)), times(crown, -r * 0.08));
  out.push({ d: smoothClosed([plus(ear, times(crown, r * 0.3)), plus(ear, times(face, r * 0.18)), plus(ear, times(crown, -r * 0.3)), plus(ear, times(face, -r * 0.17))]), fill: farTone ? far(c.skinShade) : c.skinShade });
  // Hair
  if (female) {
    out.push({ d: smoothClosed([at(62, r * 1.08), at(30, r * 1.13), at(0, r * 1.14), at(-50, r * 1.13), at(-100, r * 1.1), at(-135, r * 1.02), at(-150, r * 0.8), at(-112, r * 0.45), at(-40, r * 0.25), at(30, r * 0.62), at(55, r * 0.92)]), fill: c.hair });
    out.push({ d: smoothClosed([at(20, r * 1.08), at(-20, r * 1.1), at(-55, r * 1.06), at(-30, r * 0.85), at(10, r * 0.9)]), fill: c.hairHi, opacity: 0.7 });
    const tie = at(-112, r * 0.92);
    out.push({ d: smoothClosed([plus(tie, times(crown, 2.2)), plus(tie, times(face, -1.8)), plus(tie, times(crown, -2.2)), plus(tie, times(face, 1.6))]), fill: c.top });
  } else {
    out.push({ d: smoothClosed([at(66, r * 1.06), at(35, r * 1.12), at(0, r * 1.13), at(-50, r * 1.1), at(-100, r * 1.05), at(-128, r * 0.98), at(-128, r * 0.7), at(-95, r * 0.38), at(-35, r * 0.4), at(30, r * 0.7), at(58, r * 0.9)]), fill: c.hair });
    out.push({ d: smoothClosed([at(25, r * 1.06), at(-10, r * 1.09), at(-45, r * 1.05), at(-20, r * 0.88), at(15, r * 0.9)]), fill: c.hairHi, opacity: 0.6 });
  }
  // Eye, brow and mouth
  const eye = plus(plus(H, times(face, r * 0.62)), times(crown, r * 0.1));
  out.push({ d: smoothClosed([plus(eye, times(face, -1.0)), plus(eye, times(crown, 0.7)), plus(eye, times(face, 0.9)), plus(eye, times(crown, -0.6))]), fill: "#1b1b22" });
  const b1 = plus(plus(H, times(face, r * 0.42)), times(crown, r * 0.32));
  const b2 = plus(plus(H, times(face, r * 0.84)), times(crown, r * 0.36));
  out.push({ d: `M${r1(b1.x)} ${r1(b1.y)}L${r1(b2.x)} ${r1(b2.y)}`, fill: "none", stroke: c.hair, strokeWidth: 0.75, opacity: 0.85 });
  const m1 = plus(plus(H, times(face, r * 0.74)), times(crown, -r * 0.5));
  const m2 = plus(plus(H, times(face, r * 0.97)), times(crown, -r * 0.47));
  out.push({ d: `M${r1(m1.x)} ${r1(m1.y)}L${r1(m2.x)} ${r1(m2.y)}`, fill: "none", stroke: c.lip, strokeWidth: 0.9 });
  return out;
}

/** Where the ponytail would hang at rest (used to seed the spring simulation and for static frames). */
export function ponytailRest(sk: Skeleton): { tie: Pt; rest: Pt } {
  const r = L.headR * 0.96;
  const crown = sk.headDir;
  const face = v(-crown.y, crown.x);
  const a = (-112 * Math.PI) / 180;
  const tie = plus(sk.head, plus(times(crown, r * 0.92 * Math.cos(a)), times(face, r * 0.92 * Math.sin(a))));
  const rest = plus(tie, plus(times(face, -6), v(0, 12)));
  return { tie, rest: clampAboveFloor(rest) };
}

/** Keep loose hair from sinking through the floor when lying down. */
export function clampAboveFloor(p: Pt): Pt {
  return v(p.x, Math.min(p.y, GROUND - 1.5));
}

/* ---------------- Hands & feet ---------------- */

function handShapes(elbow: Pt, wrist: Pt, fill: string, view: View): Shape[] {
  const d = unit(minus(wrist, elbow));
  const n = frontOf(d);
  const c = plus(wrist, times(d, 3.6));
  const palm = [
    plus(wrist, times(n, 2.6)), plus(c, times(n, 3.0)), plus(c, plus(times(d, 3.6), times(n, 1.2))),
    plus(c, times(d, 4.1)), plus(c, plus(times(d, 3.4), times(n, -1.9))), plus(c, times(n, -2.7)), plus(wrist, times(n, -2.4)),
  ];
  const thumb = view === "side"
    ? [plus(wrist, plus(times(d, 1.2), times(n, 2.2))), plus(wrist, plus(times(d, 3.2), times(n, 3.9))), plus(wrist, plus(times(d, 4.8), times(n, 3.4))), plus(wrist, plus(times(d, 3.4), times(n, 1.8)))]
    : null;
  const out: Shape[] = [{ d: smoothClosed(palm), fill }];
  if (thumb) out.push({ d: smoothClosed(thumb), fill });
  out.push({ d: smoothClosed(palm.slice(3)), fill: "#000", opacity: 0.1 });
  return out;
}

function shoeShapes(ankle: Pt, toe: Pt, c: Palette, farTone: boolean, view: View): Shape[] {
  const shoe = farTone ? far(c.shoe) : c.shoe;
  const shade = farTone ? far(c.shoeShade) : c.shoeShade;
  const sole = farTone ? far(c.sole) : c.sole;
  if (view === "front") {
    const pts = [v(ankle.x - 4.2, ankle.y - 1), v(ankle.x + 4.2, ankle.y - 1), v(ankle.x + 4.6, ankle.y + 3.4), v(ankle.x, ankle.y + 4.4), v(ankle.x - 4.6, ankle.y + 3.4)];
    return [
      { d: smoothClosed(pts), fill: shoe },
      { d: `M${r1(ankle.x - 4.4)} ${r1(ankle.y + 3.2)}Q${r1(ankle.x)} ${r1(ankle.y + 4.9)} ${r1(ankle.x + 4.4)} ${r1(ankle.y + 3.2)}`, fill: "none", stroke: sole, strokeWidth: 1.4 },
    ];
  }
  const u = unit(minus(toe, ankle));
  const up = v(u.y, -u.x);
  const P = (along: number, h: number) => plus(ankle, plus(times(u, along), times(up, h)));
  const outline = [P(-2.6, 4.2), P(-3.6, 1.2), P(-3.4, -2.9), P(4, -3.1), P(11.4, -3.0), P(13.2, -1.4), P(12.6, 0.9), P(9.5, 2.1), P(5.2, 3.4), P(1.5, 4.8)];
  return [
    { d: smoothClosed(outline), fill: shoe },
    { d: smoothClosed([P(-3.5, -1.2), P(4, -1.5), P(12.4, -1.4), P(12.6, -2.6), P(4, -3.3), P(-3.4, -3.1)]), fill: sole },
    { d: smoothClosed([P(5.2, 3.0), P(9.4, 1.7), P(8, 0.4), P(4.4, 1.6)]), fill: shade, opacity: 0.9 },
  ];
}

/* ---------------- Whole body ---------------- */

export type BodyOptions = { gender: Gender; view: View; breath?: number; tailTip?: Pt | null };

export function buildBody(sk: Skeleton, { gender, view, breath = 0, tailTip = null }: BodyOptions): Shape[] {
  const c = PALETTES[gender];
  const P = PROFILES[gender];
  const female = gender === "female";
  const out: Shape[] = [];
  const push = (...s: Shape[]) => out.push(...s);

  const arm = (shoulder: Pt, elbow: Pt, hand: Pt, isFar: boolean) => {
    const skin = isFar ? far(c.skin) : c.skin;
    const sym = view === "front";
    push(...limbShapes(shoulder, elbow, P.upperArm, skin, { symmetric: sym }));
    push(...limbShapes(elbow, hand, P.forearm, skin, { symmetric: sym }));
    if (!female) {
      // T-shirt sleeve
      push(...limbShapes(shoulder, elbow, P.upperArm, isFar ? far(c.top) : c.top, { to: 0.45, inflate: 1.1, capEnd: false, symmetric: sym }));
    }
    push(...handShapes(elbow, hand, skin, view));
  };

  const leg = (hip: Pt, knee: Pt, ankle: Pt, toe: Pt, isFar: boolean) => {
    const skin = isFar ? far(c.skin) : c.skin;
    const bottom = isFar ? far(c.bottom) : c.bottom;
    const sym = view === "front";
    if (female) {
      push(...limbShapes(hip, knee, P.thigh, bottom, { inflate: 0.3, symmetric: sym }));
      push(...limbShapes(knee, ankle, P.shin, bottom, { to: 0.86, inflate: 0.3, capEnd: false, symmetric: sym }));
      push(...limbShapes(knee, ankle, P.shin, skin, { from: 0.84, capStart: false, symmetric: sym }));
    } else {
      push(...limbShapes(hip, knee, P.thigh, skin, { symmetric: sym }));
      push(...limbShapes(knee, ankle, P.shin, skin, { symmetric: sym }));
      // Shorts and socks
      push(...limbShapes(hip, knee, P.thigh, bottom, { to: 0.58, inflate: 1.4, capEnd: false, symmetric: sym }));
      push(...limbShapes(knee, ankle, P.shin, isFar ? far(c.sock) : c.sock, { from: 0.82, inflate: 0.4, capStart: false, shade: false, symmetric: sym }));
    }
    push(...shoeShapes(ankle, toe, c, isFar, view));
  };

  const torso = () => {
    const breathe = (s: number) => 1 + (s > 0.5 && s < 1 ? breath * Math.sin(Math.PI * (s - 0.5) * 2) : 0);
    let front: (s: number) => number;
    let back: (s: number) => number;
    if (view === "side") {
      front = (s) => sample(TORSO_SIDE[gender].front, s) * breathe(s);
      back = (s) => sample(TORSO_SIDE[gender].back, s);
    } else {
      front = (s) => sample(TORSO_FRONT[gender], s) * (1 + (breathe(s) - 1) * 0.4);
      back = front;
    }
    const sp = spine(sk);
    const n = frontOf2(sp.tangent(0.55));
    const centerOff = view === "side" ? (front(0.55) - back(0.55)) / 2 : 0;
    const center = plus(sp.point(0.55), times(n, centerOff));
    const half = (front(0.55) + back(0.55)) / 2 + 1;
    const slice = (from: number, to: number, fill: string, inflate = 0, shaded = true) =>
      push({
        d: smoothClosed(torsoPoints(sk, (s) => front(s) + inflate, (s) => back(s) + inflate, from, to)),
        fill,
        grad: shaded ? shadeAcross(center, n, half, fill, view === "side" ? 1 : 0.6) : undefined,
      });

    // Neck
    push(...limbShapes(sp.point(0.96), plus(sk.neck, times(minus(sk.head, sk.neck), 0.5)), { front: [[0, P.neck], [1, P.neck * 0.9]], back: [[0, P.neck], [1, P.neck * 0.9]] }, c.skin));

    slice(-0.22, 1.1, c.skin);
    if (female) {
      slice(-0.23, 0.4, c.bottom, 0.4); // high-waisted leggings
      slice(0.58, 0.97, c.top, 0.35); // sports bra
      slice(0.36, 0.4, c.bottomShade, 0.45, false); // waistband
    } else {
      slice(-0.23, 0.2, c.bottom, 0.6); // shorts
      slice(0.08, 1.06, c.top, 0.5); // t-shirt over the waistband
      slice(0.08, 0.12, c.topShade, 0.55, false); // hem
      if (view === "front") slice(1.0, 1.06, c.topShade, 0.55, false); // collar
    }
  };

  if (view === "side") {
    arm(sk.shoulderL, sk.elbowL, sk.handL, true);
    leg(sk.hipL, sk.kneeL, sk.ankleL, sk.toeL, true);
    leg(sk.hipR, sk.kneeR, sk.ankleR, sk.toeR, false);
    torso();
    push(...headShapes(sk, c, gender, view, tailTip, false));
    arm(sk.shoulderR, sk.elbowR, sk.handR, false);
  } else {
    leg(sk.hipR, sk.kneeR, sk.ankleR, sk.toeR, false);
    leg(sk.hipL, sk.kneeL, sk.ankleL, sk.toeL, false);
    torso();
    push(...headShapes(sk, c, gender, view, null, false));
    arm(sk.shoulderR, sk.elbowR, sk.handR, false);
    arm(sk.shoulderL, sk.elbowL, sk.handL, false);
  }
  return out;
}
