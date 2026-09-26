import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { MINUTE_MS } from "../constants";

// A pending action is a signed id, not a row: the tool name, its arguments,
// who may run it and until when, HMAC-signed and bound to the user's session
// (its CSRF token). Nothing executes from the loop; only /api/agent/confirm
// with a valid, unexpired id from the same user and session runs it. No
// table, so it works on any instance and on prod before any migration.

const PENDING_MINUTES = 10;
export const PENDING_TTL_MS = PENDING_MINUTES * MINUTE_MS;

export type PendingAction = { tool: string; args: Record<string, unknown>; userId: string; exp: number };

function key(): Buffer {
  // A dedicated secret when set; otherwise derived from a server-only value
  // that never reaches the client (the database URL), so it works unset.
  const base = process.env.AGENT_SIGNING_SECRET || resolveDatabaseUrl(process.env)?.url || "local-dev";
  return createHash("sha256").update(`agent-confirm:${base}`).digest();
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString();
const sign = (payload: string, session: string) => createHmac("sha256", key()).update(`${payload}.${session}`).digest("base64url");

export function createPending(action: Omit<PendingAction, "exp">, session: string, now = Date.now()): { id: string; expiresAt: string } {
  const exp = now + PENDING_TTL_MS;
  const payload = b64(JSON.stringify({ ...action, exp }));
  return { id: `${payload}.${sign(payload, session)}`, expiresAt: new Date(exp).toISOString() };
}

export type PendingCheck = { ok: true; action: PendingAction } | { ok: false; reason: "malformed" | "signature" | "expired" | "user" };

// Single use: a confirmed id is remembered until it would have expired anyway.
// Per instance (serverless may run several), so the actions keep their own
// guards too (a booking or a payment refuses to happen twice).
const used = new Map<string, number>();
export function claimPending(id: string, exp: number, now = Date.now()): boolean {
  for (const [k, e] of used) if (e < now) used.delete(k);
  if (used.has(id)) return false;
  used.set(id, exp);
  return true;
}

export function readPending(id: string, who: { userId: string; session: string }, now = Date.now()): PendingCheck {
  const [payload, mac] = id.split(".");
  if (!payload || !mac) return { ok: false, reason: "malformed" };
  const expected = Buffer.from(sign(payload, who.session));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "signature" };
  let action: PendingAction;
  try { action = JSON.parse(unb64(payload)); } catch { return { ok: false, reason: "malformed" }; }
  if (action.userId !== who.userId) return { ok: false, reason: "user" };
  if (action.exp < now) return { ok: false, reason: "expired" };
  return { ok: true, action };
}
