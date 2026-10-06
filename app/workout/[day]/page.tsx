import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import { DAY_KEYS, DayKey, WEEK_MAP } from "@/lib/plans";

export function generateStaticParams() {
  return DAY_KEYS.map((day) => ({ day }));
}

export async function generateMetadata({ params }: PageProps<"/workout/[day]">): Promise<Metadata> {
  const { day } = await params;
  const plan = WEEK_MAP[day as DayKey];
  return plan ? { title: plan.title, description: plan.description } : {};
}

export default async function WorkoutPage({ params }: PageProps<"/workout/[day]">) {
  const { day } = await params;
  if (!DAY_KEYS.includes(day as DayKey)) notFound();
  return <WorkoutPlayer dayKey={day as DayKey} />;
}
