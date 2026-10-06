import type { Metadata } from "next";
import ExerciseLibrary from "@/components/ExerciseLibrary";

export const metadata: Metadata = {
  title: "Exercise library",
  description: "Every bodyweight exercise in the plan, with animated demonstrations, step-by-step form cues and sets and reps for your level.",
};

export default function ExercisesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Exercise library</h1>
      <p className="mt-2 max-w-2xl text-muted">No equipment needed. Tap any exercise for step-by-step instructions, form cues, common mistakes and easier or harder versions.</p>
      <ExerciseLibrary />
    </div>
  );
}
