/**
 * A tiny 2D forward-kinematics rig used to animate the exercise figures.
 *
 * Every segment angle is ABSOLUTE (world space), in degrees:
 *   0 = pointing down, 90 = pointing forward (right), 180 = up, -90 = backward (left).
 * The figure faces right. "R" limbs are the near side (drawn on top), "L" the far side.
 */

export type Pose = {
  torso: number; // hip -> mid spine
  chest?: number; // mid spine -> shoulders (defaults to torso)
  head?: number; // neck -> head (defaults to chest)
  uaR: number;
  faR: number;
  uaL: number;
  faL: number;
  thR: number;
  shR: number;
  thL: number;
  shL: number;
  ftR?: number; // foot direction, default 90 (flat, toes forward)
  ftL?: number;
  lift?: number; // raise the whole body off the ground (jumps)
};

export type Anchor = "footR" | "footL" | "hip" | "handR" | "shoulder" | "knee";

export type Keyframe = { pose: Pose; move: number; hold: number };

export type Prop = { type: "wall"; x: number } | { type: "mat" };

export type Motion = {
  frames: Keyframe[];
  anchor: Anchor;
  anchorX?: number;
  view?: "side" | "front";
  props?: Prop[];
};

export const kf = (pose: Pose, move = 700, hold = 0): Keyframe => ({ pose, move, hold });

export const L = {
  pelvis: 24,
  chest: 26,
  neck: 5,
  headR: 9.5,
  upperArm: 25,
  forearm: 23,
  thigh: 33,
  shin: 33,
  foot: 11,
};

export const GROUND = 182;
export const DEFAULT_ANCHOR_X = 100;

export type Pt = { x: number; y: number };

export type Skeleton = {
  hip: Pt;
  hipR: Pt;
  hipL: Pt;
  mid: Pt;
  shoulder: Pt;
  shoulderR: Pt;
  shoulderL: Pt;
  neck: Pt;
  head: Pt;
  headDir: Pt;
  elbowR: Pt;
  handR: Pt;
  elbowL: Pt;
  handL: Pt;
  kneeR: Pt;
  ankleR: Pt;
  toeR: Pt;
  kneeL: Pt;
  ankleL: Pt;
  toeL: Pt;
};

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (deg: number): Pt => ({ x: Math.sin(rad(deg)), y: Math.cos(rad(deg)) });
const add = (p: Pt, deg: number, len: number): Pt => {
  const d = dir(deg);
  return { x: p.x + d.x * len, y: p.y + d.y * len };
};

