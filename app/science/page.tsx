import type { Metadata } from "next";
import Link from "next/link";
import { SOURCES } from "@/lib/research";
import { WEEK_PHASES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "The science",
  description: "The research behind the HomeWorkout plan: WHO guidelines, high-intensity circuit training, progressive overload and more.",
};

export default function SciencePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">The science behind your plan</h1>
      <p className="mt-3 text-lg text-muted">
        Every part of the plan, from how many days you train to how many reps you do, comes from public health guidelines and peer-reviewed research. Here is what we used and how.
      </p>

      <section className="mt-10 rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-2xl font-bold">How the plan is built</h2>
        <ul className="mt-4 space-y-3 text-muted">
          <li><span className="font-semibold text-text">Every session:</span> dynamic warm-up → main block → static-stretch cool-down.</li>
          <li><span className="font-semibold text-text">Strength days (Mon, Thu, Sat):</span> full-body circuits. Beginner 2 rounds, intermediate 3, advanced 4, with each set taken close to failure.</li>
          <li><span className="font-semibold text-text">HIIT days (Tue, Fri):</span> work-to-rest intervals of 25/20s, 30/12s or 40/10s by level.</li>
          <li><span className="font-semibold text-text">Core day (Wed):</span> spine-sparing core endurance and hip mobility.</li>
          <li><span className="font-semibold text-text">Sunday:</span> active recovery, a mobility flow and an easy walk.</li>
          <li><span className="font-semibold text-text">Beginner swaps:</span> push-ups become knee push-ups and jumps become squats until you are ready.</li>
        </ul>
        <h3 className="mt-6 font-display text-lg font-bold">4-week progression cycle</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {WEEK_PHASES.map((p) => (
            <div key={p.week} className="rounded-2xl bg-surface-2 p-4">
              <p className="text-xs text-muted">Week {p.week}</p>
              <p className="font-display font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-bold">Research we rely on</h2>
        {SOURCES.map((s) => (
          <article key={s.id} className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-xs text-muted">{s.authors} · <span className="italic">{s.journal}</span> · {s.year}</p>
            <h3 className="mt-1 font-display text-lg font-bold leading-snug">
              <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-accent">{s.title} ↗</a>
            </h3>
            <p className="mt-3"><span className="font-semibold text-accent">Finding: </span>{s.finding}</p>
            <p className="mt-2 text-muted"><span className="font-semibold text-text">In your plan: </span>{s.howWeUseIt}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-pink/30 bg-pink/5 p-6">
        <h2 className="font-display text-xl font-bold">Train safely</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
          <li>Sharp pain is a stop sign. Muscle burn and effort are fine; joint pain is not.</li>
          <li>Use the easier version of any exercise until you can do it with good form.</li>
          <li>If you have a heart condition, high blood pressure, an injury or are pregnant, check with your doctor before starting HIIT.</li>
        </ul>
      </section>
      <Link href="/plan" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink">See your plan</Link>
    </div>
  );
}
