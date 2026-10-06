import type { Metadata } from "next";
import PlanView from "@/components/PlanView";

export const metadata: Metadata = {
  title: "Your 7-day plan",
  description: "A research-based weekly home workout plan for beginner, intermediate and advanced levels, progressing over 4-week cycles.",
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Your 7-day plan</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Three strength days, two HIIT days, one core day and one recovery day. Pick your level and the plan sets the exercises, sets, reps and rest for you.
      </p>
      <PlanView />
    </div>
  );
}
