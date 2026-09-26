import "server-only";

export type VapiTurn = { role: "user" | "assistant"; text: string };
export type VapiToolCall = { id: string; transcript: string; confirmed: boolean; voiceToken: string; callId: string | null; threadId: unknown; locale: "en" | "fr"; history: VapiTurn[] };

type ToolCallPayload = {
  message?: {
    type?: string;
    toolCallList?: Array<{ id: string; name?: string; function?: { name?: string; arguments?: unknown }; arguments?: unknown; parameters?: unknown }>;
    artifact?: { messages?: Array<{ role?: string; message?: string }> };
    call?: { id?: string; assistantOverrides?: { variableValues?: Record<string, unknown> }; metadata?: Record<string, unknown> };
  };
};

const asRecord = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

const HISTORY_MAX = 20;

// The call's own transcript, when Vapi includes it: the history a turn uses
// where threads can't be stored. The utterance being answered is left out.
function historyOf(messages: Array<{ role?: string; message?: string }> | undefined, current: string): VapiTurn[] {
  const turns = (messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "bot" || m.role === "assistant") && typeof m.message === "string" && m.message.trim())
    .map((m): VapiTurn => ({ role: m.role === "user" ? "user" : "assistant", text: String(m.message) }));
  if (turns.at(-1)?.role === "user" && turns.at(-1)?.text.trim() === current.trim()) turns.pop();
  return turns.slice(-HISTORY_MAX);
}

function parseArgs(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "string") return asRecord(raw);
  try { return asRecord(JSON.parse(raw)); } catch { return {}; }
}

// Vapi's "tool-calls" server message → the one call we care about. Arguments
// arrive as `function.arguments`, `arguments` or `parameters`, as an object or
// a JSON string, depending on the model provider and API version.
export function readToolCall(payload: unknown): VapiToolCall | null {
  const message = (payload as ToolCallPayload | null)?.message;
  if (message?.type !== "tool-calls") return null;
  const call = message.toolCallList?.find((c) => (c.function?.name ?? c.name) === "command");
  if (!call) return null;
  const args = parseArgs(call.function?.arguments ?? call.arguments ?? call.parameters);
  const vars = { ...asRecord(message.call?.metadata), ...asRecord(message.call?.assistantOverrides?.variableValues) };
  const voiceToken = typeof vars.voiceToken === "string" ? vars.voiceToken : "";
  const transcript = typeof args.transcript === "string" ? args.transcript : "";
  if (!voiceToken || !transcript) return null;
  const callId = typeof message.call?.id === "string" ? message.call.id : null;
  return { id: call.id, transcript, confirmed: args.confirmed === true, voiceToken, callId, threadId: vars.threadId, locale: vars.locale === "fr" ? "fr" : "en", history: historyOf(message.artifact?.messages, transcript) };
}

export const toolResult = (toolCallId: string, result: string) => ({ results: [{ toolCallId, result }] });
