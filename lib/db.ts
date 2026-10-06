import "server-only";
import { neon } from "@neondatabase/serverless";

// Vercel's Postgres (Neon) integration exposes DATABASE_URL; older Vercel Postgres stores use POSTGRES_URL.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const hasDb = Boolean(url);

export const sql = url ? neon(url) : null;

let ready: Promise<void> | null = null;

/** Creates the tables on first use so a fresh database works without a manual migration. */
export function ensureSchema() {
  if (!sql) return Promise.resolve();
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      level TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS workout_sessions (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day_key TEXT NOT NULL,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      week INT NOT NULL,
      duration_sec INT NOT NULL,
      exercises_completed INT NOT NULL,
      kcal INT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS workout_sessions_user_time ON workout_sessions (user_id, completed_at DESC)`;
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
