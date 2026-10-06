"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GROUND, L, Motion, poseAt, Pose, Pt, Skeleton, solve } from "@/lib/figure";

export type Gender = "male" | "female";

const PALETTE = {
  male: { skin: "#e3a77f", hair: "#26232b", top: "#4f8cff", topDark: "#3a6fd8", bottom: "#3b4658", shoe: "#f4f6fb", sole: "#b8f34a" },
  female: { skin: "#f0bf98", hair: "#6b3d26", top: "#ff6b8b", topDark: "#e24f73", bottom: "#7b6cff", shoe: "#f4f6fb", sole: "#ff6b8b" },
};

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

type Props = {
  motion: Motion;
  gender: Gender;
  paused?: boolean;
  speed?: number;
  className?: string;
  title?: string;
  /** Render a fixed frame instead of animating (index into motion.frames). */
  frame?: number;
};

export default function Figure({ motion, gender, paused, speed = 1, className, title, frame }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED).matches, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = frame === undefined && !paused && visible;
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let last = performance.now();
    const factor = reduced ? 0.5 * speed : speed;
    const tick = (now: number) => {
      setT((prev) => prev + (now - last) * factor);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, speed, reduced]);

  const view = motion.view ?? "side";
  const box = useMemo(() => frameBox(motion), [motion]);
  const pose: Pose = frame !== undefined ? motion.frames[frame % motion.frames.length].pose : poseAt(motion, t);
  const sk = solve(pose, view, motion.anchor, motion.anchorX);

  return (
    <svg
      ref={ref}
      viewBox={box.join(" ")}
      className={className}
      role="img"
      aria-label={title ?? "Animated exercise demonstration"}
    >
      <Scene sk={sk} gender={gender} motion={motion} view={view} lift={pose.lift ?? 0} box={box} />
    </svg>
  );
}

/** A square viewBox that frames every keyframe of the motion, so lying and standing moves both fill the stage. */
function frameBox(motion: Motion): [number, number, number, number] {
  const view = motion.view ?? "side";
  let minX = Infinity, maxX = -Infinity, minY = Infinity;
  for (const f of motion.frames) {
    const sk = solve(f.pose, view, motion.anchor, motion.anchorX);
    for (const [k, pt] of Object.entries(sk)) {
      if (k === "headDir") continue;
      const r = k === "head" ? L.headR + 3 : 6;
      minX = Math.min(minX, pt.x - r);
      maxX = Math.max(maxX, pt.x + r);
      minY = Math.min(minY, pt.y - r);
    }
  }
  const bottom = GROUND + 14;
  const size = Math.min(200, Math.max(120, maxX - minX + 36, bottom - minY + 22));
  const cx = (minX + maxX) / 2;
  return [round(cx - size / 2), round(bottom - size), round(size), round(size)];
}
const round = (n: number) => Math.round(n * 10) / 10;

