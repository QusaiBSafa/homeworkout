"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Figure from "./Figure";
import { usePrefs } from "./Prefs";
import { GenderToggle, LevelPicker } from "./Controls";
import { buildSteps, DayKey, ExerciseStep, Step, stepSeconds, summarize, WEEK_MAP, WEEK_PHASES } from "@/lib/plans";
import { saveLocal } from "@/lib/history";

type Phase = "overview" | "countdown" | "active" | "done";

/* ---------- Sound & voice ---------- */

function useCoach(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  const unlock = useCallback(() => {
    if (!ctx.current && typeof window !== "undefined" && "AudioContext" in window) ctx.current = new AudioContext();
    void ctx.current?.resume();
  }, []);
  const beep = useCallback((freq = 880, ms = 120) => {
    const c = ctx.current;
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + ms / 1000);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + ms / 1000 + 0.02);
  }, []);
  const say = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.03;
      window.speechSynthesis.speak(u);
    },
    [enabled],
  );
  return { unlock, beep, say };
}

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    navigator.wakeLock.request("screen").then((l) => {
      if (cancelled) void l.release();
      else lock = l;
    }).catch(() => {});
    return () => {
      cancelled = true;
      void lock?.release();
    };
  }, [active]);
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, "0")}`;

const describe = (s: ExerciseStep) =>
  s.measure === "reps"
    ? `${s.amount} reps${s.perSide ? " each side" : ""}`
    : `${s.amount} seconds${s.perSide ? " each side" : ""}`;

/* ---------- Player ---------- */

export default function WorkoutPlayer({ dayKey }: { dayKey: DayKey }) {
  const day = WEEK_MAP[dayKey];
  const { level, week, gender, voice, set, ready } = usePrefs();
  const steps = useMemo(() => buildSteps(day, level, week), [day, level, week]);
  const plan = useMemo(() => summarize(steps), [steps]);

  const [phase, setPhase] = useState<Phase>("overview");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds in current step
  const [activeMs, setActiveMs] = useState(0); // total workout time excluding pauses
  const [countdown, setCountdown] = useState(5);
  const [extraRest, setExtraRest] = useState(0);
  const [saved, setSaved] = useState<"idle" | "saving" | "cloud" | "device">("idle");
  const [result, setResult] = useState({ sets: 0, kcal: 0, minutes: 0 });
  const completed = useRef(new Set<number>());

  const coach = useCoach(voice);
  useWakeLock(phase === "active" || phase === "countdown");

  const step: Step | undefined = steps[idx];
  const duration = step ? (step.kind === "rest" ? step.seconds + extraRest : step.measure === "time" ? stepSeconds(step) : null) : null;
  const remaining = duration !== null ? Math.max(0, duration - elapsed) : null;
  const nextExercise = steps.slice(idx + 1).find((s): s is ExerciseStep => s.kind === "exercise");

  // Live values the ticker reads without re-subscribing.
  const live = useRef({ elapsed: 0, activeMs: 0, countdown: 5, duration: null as number | null, step: step as Step | undefined, idx: 0 });
  useEffect(() => {
    live.current.duration = duration;
    live.current.step = step;
    live.current.idx = idx;
  }, [duration, step, idx]);

  const finish = useCallback(() => {
    const doneSteps = steps.filter((s, i) => s.kind === "exercise" && completed.current.has(i));
    const kcal = summarize(doneSteps).kcal;
    const durationSec = Math.round(live.current.activeMs / 1000);
    setResult({ sets: doneSteps.length, kcal, minutes: Math.max(1, Math.round(durationSec / 60)) });
    setPhase("done");
    coach.say("Workout complete. Great job!");
    coach.beep(660, 160);
    setTimeout(() => coach.beep(990, 260), 180);

    setSaved("saving");
    saveLocal({
      id: `local-${Date.now()}`,
      day_key: dayKey,
      title: day.title,
      level,
      week,
      duration_sec: durationSec,
      exercises_completed: doneSteps.length,
      kcal,
      completed_at: new Date().toISOString(),
    });
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayKey, title: day.title, level, week, durationSec, exercisesCompleted: doneSteps.length, kcal }),
    })
      .then(async (r) => setSaved(r.ok && (await r.json()).db ? "cloud" : "device"))
      .catch(() => setSaved("device"));
  }, [coach, steps, dayKey, day.title, level, week]);

  const announce = useCallback(
    (i: number) => {
      const s = steps[i];
      if (!s) return;
      if (s.kind === "exercise") {
        coach.beep(990, 180);
        coach.say(`${s.exercise.name}. ${describe(s)}.`);
      } else {
        const upcoming = steps.slice(i + 1).find((x): x is ExerciseStep => x.kind === "exercise");
        coach.say(upcoming ? `${s.label}. Next up, ${upcoming.exercise.name}.` : s.label);
      }
    },
    [steps, coach],
  );

  const goTo = useCallback(
    (i: number) => {
      if (i >= steps.length) return finish();
      const target = Math.max(0, i);
      setIdx(target);
      setElapsed(0);
      setExtraRest(0);
      live.current.elapsed = 0;
      announce(target);
    },
    [steps.length, finish, announce],
  );

  const next = useCallback(() => {
    const i = live.current.idx;
    if (steps[i]?.kind === "exercise") completed.current.add(i);
    goTo(i + 1);
  }, [goTo, steps]);

  // Ticker: drives the countdown, timed steps, beeps and auto-advance.
  useEffect(() => {
    if (paused || (phase !== "active" && phase !== "countdown")) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const L = live.current;
      if (phase === "countdown") {
        const before = Math.ceil(L.countdown);
        L.countdown -= dt;
        const after = Math.ceil(L.countdown);
        if (after !== before && after > 0) coach.beep(660, 90);
        setCountdown(L.countdown);
        if (L.countdown <= 0) {
          setPhase("active");
          goTo(0);
        }
        return;
      }
      const prevRemaining = L.duration !== null ? L.duration - L.elapsed : null;
      L.elapsed += dt;
      L.activeMs += dt * 1000;
      setElapsed(L.elapsed);
      setActiveMs(L.activeMs);
      if (L.duration === null || prevRemaining === null) return;
      const remainingNow = L.duration - L.elapsed;
      const before = Math.ceil(prevRemaining);
      const after = Math.ceil(remainingNow);
      if (after !== before) {
        if (after <= 3 && after > 0) coach.beep(660, 90);
        const s = L.step;
        if (s?.kind === "exercise" && s.perSide && after === Math.ceil(L.duration / 2)) {
          coach.beep(880, 150);
          coach.say("Switch sides");
        }
      }
      if (remainingNow <= 0) next();
    }, 100);
    return () => clearInterval(id);
  }, [paused, phase, coach, goTo, next]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "active") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") goTo(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, next, goTo, idx]);

  const start = () => {
    coach.unlock();
    completed.current = new Set();
    live.current.elapsed = 0;
    live.current.activeMs = 0;
    live.current.countdown = 5;
    setIdx(0);
    setElapsed(0);
    setActiveMs(0);
    setCountdown(5);
    setPaused(false);
    setSaved("idle");
    setPhase("countdown");
    coach.say(`Get ready. First up, ${(steps[0] as ExerciseStep).exercise.name}.`);
  };

  const exerciseCount = steps.filter((s) => s.kind === "exercise").length;
  const exerciseIndex = steps.slice(0, idx + 1).filter((s) => s.kind === "exercise").length;

  /* ---------- Overview ---------- */
  if (phase === "overview") {
    const blocks = day.blocks.map((b) => ({
      title: b.title,
      items: steps.filter((s): s is ExerciseStep => s.kind === "exercise" && s.block === b.title && s.round === 1),
      rounds: (steps.find((s) => s.kind === "exercise" && s.block === b.title) as ExerciseStep | undefined)?.rounds ?? 1,
    }));
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/plan" className="text-sm text-muted hover:text-text">← Plan</Link>
          <GenderToggle size="sm" />
        </div>
        <p className="mt-6 text-sm text-muted">Week {week} · {WEEK_PHASES[week - 1].name}</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{day.title}</h1>
        <p className="mt-2 text-muted">{day.description}</p>
        <div className="mt-5"><LevelPicker size="sm" /></div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            [plan.minutes, "minutes"],
            [plan.exercises, "sets"],
            [`≈${plan.kcal}`, "kcal"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-surface p-4">
              <p className="font-display text-3xl font-bold">{v}</p>
              <p className="text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {blocks.map((b) => (
            <div key={b.title} className="rounded-3xl border border-line bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold">{b.title}</h2>
                {b.rounds > 1 && <span className="text-sm text-accent">× {b.rounds} rounds</span>}
              </div>
              <ul className="mt-2 divide-y divide-line">
                {b.items.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 py-2">
                    <span className="h-12 w-12 shrink-0 rounded-lg bg-bg/60">
                      <Figure motion={s.exercise.motion} gender={gender} frame={1} className="h-full w-full" />
                    </span>
                    <span className="flex-1 font-medium">{s.exercise.name}</span>
                    <span className="font-mono text-sm text-accent">
                      {s.amount}{s.measure === "time" ? "s" : "×"}{s.perSide && <span className="text-muted">/side</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="sticky bottom-4 mt-6 flex items-center gap-3">
          <button
            onClick={start}
            disabled={!ready}
            className="glow flex-1 rounded-full bg-accent py-4 text-lg font-bold text-accent-ink hover:brightness-110 disabled:opacity-60"
          >
            Start workout
          </button>
          <button
            onClick={() => set({ voice: !voice })}
            className="rounded-full border border-line bg-surface px-4 py-4 text-sm"
            aria-pressed={voice}
          >
            Voice {voice ? "on" : "off"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Done ---------- */
  if (phase === "done") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full bg-accent text-5xl text-accent-ink">✓</div>
        </div>
        <h1 className="mt-8 font-display text-4xl font-extrabold">Workout complete!</h1>
        <p className="mt-2 text-muted">{day.title} · Week {week}</p>
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {[
            [result.minutes, "minutes"],
            [result.sets, "sets done"],
            [`≈${result.kcal}`, "kcal"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-surface p-4">
              <p className="font-display text-3xl font-bold">{v}</p>
              <p className="text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          {saved === "saving" ? "Saving…" : saved === "cloud" ? "Saved to your progress." : saved === "device" ? "Saved on this device." : ""}
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link href="/progress" className="flex-1 rounded-full bg-accent py-3 font-semibold text-accent-ink">See my progress</Link>
          <Link href="/" className="flex-1 rounded-full border border-line py-3 font-semibold">Back home</Link>
        </div>
      </div>
    );
  }

  /* ---------- Countdown ---------- */
  if (phase === "countdown") {
    const first = steps[0] as ExerciseStep;
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-muted">Get ready</p>
        <p key={Math.ceil(countdown)} className="rise font-display text-[9rem] font-extrabold leading-none text-accent">{Math.max(1, Math.ceil(countdown))}</p>
        <p className="mt-4 text-lg">First up: <span className="font-semibold">{first.exercise.name}</span></p>
        <div className="mt-6 w-56">
          <Figure motion={first.exercise.motion} gender={gender} className="w-full aspect-square" />
        </div>
        <button onClick={() => (live.current.countdown = 0.01)} className="mt-6 rounded-full border border-line px-5 py-2 text-sm">Skip</button>
      </div>
    );
  }

  /* ---------- Active ---------- */
  if (!step) return null;
  const progress = idx / steps.length;
  const isRest = step.kind === "rest";
  const show = isRest ? nextExercise : step;
  const ringPct = duration ? Math.min(1, elapsed / duration) : 0;
  const side = step.kind === "exercise" && step.perSide && duration !== null ? (elapsed < duration / 2 ? "Right side" : "Left side") : null;
  const halfway = step.kind === "exercise" && !step.perSide && step.exercise.perSide && step.measure === "time" && duration !== null ? (elapsed < duration / 2 ? "First side" : "Switch sides") : null;

  return (
    <div className={`flex min-h-[100dvh] flex-col ${isRest ? "bg-[#0d1410]" : ""}`}>
      <div className="mx-auto w-full max-w-3xl px-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm("End this workout? Progress for completed exercises will be saved.")) finish();
            }}
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-text"
            aria-label="End workout"
          >
            ✕
          </button>
          <div className="text-center text-sm">
            <p className="font-semibold">{step.kind === "exercise" ? step.block : "Rest"}</p>
            <p className="text-muted">
              {step.kind === "exercise" && step.rounds > 1 ? `Round ${step.round} of ${step.rounds} · ` : ""}
              {exerciseIndex} / {exerciseCount}
            </p>
          </div>
          <p className="w-10 text-right font-mono text-sm text-muted">{fmt(activeMs / 1000)}</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4">
        {isRest ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">{step.label}</p>
            <p className="font-display text-8xl font-extrabold tabular-nums">{fmt(remaining ?? 0)}</p>
            {show && (
              <div className="mt-4 flex w-full max-w-sm items-center gap-4 rounded-3xl border border-line bg-surface p-3">
                <div className="stage h-24 w-24 shrink-0 rounded-2xl">
                  <Figure motion={show.exercise.motion} gender={gender} className="h-full w-full" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted">Next up</p>
                  <p className="font-display text-lg font-bold">{show.exercise.name}</p>
                  <p className="text-sm text-accent">{describe(show)}</p>
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setExtraRest((r) => r + 20)} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">+20s</button>
              <button onClick={next} className="rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg">Skip rest</button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full max-w-md">
              <div className="stage rounded-[2rem] border border-line">
                <Figure motion={step.exercise.motion} gender={gender} paused={paused} className="w-full aspect-square" title={`${step.exercise.name} demonstration`} />
              </div>
              {(side || halfway) && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink">{side ?? halfway}</span>
              )}
            </div>
            <h1 className="mt-4 text-center font-display text-3xl font-extrabold md:text-4xl">{step.exercise.name}</h1>
            <p className="mt-1 max-w-md text-center text-sm text-muted">{step.exercise.cues[0]}</p>
            {step.measure === "time" ? (
              <div className="mt-4 flex items-center gap-4">
                <Ring pct={ringPct} />
                <div>
                  <p className="font-display text-6xl font-extrabold tabular-nums">{Math.ceil(remaining ?? 0)}</p>
                  <p className="text-sm text-muted">seconds{step.perSide ? " · switch at halfway" : ""}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="font-display text-6xl font-extrabold">
                  {step.amount}
                  <span className="text-2xl text-muted"> reps{step.perSide ? " / side" : ""}</span>
                </p>
                <p className="mt-1 font-mono text-sm text-muted">{fmt(elapsed)}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4 px-4 pb-8 pt-4">
        <button onClick={() => goTo(idx - 1)} disabled={idx === 0} className="grid h-14 w-14 place-items-center rounded-full border border-line disabled:opacity-30" aria-label="Previous">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M6 6h2v12H6zM9.5 12L18 18V6z" /></svg>
        </button>
        {step.kind === "exercise" && step.measure === "reps" ? (
          <button onClick={next} className="glow h-16 rounded-full bg-accent px-10 text-lg font-bold text-accent-ink">Done</button>
        ) : (
          <button onClick={() => setPaused((p) => !p)} className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-ink" aria-label={paused ? "Resume" : "Pause"}>
            {paused ? (
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            )}
          </button>
        )}
        <button onClick={next} className="grid h-14 w-14 place-items-center rounded-full border border-line" aria-label="Next">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg>
        </button>
      </div>
      {paused && <p className="pb-4 text-center text-sm text-muted">Paused · press space to resume</p>}
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}
