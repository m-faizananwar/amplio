import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/features/auth/constants";
import { viewerFromToken } from "@/features/auth/server/session";
import { readToolCall, toolResult } from "@/features/voice/server/vapi-webhook";
import { webhookSecret } from "@/features/voice/server/voice-token";
import { callThreadId } from "@/features/agent/call-thread";
import { agentEnabled } from "@/features/agent/server/flag";
import { allowTurn } from "@/features/agent/server/rate-limit";
import { type SettleCard, voiceTurn } from "@/features/agent/server/voice-turn";
import type { AgentEvent } from "@/features/agent/events";
import type { Viewer } from "@/features/auth/server/session";
import type { VapiToolCall } from "@/features/voice/server/vapi-webhook";

export const dynamic = "force-dynamic";

// Vapi server URL. Verifies the shared secret, identifies the user by the
// headless session started in /api/voice/session, then forwards the words to
// /api/voice/intent with that session's cookie and csrf token — the webhook
// never runs an action itself, so both providers share one path.
export async function POST(request: Request) {
  if (request.headers.get("x-vapi-secret") !== webhookSecret()) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const call = readToolCall(await request.json().catch(() => null));
  if (!call) return NextResponse.json({ results: [] });
  // the viewer comes from the signed session token in the call's variables,
  // checked on every request, never from anything the model says
  const viewer = await viewerFromToken(call.voiceToken);
  if (!viewer) return NextResponse.json(toolResult(call.id, "Your voice session expired. Reload the page and start again."));
  if (agentEnabled() && (viewer.brand || viewer.creator)) return NextResponse.json(toolResult(call.id, await agentSpeech(call, viewer, new URL(request.url).origin)));

  const res = await fetch(new URL("/api/voice/intent", request.url), {
    method: "POST",
    headers: { "content-type": "application/json", cookie: `${SESSION_COOKIE}=${call.voiceToken}`, "x-csrf-token": viewer.csrfToken },
    body: JSON.stringify({ transcript: call.transcript, confirmed: call.confirmed }),
  }).catch(() => null);
  const body = res ? ((await res.json().catch(() => null)) as { speech?: string } | null) : null;
  return NextResponse.json(toolResult(call.id, body?.speech ?? "Something went wrong. Try again."));
}

// With agent mode on, what the caller said goes through the agent (same loop,
// tools, memory and confirm gate as chat) inside the call's thread, and the
// call speaks the result; the screen follows the thread's feed.
async function agentSpeech(call: VapiToolCall, viewer: Viewer, origin: string): Promise<string> {
  const fr = call.locale === "fr";
  if (!allowTurn(viewer.userId)) return fr ? "On va un peu vite. Réessayez dans une minute." : "That's a lot at once. Give me a minute and try again.";
  try {
    const threadId = callThreadId(call.threadId, call.callId);
    const settle: SettleCard = (id, decision) => settleAsCall({ origin, token: call.voiceToken, csrf: viewer.csrfToken, locale: call.locale, body: { id, decision, threadId } });
    const speech = await voiceTurn({ viewer, locale: call.locale, transcript: call.transcript, threadId, settle, history: call.history });
    return speech || (fr ? "C’est fait." : "Done.");
  } catch (error) {
    console.error("[voice] agent turn failed", { userId: viewer.userId, error: error instanceof Error ? error.message : String(error) });
    return fr ? "Quelque chose n’a pas marché de mon côté. Pouvez-vous répéter ?" : "Something went wrong on my side. Could you say that again?";
  }
}

// A spoken yes or no goes through the same route a tap does, as the call's
// own session (its cookie and csrf token), so the actions run on their usual
// auth; the confirm stream's events come back for the call to speak.
type Settle = { origin: string; token: string; csrf: string; locale: "en" | "fr"; body: { id: string; decision: "confirm" | "cancel"; threadId: string | null } };
async function settleAsCall({ origin, token, csrf, locale, body }: Settle): Promise<AgentEvent[]> {
  const res = await fetch(new URL("/api/agent/confirm", origin), {
    method: "POST",
    headers: { "content-type": "application/json", cookie: `${SESSION_COOKIE}=${token}`, "x-csrf-token": csrf, "accept-language": locale },
    body: JSON.stringify(body),
  });
  const raw = res.ok ? await res.text() : "";
  return raw.split("\n\n").filter((f) => f.startsWith("data: ")).map((f) => JSON.parse(f.slice("data: ".length)) as AgentEvent);
}
