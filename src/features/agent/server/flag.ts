import "server-only";

// Agent mode is behind one flag on both sides (the UI reads the same name):
// NEXT_PUBLIC_FF_AGENT_MODE=1 turns it on; without it the routes 404 and the
// existing assistant is untouched.
export function agentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FF_AGENT_MODE === "1";
}
