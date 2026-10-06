# HomeWorkout

Free, science-backed home workouts. A 7-day plan for beginner, intermediate and advanced levels, animated demonstrations for every exercise (switchable between a woman and a man), exact sets and reps, a guided workout timer with voice and beeps, and progress tracking stored in Postgres.

## Features

- **29 bodyweight exercises** with smooth animated figures, step-by-step instructions, coaching cues, common mistakes and easier/harder versions.
- **Research-based weekly plan**: 3 strength days, 2 HIIT days (based on Klika & Jordan's high-intensity circuit protocol), a core and back-health day, and an active recovery day.
- **Three levels and a 4-week progression cycle** (Foundation → Build → Push → Recover), so reps, time and rounds grow week by week.
- **Guided workout player**: countdown, timed and rep-based sets, rest timer with "next up" preview, side-switch cues, voice coaching, screen wake lock and keyboard shortcuts (space, ←, →).
- **Progress**: streak, totals, activity heatmap and history. No sign-up; an anonymous cookie links the browser to its history in Postgres, with a localStorage fallback when no database is connected.
- **The Science page** explains every design decision with citations (WHO 2020, ACSM, Schoenfeld 2017, Gillen 2016 and more).

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Neon serverless Postgres (Vercel Postgres).

The animations are a small 2D forward-kinematics rig (`lib/figure.ts`): each exercise is a set of keyframed joint angles (`lib/exercises.ts`) that `components/Figure.tsx` interpolates and renders as SVG.

## Run locally

```bash
npm install
npm run dev
```

Without `DATABASE_URL` the app works fully and keeps history in the browser.

## Deploy to Vercel with Postgres

1. Import this repository in Vercel (framework preset: Next.js).
2. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it to the project. This adds `DATABASE_URL` to the environment.
3. Redeploy. Tables are created automatically on first use. To create them up front instead:
   ```bash
   vercel env pull .env.local
   node --env-file=.env.local scripts/migrate.mjs
   ```
4. Check `/api/health`; it reports `"db": "connected"` when the database is reachable.

## Database

`db/schema.sql` defines two tables: `users` (anonymous id, level) and `workout_sessions` (one row per completed workout). API: `GET /api/sessions` returns the current browser's history, `POST /api/sessions` records a workout.

---

General fitness guidance, not medical advice.
