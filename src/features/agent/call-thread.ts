import { createHash } from "node:crypto";

// A call's thread id: the one the browser minted (passed as a call variable),
// else one derived from the Vapi call id, so every utterance of the same call
// lands in the same thread. Pure.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function callThreadId(minted: unknown, callId: string | null): string | null {
  if (typeof minted === "string" && UUID.test(minted)) return minted.toLowerCase();
  if (!callId) return null;
  const h = createHash("sha256").update(`amplio-call:${callId}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