function Scene({ sk, gender, motion, view, lift, box }: { sk: Skeleton; gender: Gender; motion: Motion; view: "side" | "front"; lift: number; box: number[] }) {
  const c = PALETTE[gender];
  const female = gender === "female";
  const props = motion.props ?? [];
  const shadowW = Math.max(18, 46 - lift * 0.9);

  const seg = (a: Pt, b: Pt, w: number, color: string, key?: string) => (
    <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  const part = (a: Pt, b: Pt, f: number): Pt => ({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });

  const arm = (shoulder: Pt, elbow: Pt, hand: Pt, far: boolean) => (
    <g opacity={far ? 0.55 : 1}>
      {seg(shoulder, elbow, 8.5, c.skin)}
      {seg(elbow, hand, 7.4, c.skin)}
      <circle cx={hand.x} cy={hand.y} r={4.3} fill={c.skin} />
      {/* sleeve */}
      {!female && seg(shoulder, part(shoulder, elbow, 0.42), 10.5, far ? c.topDark : c.top)}
    </g>
  );

  const leg = (hip: Pt, knee: Pt, ankle: Pt, toe: Pt, far: boolean) => (
    <g opacity={far ? 0.55 : 1}>
      {seg(hip, knee, 13, female ? c.bottom : c.skin)}
      {seg(knee, ankle, 10.5, female ? c.bottom : c.skin)}
      {!female && seg(hip, part(hip, knee, 0.62), 14.5, c.bottom)}
      {seg(ankle, toe, 7.5, c.shoe)}
      {view === "side" && seg(part(ankle, toe, 0.15), toe, 2.2, c.sole)}
    </g>
  );

  const torso = (
    <g>
      {seg(sk.hip, sk.mid, female ? 15.5 : 16, female ? c.bottom : c.top)}
      {seg(sk.mid, sk.shoulder, female ? 15 : 17.5, c.top)}
      {view === "front" && seg(sk.shoulderR, sk.shoulderL, 12, c.top)}
      {view === "front" && seg(sk.hipR, sk.hipL, 13, c.bottom)}
      {seg(sk.shoulder, sk.neck, 6, c.skin)}
    </g>
  );

  const head = <Head sk={sk} c={c} female={female} view={view} />;

  return (
    <g>
      {props.map((pr, i) =>
        pr.type === "wall" ? (
          <rect key={i} x={box[0] - 10} y={box[1] - 10} width={pr.x - box[0] + 10} height={GROUND - box[1] + 10} className="fill-white/5" />
        ) : (
          <rect key={i} x={box[0] + 10} y={GROUND - 2} width={box[2] - 20} height={5} rx={2.5} className="fill-white/10" />
        ),
      )}
      <line x1={box[0] + 6} y1={GROUND + 1} x2={box[0] + box[2] - 6} y2={GROUND + 1} className="stroke-white/15" strokeWidth={1.2} strokeLinecap="round" />
      <ellipse cx={(sk.hip.x + sk.shoulder.x) / 2} cy={GROUND + 2} rx={shadowW} ry={3.2} className="fill-black/35" />
      {view === "side" ? (
        <>
          {arm(sk.shoulderL, sk.elbowL, sk.handL, true)}
          {leg(sk.hipL, sk.kneeL, sk.ankleL, sk.toeL, true)}
          {torso}
          {leg(sk.hipR, sk.kneeR, sk.ankleR, sk.toeR, false)}
          {head}
          {arm(sk.shoulderR, sk.elbowR, sk.handR, false)}
        </>
      ) : (
        <>
          {leg(sk.hipR, sk.kneeR, sk.ankleR, sk.toeR, false)}
          {leg(sk.hipL, sk.kneeL, sk.ankleL, sk.toeL, false)}
          {torso}
          {head}
          {arm(sk.shoulderR, sk.elbowR, sk.handR, false)}
          {arm(sk.shoulderL, sk.elbowL, sk.handL, false)}
        </>
      )}
    </g>
  );
}

function Head({ sk, c, female, view }: { sk: Skeleton; c: (typeof PALETTE)["male"]; female: boolean; view: "side" | "front" }) {
  const r = L.headR;
  const d = sk.headDir; // points from neck to crown
  const crown = { x: d.x, y: d.y };
  const face = { x: -crown.y, y: crown.x }; // rotate crown -90deg => facing direction (right when upright)
  const at = (phi: number, rr: number): Pt => {
    const a = (phi * Math.PI) / 180;
    return {
      x: sk.head.x + rr * (crown.x * Math.cos(a) + face.x * Math.sin(a)),
      y: sk.head.y + rr * (crown.y * Math.cos(a) + face.y * Math.sin(a)),
    };
  };

  if (view === "front") {
    const h1 = { x: sk.head.x - r - 0.8, y: sk.head.y + 1 };
    const h2 = { x: sk.head.x + r + 0.8, y: sk.head.y + 1 };
    return (
      <g>
        {female && <circle cx={sk.head.x} cy={sk.head.y - r - 2} r={4.5} fill={c.hair} />}
        <circle cx={sk.head.x} cy={sk.head.y} r={r} fill={c.skin} />
        <path d={`M ${h1.x} ${h1.y} A ${r + 0.8} ${r + 0.8} 0 0 1 ${h2.x} ${h2.y} Q ${sk.head.x} ${sk.head.y - r * 0.35} ${h1.x} ${h1.y} Z`} fill={c.hair} />
        <circle cx={sk.head.x - 3.2} cy={sk.head.y + 1} r={1.05} fill="#1b1b22" />
        <circle cx={sk.head.x + 3.2} cy={sk.head.y + 1} r={1.05} fill="#1b1b22" />
        <path d={`M ${sk.head.x - 2.2} ${sk.head.y + 4.6} Q ${sk.head.x} ${sk.head.y + 5.8} ${sk.head.x + 2.2} ${sk.head.y + 4.6}`} stroke="#1b1b22" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      </g>
    );
  }

  const front = at(62, r + 0.9);
  const back = at(-118, r + 0.9);
  const inner = at(-20, r * 0.3);
  const eye = at(70, r * 0.55);
  const tieBase = at(-95, r * 0.95);
  const tailEnd = { x: tieBase.x - face.x * 9, y: tieBase.y + 13 };
  const tailCtrl = { x: tieBase.x - face.x * 12, y: tieBase.y + 2 };

  return (
    <g>
      {female && (
        <path
          d={`M ${tieBase.x} ${tieBase.y} Q ${tailCtrl.x} ${tailCtrl.y} ${tailEnd.x} ${tailEnd.y}`}
          stroke={c.hair}
          strokeWidth={5.5}
          strokeLinecap="round"
          fill="none"
        />
      )}
      <circle cx={sk.head.x} cy={sk.head.y} r={r} fill={c.skin} />
      <path
        d={`M ${front.x} ${front.y} A ${r + 0.9} ${r + 0.9} 0 ${female ? 1 : 0} 0 ${back.x} ${back.y} Q ${inner.x} ${inner.y} ${front.x} ${front.y} Z`}
        fill={c.hair}
      />
      {female && <circle cx={tieBase.x} cy={tieBase.y} r={2.4} fill={c.top} />}
      <circle cx={eye.x} cy={eye.y} r={1.1} fill="#1b1b22" />
    </g>
  );
}
