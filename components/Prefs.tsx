"use client";

import { useSyncExternalStore } from "react";
import type { Gender } from "./Figure";
import type { Level } from "@/lib/exercises";
import { cycleWeek, DayKey, todayKey } from "@/lib/plans";

type Prefs = { gender: Gender; level: Level; startDate: string | null; voice: boolean };

const KEY = "hw_prefs";
const DEFAULTS: Prefs = { gender: "female", level: "beginner", startDate: null, voice: true };

const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* A tiny localStorage-backed store, read through useSyncExternalStore so SSR and hydration stay consistent. */
let current: Prefs | null = null;
const listeners = new Set<() => void>();

function read(): Prefs {
  if (current) return current;
  let stored: Partial<Prefs> = {};
  try {
    stored = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {}
  current = { ...DEFAULTS, ...stored, startDate: stored.startDate ?? isoToday() };
  persist(current);
  return current;
}

function persist(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function set(p: Partial<Prefs>) {
  current = { ...read(), ...p };
  persist(current);
  listeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function usePrefs() {
  const prefs = useSyncExternalStore(subscribe, read, () => DEFAULTS);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return { ...prefs, week: cycleWeek(prefs.startDate), ready, set };
}

/** Today's day key on the client; null during server render. */
export function useToday(): DayKey | null {
  return useSyncExternalStore(noopSubscribe, () => todayKey(), () => null);
}
