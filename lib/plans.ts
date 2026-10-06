import { EXERCISE_MAP, Exercise, Level } from "./exercises";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_NAMES: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export type PerLevel<T> = Record<Level, T>;
export const all = <T,>(v: T): PerLevel<T> => ({ beginner: v, intermediate: v, advanced: v });

export type Block = {
  title: string;
  kind: "warmup" | "circuit" | "interval" | "cooldown";
  note?: string;
  rounds: PerLevel<number>;
  /** Interval blocks: fixed work seconds for every exercise. */
  work?: PerLevel<number>;
  /** Rest after each exercise (seconds). */
  rest: PerLevel<number>;
  /** Extra rest between rounds (seconds). */
  roundRest: PerLevel<number>;
  items: string[];
};

/** Any guided session the workout player can run: a day of the weekly plan or a standalone program. */
export type Routine = {
  key: string;
  title: string;
  focus: string;
  type: "strength" | "hiit" | "core" | "recovery" | "posture";
  description: string;
  blocks: Block[];
};

export type DayPlan = Routine & { key: DayKey; type: "strength" | "hiit" | "core" | "recovery" };

const WARMUP: Block = {
  title: "Warm-up",
  kind: "warmup",
  note: "Dynamic moves raise body temperature and prepare joints. Save static stretching for the end.",
  rounds: all(1),
  rest: all(5),
  roundRest: all(0),
  items: ["march-in-place", "arm-circles", "hip-hinge"],
};

const cooldown = (items: string[]): Block => ({
  title: "Cool-down",
  kind: "cooldown",
  note: "Slow breathing and static stretches help you recover and improve flexibility over time.",
  rounds: all(1),
  rest: all(5),
  roundRest: all(0),
  items,
});

const strength = (title: string, items: string[]): Block => ({
  title,
  kind: "circuit",
  note: "Move through each exercise, then repeat. Finish every set with 1 to 3 good reps left in the tank.",
  rounds: { beginner: 2, intermediate: 3, advanced: 4 },
  rest: { beginner: 40, intermediate: 30, advanced: 25 },
  roundRest: { beginner: 75, intermediate: 60, advanced: 60 },
  items,
});

const hict = (title: string, items: string[], note?: string): Block => ({
  title,
  kind: "interval",
  note: note ?? "Work hard for the full interval, rest for the short break. Effort around 8 out of 10.",
  rounds: { beginner: 1, intermediate: 2, advanced: 3 },
  work: { beginner: 25, intermediate: 30, advanced: 40 },
  rest: { beginner: 20, intermediate: 12, advanced: 10 },
  roundRest: { beginner: 60, intermediate: 60, advanced: 60 },
  items,
});

