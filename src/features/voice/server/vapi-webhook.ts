import "server-only";

export type VapiToolCall = { id: string; transcript: string; confirmed: boolean; voiceToken: string; callId: string | null; threadId: unknown; locale: "en" | "fr" };

type ToolCallPayload = {
  message?: {
    type?: string;
    toolCallList?: Array<{ id: string; name?: string; function?: { name?: string; arguments?: unknown }; arguments?: unknown }>;
    call?: { id?: string; assistantOverrides?: { variableValues?: Record<string, unknown> }; metadata?: Record<string, unknown> };
  };
};

const asRecord = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

// Vapi's "tool-calls" server message → the one call we care about. Arguments
// arrive as an object or a JSON string depending on the model provider.
export function readToolCall(payload: unknown): VapiToolCall | null {
  const message = (payload as ToolCallPayload | null)?.message;
  if (message?.type !== "tool-calls") return null;
  const call = message.toolCallList?.find((c) => (c.function?.name ?? c.name) === "command");
  if (!call) return null;
  const raw = call.function?.arguments ?? call.arguments;
  const args = asRecord(typeof raw === "string" ? JSON.parse(raw) : raw);
  const vars = { ...asRecord(message.call?.metadata), ...asRecord(message.call?.assistantOverrides?.variableValues) };
  const voiceToken = typeof vars.voiceToken === "string" ? vars.voiceToken : "";
  const transcript = typeof args.transcript === "string" ? args.transcript : "";
  if (!voiceToken || !transcript) return null;
  const callId = typeof message.call?.id === "string" ? message.call.id : null;
  return { id: call.id, transcript, confirmed: args.confirmed === true, voiceToken, callId, threadId: vars.threadId, locale: vars.locale === "fr" ? "fr" : "en" };
}

export const toolResult = (toolCallId: string, result: string) => ({ results: [{ toolCallId, result }] });
