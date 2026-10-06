"use client";

import Link from "next/link";
import { usePrefs } from "./Prefs";
import { LevelPicker } from "./Controls";
import { buildSteps, summarize } from "@/lib/plans";
import { POSTURE_ROUTINES } from "@/lib/posture";

export default function PostureRoutines() {
  const { level, week } = usePrefs();
  return (
    <>
      <div className="mt-4"><LevelPicker size="sm" /></div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {POSTURE_ROUTINES.map((r, i) => {
          const s = summarize(buildSteps(r, level, week));
          const recommended = r.key === "full-posture";
          return (
            <Link
              key={r.key}
              href={`/workout/${r.key}`}
              className={`group flex flex-col rounded-3xl border p-6 transition hover:-translate-y-0.5 ${recommended ? "border-accent/50 bg-accent/5" : "border-line bg-surface hover:border-accent/40"}`}
            >
              <p className="font-mono text-xs text-muted">0{i + 1}{recommended && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-sans font-semibold text-accent-ink">Start here</span>}</p>
              <h3 className="mt-3 font-display text-2xl font-bold">{r.title}</h3>
              <p className="text-sm text-teal-300">{r.focus}</p>
              <p className="mt-3 flex-1 text-sm text-muted">{r.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm"><span className="font-display text-xl font-bold">{s.minutes}</span> min · {s.exercises} sets</p>
                <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink group-hover:brightness-110">Start →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