export const WEEK: DayPlan[] = [
  {
    key: "mon",
    title: "Full-Body Strength A",
    focus: "Legs, chest, glutes and core",
    type: "strength",
    description: "A balanced strength circuit hitting every major muscle group with the fundamental movement patterns: squat, push, hinge and brace.",
    blocks: [WARMUP, strength("Strength circuit", ["squat", "push-up", "glute-bridge", "bird-dog", "plank"]), cooldown(["hamstring-stretch", "quad-stretch", "child-pose"])],
  },
  {
    key: "tue",
    title: "HIIT Circuit",
    focus: "Heart, lungs and full body",
    type: "hiit",
    description: "Based on the high-intensity circuit protocol from the ACSM's Health & Fitness Journal: 12 bodyweight exercises alternating muscle groups so you can keep the intensity high.",
    blocks: [
      WARMUP,
      hict(
        "The 12-exercise circuit",
        ["jumping-jacks", "wall-sit", "push-up", "crunch", "high-knees", "squat", "superman", "plank", "mountain-climber", "reverse-lunge", "knee-push-up", "side-plank"],
        "Alternate upper body, lower body and core so one area recovers while another works.",
      ),
      cooldown(["hamstring-stretch", "hip-flexor-stretch", "child-pose"]),
    ],
  },
  {
    key: "wed",
    title: "Core & Back Health",
    focus: "Core stability and posture",
    type: "core",
    description: "Spine-friendly core training built around exercises that build endurance without loading the lower back, plus mobility work for the hips.",
    blocks: [
      WARMUP,
      {
        ...strength("Core circuit", ["dead-bug", "bird-dog", "side-plank", "leg-raise", "superman", "glute-bridge"]),
        rounds: { beginner: 2, intermediate: 3, advanced: 3 },
        note: "Quality over speed. Move slowly and keep your lower back neutral.",
      },
      cooldown(["cobra-stretch", "child-pose", "hip-flexor-stretch"]),
    ],
  },
  {
    key: "thu",
    title: "Full-Body Strength B",
    focus: "Single-leg strength, shoulders and balance",
    type: "strength",
    description: "Single-leg work fixes left-right imbalances and builds balance, while pike push-ups strengthen your shoulders overhead.",
    blocks: [
      WARMUP,
      strength("Strength circuit", ["reverse-lunge", "pike-push-up", "single-leg-deadlift", "push-up", "side-plank", "calf-raise"]),
      cooldown(["quad-stretch", "hamstring-stretch", "cobra-stretch"]),
    ],
  },
  {
    key: "fri",
    title: "HIIT Power",
    focus: "Conditioning and explosive power",
    type: "hiit",
    description: "Short, hard bursts of explosive bodyweight moves. Brief vigorous efforts like these improve fitness in a fraction of the time of steady cardio.",
    blocks: [WARMUP, hict("Power intervals", ["burpee", "squat-jump", "mountain-climber", "high-knees", "jumping-jacks", "plank"]), cooldown(["hamstring-stretch", "quad-stretch", "child-pose"])],
  },
  {
    key: "sat",
    title: "Legs & Glutes",
    focus: "Lower-body strength and endurance",
    type: "strength",
    description: "A lower-body focused session for strong legs and glutes, finishing with a short conditioning burst.",
    blocks: [
      WARMUP,
      strength("Leg circuit", ["squat", "reverse-lunge", "glute-bridge", "single-leg-deadlift", "wall-sit", "calf-raise"]),
      {
        ...hict("Finisher", ["squat-jump", "high-knees"]),
        rounds: { beginner: 1, intermediate: 2, advanced: 2 },
        note: "One last push. Give it everything.",
      },
      cooldown(["quad-stretch", "hip-flexor-stretch", "hamstring-stretch"]),
    ],
  },
  {
    key: "sun",
    title: "Active Recovery",
    focus: "Mobility, breathing and an easy walk",
    type: "recovery",
    description: "Recovery is where you get fitter. Do this gentle mobility flow, then take an easy 20 to 30 minute walk outside if you can.",
    blocks: [
      WARMUP,
      {
        title: "Mobility flow",
        kind: "cooldown",
        note: "Move slowly and breathe deeply. Nothing here should feel hard.",
        rounds: all(1),
        rest: all(8),
        roundRest: all(0),
        items: ["bird-dog", "glute-bridge", "cobra-stretch", "child-pose", "hip-flexor-stretch", "quad-stretch", "hamstring-stretch"],
      },
    ],
  },
];

export const WEEK_MAP: Record<DayKey, DayPlan> = Object.fromEntries(WEEK.map((d) => [d.key, d])) as Record<DayKey, DayPlan>;

export function todayKey(date = new Date()): DayKey {
  return DAY_KEYS[(date.getDay() + 6) % 7];
}

/* ---------- Progression ---------- */

export const WEEK_PHASES = [
  { week: 1, name: "Foundation", factor: 1, roundDelta: 0, text: "Learn the movements and find your baseline." },
  { week: 2, name: "Build", factor: 1.15, roundDelta: 0, text: "About 15% more reps and time than week 1." },
  { week: 3, name: "Push", factor: 1.3, roundDelta: 0, text: "Peak week, about 30% more than week 1." },
  { week: 4, name: "Recover", factor: 0.9, roundDelta: -1, text: "One less round so your body can adapt. Then start again, a little stronger." },
];

