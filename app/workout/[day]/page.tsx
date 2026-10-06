import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import { getRoutine, ROUTINE_KEYS } from "@/lib/routines";

export function generateStaticParams() {
  return ROUTINE_KEYS.map((day) => ({ day }));
}

export async function generateMetadata({ params }: PageProps<"/workout/[day]">): Promise<Metadata> {
  const { day } = await params;
  const plan = getRoutine(day);
  return plan ? { title: plan.title, description: plan.description } : {};
}

export default async function WorkoutPage({ params }: PageProps<"/workout/[day]">) {
  const { day } = await params;
  if (!getRoutine(day)) notFound();
  return <WorkoutPlayer routineKey={day} />;
}
