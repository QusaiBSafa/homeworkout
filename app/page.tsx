import Link from "next/link";
import HeroShowcase from "@/components/HeroShowcase";
import TodayCard, { WeekStrip } from "@/components/TodayCard";
import ExerciseCard from "@/components/ExerciseCard";
import { EXERCISES } from "@/lib/exercises";
import { PRINCIPLES } from "@/lib/research";

const FEATURED = ["squat", "push-up", "plank", "glute-bridge", "jumping-jacks", "bird-dog", "reverse-lunge", "burpee"];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 100% free · No equipment · No sign-up
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
            Get fit at home, <span className="text-accent">one day</span> at a time.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            A daily workout plan built on exercise science, with animated coaching for every move, exact sets and reps for your level, and a guided timer that does the counting for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#today" className="glow rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:brightness-110">
              Start today&apos;s workout
            </a>
            <Link href="/exercises" className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-surface">
              Browse {EXERCISES.length} exercises
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ["7-day", "weekly plan"],
              ["3", "levels"],
              ["10–35", "min a day"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-extrabold">{v}</dt>
                <dd className="text-sm text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroShowcase />
      </section>

      <div id="today" className="scroll-mt-24">
        <TodayCard />
      </div>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Your week</h2>
            <p className="text-muted">Hard days and easy days, balanced for steady progress.</p>
          </div>
          <Link href="/plan" className="text-sm font-semibold text-accent hover:underline">Full plan →</Link>
        </div>
        <div className="mt-5">
          <WeekStrip />
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-4">
        {PRINCIPLES.map((p, i) => (
          <div key={p.title} className="rounded-3xl border border-line bg-surface p-5">
            <p className="font-mono text-xs text-accent">0{i + 1}</p>
            <h3 className="mt-2 font-display text-lg font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </section>
      <p className="mt-4 text-sm text-muted">
        Built on WHO guidelines, ACSM position stands and peer-reviewed training research.{" "}
        <Link href="/science" className="font-semibold text-accent hover:underline">See the science →</Link>
      </p>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Learn every move</h2>
            <p className="text-muted">Watch the form, then read the cues and common mistakes.</p>
          </div>
          <Link href="/exercises" className="text-sm font-semibold text-accent hover:underline">All exercises →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEATURED.map((slug) => (
            <ExerciseCard key={slug} exercise={EXERCISES.find((e) => e.slug === slug)!} />
          ))}
        </div>
      </section>
    </div>
  );
}
