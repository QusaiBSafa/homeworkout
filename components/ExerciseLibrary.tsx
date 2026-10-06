"use client";

import { useMemo, useState } from "react";
import ExerciseCard from "./ExerciseCard";
import { GenderToggle, LevelPicker } from "./Controls";
import { Category, CATEGORY_LABEL, EXERCISES } from "@/lib/exercises";

const CATS = Object.keys(CATEGORY_LABEL) as Category[];

export default function ExerciseLibrary() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return EXERCISES.filter(
      (e) =>
        (cat === "all" || e.category === cat) &&
        (!s || e.name.toLowerCase().includes(s) || e.muscles.some((m) => m.toLowerCase().includes(s))),
    );
  }, [cat, q]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or muscle"
          className="w-full rounded-full border border-line bg-surface px-5 py-2.5 outline-none placeholder:text-muted focus:border-accent md:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <LevelPicker size="sm" />
          <GenderToggle size="sm" />
        </div>
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {(["all", ...CATS] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${cat === c ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:text-text"}`}
          >
            {c === "all" ? "All" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((e) => (
          <ExerciseCard key={e.slug} exercise={e} />
        ))}
      </div>
      {!list.length && <p className="mt-10 text-center text-muted">No exercises match that search.</p>}
    </>
  );
}
