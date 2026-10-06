"use client";

import Link from "next/link";
import { useState } from "react";
import Figure from "./Figure";
import { usePrefs, useToday } from "./Prefs";
import { LevelPicker } from "./Controls";
import { TYPE_STYLE } from "./TodayCard";
import { buildBlock, buildSteps, DAY_NAMES, DayKey, summarize, WEEK, WEEK_PHASES } from "@/lib/plans";

export default function PlanView() {
  const { level, week: currentWeek, gender } = usePrefs();
  const [week, setWeek] = useState<number | null>(null);
  const today = useToday();
  const [picked, setOpen] = useState<DayKey | null | undefined>(undefined);
  const open = picked === undefined ? today : picked;
  const w = week ?? currentWeek;
  const phase = WEEK_PHASES[w - 1];

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <LevelPicker />
        <div className="flex gap-2">
          {WEEK_PHASES.map((p) => (
            <button
              key={p.week}
              onClick={() => setWeek(p.week)}
              className={`rounded-2xl border px-3 py-2 text-left text-xs transition ${p.week === w ? "border-accent bg-accent/10" : "border-line hover:border-muted"}`}
            >
              <span className="block font-semibold">Week {p.week}{p.week === currentWeek && " ·  now"}</span>
              <span className="text-muted">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        <span className="font-semibold text-text">Week {w}: {phase.name}.</span> {phase.text}
      </p>

      <div className="mt-6 space-y-3">
        {WEEK.map((d) => {
          const sum = summarize(buildSteps(d, level, w));
          const isOpen = open === d.key;
          const t = TYPE_STYLE[d.type];
          return (
            <div key={d.key} className={`rounded-3xl border bg-surface transition ${isOpen ? "border-accent/40" : "border-line"}`}>
              <button onClick={() => setOpen(isOpen ? null : d.key)} className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={isOpen}>
                <span className="w-12 shrink-0 font-mono text-sm uppercase text-muted">{DAY_NAMES[d.key].slice(0, 3)}</span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-bold leading-tight">{d.title}</span>
                  <span className="text-sm text-muted">{d.focus}</span>
                </span>
                <span className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${t.className}`}>{t.label}</span>
                <span className="text-right text-sm">
                  <span className="block font-semibold">{sum.minutes} min</span>
                  <span className="text-muted">≈{sum.kcal} kcal</span>
                </span>
                <span className={`text-muted transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>
              {isOpen && (
                <div className="border-t border-line p-5">
                  <p className="max-w-2xl text-muted">{d.description}</p>
                  <div className="mt-5 grid gap-5 lg:grid-cols-3">
                    {d.blocks.map((b) => {
                      const built = buildBlock(b, level, w);
                      return (
                        <div key={b.title} className="rounded-2xl bg-surface-2 p-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-display font-bold">{b.title}</h3>
                            <span className="text-xs text-muted">
                              {built.rounds > 1 ? `${built.rounds} rounds · ` : ""}rest {built.rest}s
                            </span>
                          </div>
                          {b.note && <p className="mt-1 text-xs text-muted">{b.note}</p>}
                          <ul className="mt-3 space-y-1">
                            {built.items.map((it, i) => (
                              <li key={i}>
                                <Link href={`/exercises/${it.exercise.slug}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-surface">
                                  <span className="h-12 w-12 shrink-0 rounded-lg bg-bg/60">
                                    <Figure motion={it.exercise.motion} gender={gender} frame={1} className="h-full w-full" />
                                  </span>
                                  <span className="flex-1 text-sm font-medium">{it.exercise.name}</span>
                                  <span className="font-mono text-sm text-accent">
                                    {it.amount}
                                    {it.measure === "time" ? "s" : "×"}
                                    {it.exercise.perSide && b.kind !== "interval" ? <span className="text-muted">/side</span> : null}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  <Link href={`/workout/${d.key}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:brightness-110">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    Start {d.title}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
