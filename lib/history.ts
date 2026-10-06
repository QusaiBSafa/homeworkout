export type SessionRecord = {
  id: number | string;
  day_key: string;
  title: string;
  level: string;
  week: number;
  duration_sec: number;
  exercises_completed: number;
  kcal: number;
  completed_at: string;
};

const KEY = "hw_history";

export function loadLocal(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLocal(rec: SessionRecord) {
  try {
    const all = [rec, ...loadLocal()].slice(0, 500);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

/** Server history when the database is connected, otherwise this browser's history. */
export async function loadHistory(): Promise<{ sessions: SessionRecord[]; source: "cloud" | "device" }> {
  const local = loadLocal();
  try {
    const res = await fetch("/api/sessions", { cache: "no-store" });
    const data = await res.json();
    if (data.db) {
      const sessions: SessionRecord[] = data.sessions;
      return { sessions: sessions.length || !local.length ? sessions : local, source: sessions.length || !local.length ? "cloud" : "device" };
    }
  } catch {}
  return { sessions: local, source: "device" };
}

const dayStr = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function stats(sessions: SessionRecord[]) {
  const days = new Set(sessions.map((s) => dayStr(new Date(s.completed_at))));
  let streak = 0;
  const cursor = new Date();
  // A streak survives until the end of today even if today's workout isn't done yet.
  if (!days.has(dayStr(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const weekAgo = Date.now() - 7 * 86400000;
  return {
    total: sessions.length,
    minutes: Math.round(sessions.reduce((s, r) => s + r.duration_sec, 0) / 60),
    kcal: sessions.reduce((s, r) => s + r.kcal, 0),
    streak,
    thisWeek: sessions.filter((s) => new Date(s.completed_at).getTime() > weekAgo).length,
    days,
  };
}

export { dayStr };
