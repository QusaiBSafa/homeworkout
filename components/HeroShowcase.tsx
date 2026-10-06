"use client";

import { useEffect, useState } from "react";
import Figure from "./Figure";
import { usePrefs } from "./Prefs";
import { GenderToggle } from "./Controls";
import { EXERCISE_MAP } from "@/lib/exercises";

const SHOWCASE = ["squat", "push-up", "jumping-jacks", "reverse-lunge", "mountain-climber", "glute-bridge", "burpee", "bird-dog"];

export default function HeroShowcase({ items = SHOWCASE }: { items?: string[] }) {
  const { gender } = usePrefs();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 4200);
    return () => clearInterval(id);
  }, [items.length]);
  const ex = EXERCISE_MAP[items[i % items.length]];
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[3rem] bg-accent/10 blur-3xl" aria-hidden />
      <div className="relative stage rounded-[2rem] border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5">
          <div key={ex.slug} className="rise">
            <p className="text-xs uppercase tracking-wider text-muted">Now showing</p>
            <p className="font-display text-xl font-bold">{ex.name}</p>
          </div>
          <GenderToggle size="sm" />
        </div>
        <Figure key={ex.slug} motion={ex.motion} gender={gender} className="w-full aspect-square rise" title={`${ex.name} demonstration`} />
        <div className="flex justify-center gap-1.5 pb-5">
          {items.map((s, n) => (
            <button
              key={s}
              aria-label={`Show ${EXERCISE_MAP[s].name}`}
              onClick={() => setI(n)}
              className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-accent" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
