"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GROUND, handsBearWeight, L, Motion, poseAt, Pose, Pt, Skeleton, solve } from "@/lib/figure";
import { buildBody, clampAboveFloor, Gender, ponytailRest } from "@/lib/body";

export type { Gender };

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

/** Forearms and head trail the upper body slightly, the way real limbs follow through. */
const FOREARM_LAG = 70;
const HEAD_LAG = 45;

function livePose(motion: Motion, t: number, lagArms: boolean): Pose {
  const pose = poseAt(motion, t);
  if (!lagArms) return pose;
  const lagged = poseAt(motion, t - FOREARM_LAG);
  const head = poseAt(motion, t - HEAD_LAG);
  return { ...pose, faR: lagged.faR, faL: lagged.faL, head: head.head ?? head.chest ?? head.torso };
}

type Sim = { t: number; tip: Pt | null; vel: Pt };

export default function Figure({ motion, gender, paused, speed = 1, className, title, frame }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<{ t: number; tip: Pt | null }>({ t: 0, tip: null });
  const sim = useRef<Sim>({ t: 0, tip: null, vel: { x: 0, y: 0 } });
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED).matches, () => false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const view = motion.view ?? "side";
  const box = useMemo(() => frameBox(motion), [motion]);
  const lagArms = useMemo(() => !handsBearWeight(motion), [motion]);

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
    const female = gender === "female";
    const tick = (now: number) => {
      const dtMs = Math.min(50, now - last) * factor;
      last = now;
      const s = sim.current;
      s.t += dtMs;
      if (female && view === "side") {
        // Ponytail: a damped spring pulled toward its resting hang, constrained to its length.
        const sk = solve(livePose(motion, s.t, lagArms), view, motion.anchor, motion.anchorX);
        const { tie, rest } = ponytailRest(sk);
        const dt = dtMs / 1000;
        if (!s.tip) s.tip = rest;
        const k = 160;
        const damp = 9;
        s.vel = {
          x: s.vel.x + (k * (rest.x - s.tip.x) - damp * s.vel.x) * dt,
          y: s.vel.y + (k * (rest.y - s.tip.y) - damp * s.vel.y) * dt,
        };
        let tip = { x: s.tip.x + s.vel.x * dt, y: s.tip.y + s.vel.y * dt };
        const dx = tip.x - tie.x;
        const dy = tip.y - tie.y;
        const dist = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(15.5, Math.max(10, dist));
        tip = clampAboveFloor({ x: tie.x + (dx / dist) * clamped, y: tie.y + (dy / dist) * clamped });
        s.tip = tip;
      } else {
        s.tip = null;
      }
      setState({ t: s.t, tip: s.tip });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, speed, reduced, motion, gender, view, lagArms]);

  const isStatic = frame !== undefined;
  const pose: Pose = isStatic ? motion.frames[frame % motion.frames.length].pose : livePose(motion, state.t, lagArms);
  const sk = solve(pose, view, motion.anchor, motion.anchorX);
  const tip = gender === "female" && view === "side" ? (isStatic || !state.tip ? ponytailRest(sk).rest : state.tip) : null;
  const breath = isStatic ? 0 : 0.035 * Math.sin((2 * Math.PI * state.t) / 3600);
  const shapes = buildBody(sk, { gender, view, breath, tailTip: tip });

  return (
    <svg ref={ref} viewBox={box.join(" ")} className={className} role="img" aria-label={title ?? "Animated exercise demonstration"}>
      <defs>
        <filter id={`soft${uid}`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <linearGradient id={`wall${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <Floor sk={sk} motion={motion} box={box} lift={pose.lift ?? 0} uid={uid} />
      {shapes.map((s, i) =>
        s.grad ? (
          <g key={i}>
            <linearGradient id={`g${uid}-${i}`} gradientUnits="userSpaceOnUse" x1={s.grad.x1} y1={s.grad.y1} x2={s.grad.x2} y2={s.grad.y2}>
              {s.grad.stops.map(([o, c]) => (
                <stop key={o} offset={o} stopColor={c} />
              ))}
            </linearGradient>
            <path d={s.d} fill={`url(#g${uid}-${i})`} opacity={s.opacity} />
          </g>
        ) : (
          <path key={i} d={s.d} fill={s.fill} opacity={s.opacity} stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinecap="round" />
        ),
      )}
    </svg>
  );
}

function Floor({ sk, motion, box, lift, uid }: { sk: Skeleton; motion: Motion; box: number[]; lift: number; uid: string }) {
  // Contact shadow spans whatever touches (or nearly touches) the floor.
  const pts: Pt[] = [sk.ankleR, sk.toeR, sk.ankleL, sk.toeL, sk.kneeR, sk.kneeL, sk.handR, sk.handL, sk.hip, sk.shoulder, sk.mid, sk.head];
  const near = pts.filter((p) => p.y > GROUND - 14);
  const minX = near.length ? Math.min(...near.map((p) => p.x)) - 9 : sk.hip.x - 14;
  const maxX = near.length ? Math.max(...near.map((p) => p.x)) + 9 : sk.hip.x + 14;
  const fade = Math.max(0.25, 1 - lift / 30);
  return (
    <g>
      {(motion.props ?? []).map((pr, i) =>
        pr.type === "wall" ? (
          <g key={i}>
            <rect x={box[0] - 10} y={box[1] - 10} width={pr.x - box[0] + 10} height={GROUND - box[1] + 11} fill={`url(#wall${uid})`} />
            <line x1={pr.x} y1={box[1] - 10} x2={pr.x} y2={GROUND + 1} stroke="#fff" strokeOpacity={0.12} strokeWidth={1} />
          </g>
        ) : (
          <rect key={i} x={box[0] + 10} y={GROUND - 2} width={box[2] - 20} height={5} rx={2.5} fill="#fff" fillOpacity={0.1} />
        ),
      )}
      <line x1={box[0] + 6} y1={GROUND + 1} x2={box[0] + box[2] - 6} y2={GROUND + 1} stroke="#fff" strokeOpacity={0.14} strokeWidth={1.2} strokeLinecap="round" />
      <ellipse
        cx={(minX + maxX) / 2}
        cy={GROUND + 1.5}
        rx={((maxX - minX) / 2) * (lift > 0 ? Math.max(0.5, 1 - lift / 40) : 1)}
        ry={3}
        fill="#000"
        opacity={0.55 * fade}
        filter={`url(#soft${uid})`}
      />
    </g>
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
      const r = k === "head" ? L.headR + 4 : 8;
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
