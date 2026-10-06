import { Routine, WEEK } from "./plans";
import { POSTURE_ROUTINES } from "./posture";

/** Every routine the workout player can run, keyed by its URL segment. */
const ROUTINES: Routine[] = [...WEEK, ...POSTURE_ROUTINES];
const ROUTINE_MAP: Record<string, Routine> = Object.fromEntries(ROUTINES.map((r) => [r.key, r]));

export const ROUTINE_KEYS: string[] = ROUTINES.map((r) => r.key);

export function getRoutine(key: string): Routine | undefined {
  return ROUTINE_MAP[key];
}
