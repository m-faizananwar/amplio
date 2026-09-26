// Feature flags read on the server. The agent (/…/agent) ships behind
// AGENT_MODE; NEXT_PUBLIC_FF_AGENT_MODE is honoured too so the client can
// share the same switch.
const ON = new Set(["1", "true", "on", "yes"]);

export function agentModeOn(): boolean {
  const raw = process.env.AGENT_MODE ?? process.env.NEXT_PUBLIC_FF_AGENT_MODE ?? "";
  return ON.has(raw.trim().toLowerCase());
}
