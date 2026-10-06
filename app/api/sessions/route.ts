import { NextResponse } from "next/server";
import { ensureSchema, hasDb, sql } from "@/lib/db";
import { getUserId } from "@/lib/identity";
import { ROUTINE_KEYS } from "@/lib/routines";
import { LEVELS, Level } from "@/lib/exercises";

export const dynamic = "force-dynamic";

export type SessionRow = {
  id: number;
  day_key: string;
  title: string;
  level: string;
  week: number;
  duration_sec: number;
  exercises_completed: number;
  kcal: number;
  completed_at: string;
};

export async function GET() {
  if (!hasDb || !sql) return NextResponse.json({ db: false, sessions: [] });
  const uid = await getUserId(false);
  if (!uid) return NextResponse.json({ db: true, sessions: [] });
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, day_key, title, level, week, duration_sec, exercises_completed, kcal, completed_at
      FROM workout_sessions WHERE user_id = ${uid}
      ORDER BY completed_at DESC LIMIT 500`) as SessionRow[];
    return NextResponse.json({ db: true, sessions: rows });
  } catch (e) {
    console.error("GET /api/sessions failed", e);
    return NextResponse.json({ db: false, sessions: [], error: "Database unavailable" }, { status: 503 });
  }
}

const int = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null;

export async function POST(req: Request) {
  // Without a database the client keeps history on the device.
  if (!hasDb || !sql) return NextResponse.json({ db: false });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const dayKey = body.dayKey as string;
  const level = body.level as Level;
  const title = typeof body.title === "string" ? body.title.slice(0, 80) : "";
  const week = int(body.week, 1, 4);
  const duration = int(body.durationSec, 0, 6 * 3600);
  const exercises = int(body.exercisesCompleted, 0, 500);
  const kcal = int(body.kcal, 0, 5000);
  if (!ROUTINE_KEYS.includes(dayKey) || !LEVELS.includes(level) || !title || week === null || duration === null || exercises === null || kcal === null) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
  const uid = (await getUserId(true))!;
  try {
    await ensureSchema();
    await sql`INSERT INTO users (id, level) VALUES (${uid}, ${level})
      ON CONFLICT (id) DO UPDATE SET level = EXCLUDED.level, last_seen = now()`;
    const [row] = (await sql`
      INSERT INTO workout_sessions (user_id, day_key, title, level, week, duration_sec, exercises_completed, kcal)
      VALUES (${uid}, ${dayKey}, ${title}, ${level}, ${week}, ${duration}, ${exercises}, ${kcal})
      RETURNING id, day_key, title, level, week, duration_sec, exercises_completed, kcal, completed_at`) as SessionRow[];
    return NextResponse.json({ db: true, session: row }, { status: 201 });
  } catch (e) {
    console.error("POST /api/sessions failed", e);
    return NextResponse.json({ db: false, error: "Database unavailable" }, { status: 503 });
  }
}
