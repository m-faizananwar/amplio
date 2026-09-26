import "server-only";
import { MINUTE_MS } from "../constants";

// Per user, per instance: 20 turns in 10 minutes. Best-effort on serverless
// (each instance counts its own), which is enough to stop a runaway loop or
// a stuck client from burning the model budget.
export const TURN_LIMIT = 20;
const WINDOW_MINUTES = 10;
export const TURN_WINDOW_MS = WINDOW_MINUTES * MINUTE_MS;
const hits = new Map<string, number[]>();

export function allowTurn(userId: string, now = Date.now()): boolean {
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < TURN_WINDOW_MS);
  if (recent.length >= TURN_LIMIT) { hits.set(userId, recent); return false; }
  recent.push(now);
  hits.set(userId, recent);
  return true;
}
