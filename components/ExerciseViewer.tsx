"use client";

import { useState } from "react";
import Figure from "./Figure";
import { usePrefs } from "./Prefs";
import { GenderToggle, Segmented } from "./Controls";
import { EXERCISE_MAP } from "@/lib/exercises";

export default function ExerciseViewer({ slug }: { slug: string }) {
  const e = EXERCISE_MAP[slug];
  const { gender } = usePrefs();
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState("1");
  return (
    <div className="stage relative rounded-[2rem] border border-line">
      <Figure motion={e.motion} gender={gender} paused={paused} speed={Number(speed)} className="w-full aspect-square" title={`${e.name} demonstration`} />
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4">
        <button
          onClick={() => setPaused((p) => !p)}
          className="grid h-10 w-10 place-items-center rounded-full bg-text text-bg"
          aria-label={paused ? "Play animation" : "Pause animation"}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
          )}
        </button>
        <div className="flex gap-2">
          <Segmented size="sm" value={speed} onChange={setSpeed} options={[{ value: "0.5", label: "0.5×" }, { value: "1", label: "1×" }]} />
          <GenderToggle size="sm" />
        </div>
      </div>
    </div>
  );
}
