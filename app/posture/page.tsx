import type { Metadata } from "next";
import Link from "next/link";
import HeroShowcase from "@/components/HeroShowcase";
import ExerciseCard from "@/components/ExerciseCard";
import PostureRoutines from "@/components/PostureRoutines";
import { EXERCISE_MAP } from "@/lib/exercises";
import { CONDITIONS, POSTURE_DISCLAIMER, POSTURE_HABITS, POSTURE_SOURCES, RED_FLAGS } from "@/lib/posture";

export const metadata: Metadata = {
  title: "Posture: exercises for neck curvature and a hunched back",
  description:
    "Research-backed home exercises for forward head posture (text neck) and a hunched upper back, with animated demos and daily 10-minute routines.",
};

const SHOWCASE = ["chin-tuck", "wall-angel", "prone-cobra", "cat-camel", "doorway-pec-stretch", "prone-y-raise", "thoracic-extension"];

export default function PosturePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-14">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" /> Research-backed · 10 minutes a day · No equipment
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
            Stand taller. <span className="text-teal-300">Improve your posture</span> at home.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Daily routines for neck curvature (forward head posture) and a hunched upper back, built from the exercises that worked in clinical trials, with animated demos for every move.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/workout/full-posture" className="glow rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:brightness-110">
              Start the Full Posture Routine
            </Link>
            <a href="#routines" className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-surface">
              See all routines
            </a>
          </div>
        </div>
        <HeroShowcase items={SHOWCASE} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {CONDITIONS.map((c) => (
          <article key={c.key} className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">{c.aka}</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{c.name}</h2>
            <p className="mt-3 text-muted">{c.what}</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">Why it happens</dt>
                <dd className="mt-1 text-muted">{c.causes}</dd>
              </div>
              <div>
                <dt className="font-semibold">What the research shows</dt>
                <dd className="mt-1 text-muted">{c.evidence}</dd>
              </div>
              <div>
                <dt className="font-semibold">What to expect</dt>
                <dd className="mt-1 text-muted">{c.expect}</dd>
              </div>
            </dl>
            <Link href={`/workout/${c.routine}`} className="mt-6 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-surface-2">
              Start the {c.name.toLowerCase()} routine →
            </Link>
          </article>
        ))}
      </section>

      <section id="routines" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Daily routines</h2>
        <p className="text-muted">Guided, timed and voice-coached. Do one a day, or at least 3 to 4 days a week, for 8 to 10 weeks.</p>
        <PostureRoutines />
      </section>

      {CONDITIONS.map((c) => (
        <section key={c.key} className="mt-14">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Exercises for {c.name.toLowerCase()}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {c.exercises.map((slug) => (
              <ExerciseCard key={slug} exercise={EXERCISE_MAP[slug]} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14 grid gap-4 md:grid-cols-4">
        {POSTURE_HABITS.map((h, i) => (
          <div key={h.title} className="rounded-3xl border border-line bg-surface p-5">
            <p className="font-mono text-xs text-teal-300">0{i + 1}</p>
            <h3 className="mt-2 font-display text-lg font-bold">{h.title}</h3>
            <p className="mt-2 text-sm text-muted">{h.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-3xl border border-pink/30 bg-pink/5 p-6">
        <h2 className="font-display text-xl font-bold">See a doctor or physiotherapist first if you have</h2>
        <ul className="mt-3 grid list-disc gap-x-8 gap-y-1 pl-5 text-muted md:grid-cols-2">
          {RED_FLAGS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{POSTURE_DISCLAIMER}</p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold md:text-3xl">The research</h2>
        <p className="text-muted">The studies these routines are built on. Most tested supervised programs 3 to 4 times a week; these daily home routines follow the same exercises and doses.</p>
        <ol className="mt-5 space-y-3">
          {POSTURE_SOURCES.map((s) => (
            <li key={s.url} className="rounded-2xl border border-line bg-surface p-4">
              <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-semibold hover:text-accent">{s.cite} ↗</a>
              <p className="mt-1 text-sm text-muted">{s.finding}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
