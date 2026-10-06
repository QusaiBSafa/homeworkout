-- HomeWorkout database schema (Vercel Postgres / Neon).
-- The app also creates these tables automatically on first use.

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY,
  level       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_key              TEXT NOT NULL,
  title                TEXT NOT NULL,
  level                TEXT NOT NULL,
  week                 INT  NOT NULL,
  duration_sec         INT  NOT NULL,
  exercises_completed  INT  NOT NULL,
  kcal                 INT  NOT NULL,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_sessions_user_time ON workout_sessions (user_id, completed_at DESC);