/** Week within the 4-week cycle (1-4) given the date the user started. */
export function cycleWeek(startDate: string | null, now = new Date()): number {
  if (!startDate) return 1;
  const start = new Date(startDate + "T00:00:00");
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (days < 0) return 1;
  return (Math.floor(days / 7) % 4) + 1;
}

/* Beginner-friendly substitutions for the hardest moves. */
const BEGINNER_SWAPS: Record<string, string> = {
  "push-up": "knee-push-up",
  "pike-push-up": "knee-push-up",
  "squat-jump": "squat",
  "burpee": "squat",
};

export function resolveExercise(slug: string, level: Level): Exercise {
  const s = level === "beginner" ? (BEGINNER_SWAPS[slug] ?? slug) : slug;
  return EXERCISE_MAP[s];
}

/* ---------- Session building ---------- */

export type ExerciseStep = {
  kind: "exercise";
  exercise: Exercise;
  measure: "reps" | "time";
  amount: number;
  /** Do the amount on each side (false inside interval blocks, where you switch halfway). */
  perSide: boolean;
  block: string;
  round: number;
  rounds: number;
};
export type RestStep = { kind: "rest"; seconds: number; label: string };
export type Step = ExerciseStep | RestStep;

const roundTo = (n: number, step: number) => Math.max(step, Math.round(n / step) * step);

export function buildBlock(block: Block, level: Level, week: number) {
  const phase = WEEK_PHASES[(week - 1) % 4];
  const scalable = block.kind === "circuit" || block.kind === "interval";
  const rounds = Math.max(1, block.rounds[level] + (scalable ? phase.roundDelta : 0));
  const factor = scalable ? phase.factor : 1;
  const items = block.items.map((slug) => {
    const exercise = resolveExercise(slug, level);
    if (block.kind === "interval") {
      return { exercise, measure: "time" as const, amount: roundTo(block.work![level] * (phase.factor > 1 ? 1 + (phase.factor - 1) / 2 : 1), 5) };
    }
    const base = exercise.target[level];
    const amount = exercise.measure === "reps" ? Math.max(1, Math.round(base * factor)) : roundTo(base * factor, 5);
    return { exercise, measure: exercise.measure, amount };
  });
  return { rounds, items, rest: block.rest[level], roundRest: block.roundRest[level] };
}

export function buildSteps(day: Routine, level: Level, week: number): Step[] {
  const steps: Step[] = [];
  for (const block of day.blocks) {
    const b = buildBlock(block, level, week);
    for (let r = 1; r <= b.rounds; r++) {
      b.items.forEach((it, i) => {
        steps.push({
          kind: "exercise",
          exercise: it.exercise,
          measure: it.measure,
          amount: it.amount,
          perSide: Boolean(it.exercise.perSide) && block.kind !== "interval",
          block: block.title,
          round: r,
          rounds: b.rounds,
        });
        const lastInRound = i === b.items.length - 1;
        const rest = lastInRound ? (r < b.rounds ? b.roundRest : 0) : b.rest;
        if (rest > 0) steps.push({ kind: "rest", seconds: rest, label: lastInRound ? "Round complete" : "Rest" });
      });
    }
  }
  // Drop a trailing rest.
  while (steps.length && steps[steps.length - 1].kind === "rest") steps.pop();
  return steps;
}

export const SECONDS_PER_REP = 3.5;

export function stepSeconds(s: Step) {
  if (s.kind === "rest") return s.seconds;
  if (s.measure === "time") return s.amount * (s.perSide ? 2 : 1);
  return s.amount * (s.exercise.repSeconds ?? SECONDS_PER_REP) * (s.perSide ? 2 : 1);
}

export function summarize(steps: Step[], weightKg = 70) {
  let seconds = 0;
  let kcal = 0;
  let exercises = 0;
  for (const s of steps) {
    const sec = stepSeconds(s) + (s.kind === "exercise" ? 5 : 0);
    seconds += sec;
    const met = s.kind === "exercise" ? s.exercise.met : 2;
    kcal += (met * 3.5 * weightKg) / 200 * (sec / 60);
    if (s.kind === "exercise") exercises++;
  }
  return { minutes: Math.round(seconds / 60), kcal: Math.round(kcal), exercises };
}