export function solve(pose: Pose, view: "side" | "front" = "side", anchor: Anchor = "footR", anchorX = DEFAULT_ANCHOR_X): Skeleton {
  const chest = pose.chest ?? pose.torso;
  const headA = pose.head ?? chest;
  const sw = view === "front" ? 11 : 0; // shoulder half width
  const hw = view === "front" ? 6.5 : 0; // hip half width

  const hip = { x: 0, y: 0 };
  const mid = add(hip, pose.torso, L.pelvis);
  const shoulder = add(mid, chest, L.chest);
  const neck = add(shoulder, headA, L.neck);
  const head = add(neck, headA, L.headR);
  // R is the figure's right side: on screen it sits on the viewer's left in front view.
  const shoulderR = { x: shoulder.x - sw, y: shoulder.y };
  const shoulderL = { x: shoulder.x + sw, y: shoulder.y };
  const hipR = { x: hip.x - hw, y: hip.y };
  const hipL = { x: hip.x + hw, y: hip.y };
  const elbowR = add(shoulderR, pose.uaR, L.upperArm);
  const handR = add(elbowR, pose.faR, L.forearm);
  const elbowL = add(shoulderL, pose.uaL, L.upperArm);
  const handL = add(elbowL, pose.faL, L.forearm);
  const kneeR = add(hipR, pose.thR, L.thigh);
  const ankleR = add(kneeR, pose.shR, L.shin);
  const toeR = add(ankleR, view === "front" ? 0 : (pose.ftR ?? 90), view === "front" ? 4 : L.foot);
  const kneeL = add(hipL, pose.thL, L.thigh);
  const ankleL = add(kneeL, pose.shL, L.shin);
  const toeL = add(ankleL, view === "front" ? 0 : (pose.ftL ?? 90), view === "front" ? 4 : L.foot);

  const sk: Skeleton = {
    hip, hipR, hipL, mid, shoulder, shoulderR, shoulderL, neck, head, headDir: dir(headA),
    elbowR, handR, elbowL, handL, kneeR, ankleR, toeR, kneeL, ankleL, toeL,
  };

  // Ground the figure: the lowest point (accounting for limb thickness) touches the floor.
  const pad = 4;
  const candidates: number[] = [
    hip.y + 7, mid.y + 7, shoulder.y + 7, head.y + L.headR,
    elbowR.y + pad, handR.y + pad, elbowL.y + pad, handL.y + pad,
    kneeR.y + pad, ankleR.y + pad, toeR.y + 3, kneeL.y + pad, ankleL.y + pad, toeL.y + 3,
  ];
  const lowest = Math.max(...candidates);
  const ref: Pt =
    anchor === "footR" ? ankleR
      : anchor === "footL" ? ankleL
        : anchor === "handR" ? handR
          : anchor === "shoulder" ? shoulder
            : anchor === "knee" ? kneeR
              : hip;
  const dx = anchorX - ref.x;
  const dy = GROUND - lowest - (pose.lift ?? 0);
  for (const key of Object.keys(sk) as (keyof Skeleton)[]) {
    if (key === "headDir") continue;
    // Rounded so server and client render identical markup.
    sk[key] = { x: Math.round((sk[key].x + dx) * 100) / 100, y: Math.round((sk[key].y + dy) * 100) / 100 };
  }
  return sk;
}

const POSE_KEYS: (keyof Pose)[] = [
  "torso", "chest", "head", "uaR", "faR", "uaL", "faL", "thR", "shR", "thL", "shL", "ftR", "ftL", "lift",
];

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const e = easeInOut(t);
  const out: Record<string, number> = {};
  for (const k of POSE_KEYS) {
    const av = a[k] ?? (k === "chest" ? a.torso : k === "head" ? (a.chest ?? a.torso) : k.startsWith("ft") ? 90 : 0);
    const bv = b[k] ?? (k === "chest" ? b.torso : k === "head" ? (b.chest ?? b.torso) : k.startsWith("ft") ? 90 : 0);
    // Angles take the shortest way round so circles and overhead reaches animate naturally.
    let delta = bv - av;
    if (k !== "lift") delta = ((((delta + 180) % 360) + 360) % 360) - 180;
    out[k] = av + delta * e;
  }
  return out as Pose;
}

export function cycleLength(m: Motion) {
  return m.frames.reduce((s, f) => s + f.move + f.hold, 0);
}

/** Pose at time t (ms) within a looping motion. Frame i holds, then moves to frame i+1. */
export function poseAt(m: Motion, t: number): Pose {
  const total = cycleLength(m);
  if (m.frames.length === 1 || total === 0) return m.frames[0].pose;
  let time = ((t % total) + total) % total;
  for (let i = 0; i < m.frames.length; i++) {
    const f = m.frames[i];
    const next = m.frames[(i + 1) % m.frames.length];
    if (time < f.hold) return f.pose;
    time -= f.hold;
    if (time < f.move) return lerpPose(f.pose, next.pose, time / f.move);
    time -= f.move;
  }
  return m.frames[0].pose;
}

/* ---------- Pose helpers for authoring ---------- */

export const STAND: Pose = {
  torso: 180, uaR: 6, faR: 14, uaL: -4, faL: 4, thR: 1, shR: 0, thL: -1, shL: 0,
};

export const p = (overrides: Partial<Pose>, base: Pose = STAND): Pose => ({ ...base, ...overrides });
