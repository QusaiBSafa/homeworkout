"use client";

import Link from "next/link";
import { usePrefs, useToday } from "./Prefs";
import { LevelPicker } from "./Controls";
import Figure from "./Figure";
import { buildSteps, DAY_NAMES, summarize, WEEK, WEEK_MAP, WEEK_PHASES } from "@/lib/plans";
import { ExerciseStep } from "@/lib/plans";

export const TYPE_STYLE: Record<string, { label: string; className: string }> = {
  strength: { label: "Strength", className: "bg-blue/15 text-blue" },
  hiit: { label: "HIIT", className: "bg-orange-400/15 text-orange-300" },
  core: { label: "Core", className: "bg-accent/15 text-accent" },
  recovery: { label: "Recovery", className: "bg-violet/15 text-violet" },
};

export default function TodayCard() {
  const { level, week, gender } = usePrefs();
  const key = useToday() ?? "mon";
  const day = WEEK_MAP[key];
  const steps = buildSteps(day, level, week);
  const sum = summarize(steps);
  const main = steps.filter((s): s is ExerciseStep => s.kind === "exercise" && s.block !== "Warm-up" && s.block !== "Cool-down");
  const unique = [...new Map(main.map((s) => [s.exercise.slug, s])).values()];
  const hero = unique[0]?.exercise;

  return (
    <section className="rounded-[2rem] border border-line bg-surface p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {DAY_NAMES[key]} · Week {week} of 4 · {WEEK_PHASES[week - 1].name}
          </p>
          <h2 className="mt-1 font-display text-3xl md:text-4xl font-extrabold tracking-tight">{day.title}</h2>
        </div>
        <LevelPicker size="sm" />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <p className="text-muted max-w-xl">{day.description}</p>
          <dl className="mt-5 grid grid-cols-3 gap-3 max-w-md">
            {[
              [sum.minutes, "minutes"],
              [unique.length, "exercises"],
              [`≈${sum.kcal}`, "kcal"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-surface-2 p-3">
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl font-bold">{v}</dd>
                <p className="text-xs text-muted">{l}</p>
              </div>
            ))}
          </dl>
          <ul className="mt-5 flex flex-wrap gap-2">
            {unique.map((s) => (
              <li key={s.exercise.slug} className="rounded-full border border-line px-3 py-1 text-sm">
                {s.exercise.name}
                <span className="text-muted"> · {s.amount}{s.measure === "time" ? "s" : ""}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/workout/${key}`} className="glow inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:brightness-110">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Start today&apos;s workout
            </Link>
            <Link href="/plan" className="inline-flex items-center rounded-full border border-line px-6 py-3 font-semibold hover:bg-surface-2">
              See the full week
            </Link>
          </div>
        </div>
        {hero && (
          <div className="stage rounded-3xl border border-line">
            <Figure motion={hero.motion} gender={gender} className="w-full aspect-square" title={hero.name} />
          </div>
        )}
      </div>
    </section>
  );
}

export function WeekStrip() {
  const today = useToday();
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:px-0">
      {WEEK.map((d) => {
        const t = TYPE_STYLE[d.type];
        const isToday = d.key === today;
        return (
          <Link
            key={d.key}
            href={`/workout/${d.key}`}
            className={`min-w-[150px] rounded-2xl border p-4 transition hover:border-accent/50 ${isToday ? "border-accent bg-accent/5" : "border-line bg-surface"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {DAY_NAMES[d.key].slice(0, 3)} {isToday && <span className="text-accent">· Today</span>}
            </p>
            <p className="mt-2 font-display font-bold leading-tight">{d.title}</p>
            <span className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.className}`}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

