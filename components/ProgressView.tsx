"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dayStr, loadHistory, SessionRecord, stats } from "@/lib/history";
import { LEVEL_LABEL } from "./Controls";
import type { Level } from "@/lib/exercises";

const WEEKS = 18;

export default function ProgressView() {
  const [data, setData] = useState<{ sessions: SessionRecord[]; source: "cloud" | "device" } | null>(null);
  useEffect(() => {
    loadHistory().then(setData);
  }, []);

  if (!data) return <div className="mt-8 h-40 animate-pulse rounded-3xl bg-surface" />;
  const s = stats(data.sessions);

  // Heatmap: last WEEKS weeks, Monday-first columns.
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) - (WEEKS - 1) * 7);
  const cols = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      return date;
    }),
  );

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [s.streak, s.streak === 1 ? "day streak" : "day streak", "🔥"],
          [s.total, "workouts", "💪"],
          [s.minutes, "minutes", "⏱"],
          [`≈${s.kcal}`, "kcal burned", "⚡"],
        ].map(([v, l, icon]) => (
          <div key={l} className="rounded-3xl border border-line bg-surface p-5">
            <p className="text-2xl" aria-hidden>{icon}</p>
            <p className="mt-2 font-display text-4xl font-extrabold">{v}</p>
            <p className="text-sm text-muted">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-surface p-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
          <h2 className="font-display text-xl font-bold">Activity</h2>
          <p className="text-sm text-muted">{s.thisWeek} in the last 7 days · WHO goal: strength 2+ days a week</p>
        </div>
        <div className="mt-4 flex max-w-2xl gap-1">
          {cols.map((col, i) => (
            <div key={i} className="flex flex-1 flex-col gap-1">
              {col.map((d) => {
                const done = s.days.has(dayStr(d));
                const future = d > today;
                return (
                  <div
                    key={d.toISOString()}
                    title={d.toDateString()}
                    className={`aspect-square w-full rounded-[4px] ${future ? "bg-transparent" : done ? "bg-accent" : "bg-surface-2"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-bold">History</h2>
        {data.sessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted">No workouts yet. Your first one is the most important.</p>
            <Link href="/#today" className="mt-4 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink">Start today&apos;s workout</Link>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {data.sessions.slice(0, 50).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-muted">
                    {new Date(r.completed_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {LEVEL_LABEL[r.level as Level] ?? r.level} · Week {r.week}
                  </p>
                </div>
                <p className="text-right text-sm">
                  <span className="block font-semibold">{Math.max(1, Math.round(r.duration_sec / 60))} min</span>
                  <span className="text-muted">{r.exercises_completed} sets · ≈{r.kcal} kcal</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-4 text-xs text-muted">
        {data.source === "cloud"
          ? "Your history is stored securely in the cloud, linked to this browser. No account needed."
          : "Your history is saved on this device."}
      </p>
    </div>
  );
}
