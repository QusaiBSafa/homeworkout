"use client";

import { usePrefs } from "./Prefs";
import { LEVEL_LABEL, LEVELS } from "@/lib/exercises";

export { LEVEL_LABEL };

export function Segmented<T extends string>({ value, options, onChange, size = "md" }: { value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-surface p-1" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full font-medium transition ${size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} ${value === o.value ? "bg-text text-bg" : "text-muted hover:text-text"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function GenderToggle({ size }: { size?: "sm" | "md" }) {
  const { gender, set } = usePrefs();
  return (
    <Segmented
      size={size}
      value={gender}
      onChange={(g) => set({ gender: g })}
      options={[
        { value: "female", label: "Woman" },
        { value: "male", label: "Man" },
      ]}
    />
  );
}

export function LevelPicker({ size }: { size?: "sm" | "md" }) {
  const { level, set } = usePrefs();
  return <Segmented size={size} value={level} onChange={(l) => set({ level: l })} options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }))} />;
}
