import type { Metadata } from "next";
import ProgressView from "@/components/ProgressView";

export const metadata: Metadata = { title: "Your progress", description: "Your workout streak, history and totals." };

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Your progress</h1>
      <p className="mt-2 text-muted">Consistency is what changes your body. Keep the streak alive.</p>
      <ProgressView />
    </div>
  );
}
