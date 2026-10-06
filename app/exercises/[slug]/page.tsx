import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExerciseViewer from "@/components/ExerciseViewer";
import { CATEGORY_LABEL, CATEGORY_TONE, EXERCISE_MAP, EXERCISES, formatTarget, LEVEL_LABEL, LEVELS } from "@/lib/exercises";
import { WEEK } from "@/lib/plans";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/exercises/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = EXERCISE_MAP[slug];
  if (!e) return {};
  return { title: `${e.name}: how to do it`, description: e.summary };
}

const findBySlugOrName = (text?: string) => {
  if (!text) return null;
  const hit = EXERCISES.find((x) => text.startsWith(x.name));
  return hit ? { hit, rest: text.slice(hit.name.length) } : null;
};

export default async function ExercisePage({ params }: PageProps<"/exercises/[slug]">) {
  const { slug } = await params;
  const e = EXERCISE_MAP[slug];
  if (!e) notFound();
  const days = WEEK.filter((d) => d.blocks.some((b) => b.items.includes(e.slug)));

  const variant = (label: string, text?: string) => {
    if (!text) return null;
    const link = findBySlugOrName(text);
    return (
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1">
          {link ? (
            <>
              <Link href={`/exercises/${link.hit.slug}`} className="font-semibold text-accent hover:underline">{link.hit.name}</Link>
              {link.rest}
            </>
          ) : (
            text
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/exercises" className="text-sm text-muted hover:text-text">← All exercises</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <ExerciseViewer slug={e.slug} />
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_TONE[e.category]}`}>{CATEGORY_LABEL[e.category]}</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{e.name}</h1>
          <p className="mt-3 text-lg text-muted">{e.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {e.muscles.map((m) => (
              <span key={m} className="rounded-full border border-line px-3 py-1 text-sm">{m}</span>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl font-bold">Sets &amp; reps</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {LEVELS.map((l, i) => (
              <div key={l} className="rounded-2xl border border-line bg-surface p-3">
                <p className="text-xs text-muted">{LEVEL_LABEL[l]}</p>
                <p className="mt-1 font-display text-lg font-bold">{i + 2} sets</p>
                <p className="text-sm">{formatTarget(e, e.target[l])}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Inside a plan, sets, reps and rest also adjust to the week of your 4-week cycle.</p>

          <h2 className="mt-8 font-display text-xl font-bold">How to do it</h2>
          <ol className="mt-3 space-y-3">
            {e.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent font-mono text-sm font-bold text-accent-ink">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-bold text-accent">Coaching cues</h2>
          <ul className="mt-3 space-y-2">
            {e.cues.map((c) => (
              <li key={c} className="flex gap-2"><span className="text-accent">✓</span>{c}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-bold text-pink">Common mistakes</h2>
          <ul className="mt-3 space-y-2">
            {e.mistakes.map((c) => (
              <li key={c} className="flex gap-2"><span className="text-pink">✕</span>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {(e.easier || e.harder) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {variant("Make it easier", e.easier)}
          {variant("Make it harder", e.harder)}
        </div>
      )}

      {days.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">In your weekly plan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {days.map((d) => (
              <Link key={d.key} href={`/workout/${d.key}`} className="rounded-full border border-line px-4 py-2 text-sm hover:border-accent">
                {d.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
