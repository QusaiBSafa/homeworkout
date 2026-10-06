"use client";

import Link from "next/link";
import Figure from "./Figure";
import { usePrefs } from "./Prefs";
import { CATEGORY_LABEL, CATEGORY_TONE, Exercise, formatTarget } from "@/lib/exercises";


export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { gender, level } = usePrefs();
  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="group rounded-3xl border border-line bg-surface overflow-hidden transition hover:-translate-y-0.5 hover:border-accent/40"
    >
      <div className="stage aspect-[4/3]">
        <Figure motion={exercise.motion} gender={gender} className="h-full w-full" title={`${exercise.name} demonstration`} />
      </div>
      <div className="p-4">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_TONE[exercise.category]}`}>{CATEGORY_LABEL[exercise.category]}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-tight">{exercise.name}</h3>
        <p className="mt-1 text-sm text-muted line-clamp-1">{exercise.muscles.join(" · ")}</p>
        <p className="mt-3 inline-flex rounded-full bg-surface-2 px-3 py-1 text-xs font-medium">
          {formatTarget(exercise, exercise.target[level])}
        </p>
      </div>
    </Link>
  );
}
