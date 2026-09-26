import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { agentEnabled } from "@/features/agent/server/flag";
import { openThread } from "@/features/agent/server/memory";
import { createHeadlessSession, getViewer } from "@/features/auth/server/session";
import { ensureAssistant, isVapiConfigured } from "@/features/voice/server/vapi-assistant";

export const dynamic = "force-dynamic";

const GREETING = { en: "Hi, it's your Amplio agent. What are we working on?", fr: "Bonjour, c’est votre agent Amplio. Sur quoi on travaille ?" };

// GET → { provider: "vapi", assistantId, publicKey, voiceToken, threadId, overrides } or { provider: "web-speech" }.
// The voice token is a one-hour headless session: the Vapi webhook verifies it
// on every request and acts as this user, nothing else. With agent mode the
// call gets its own thread (null if threads can't be stored) and `overrides`
// is passed as-is to vapi.start(): the greeting in the caller's language and
// the variables the webhook reads (voiceToken, threadId, locale).
export async function GET(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isVapiConfigured()) return NextResponse.json({ provider: "web-speech" });
  try {
    const serverUrl = new URL("/api/voice/vapi", request.url).toString();
    const locale = (await getLocale()) === "fr" ? "fr" : "en";
    // independent, so together: a cold start waits on the slowest, not the sum
    const [assistantId, voiceToken, thread] = await Promise.all([
      ensureAssistant(serverUrl),
      createHeadlessSession(viewer.userId),
      agentEnabled() ? openThread(viewer.userId, null, { title: locale === "fr" ? "Appel" : "Call", kind: "call" }) : Promise.resolve(null),
    ]);
    const variableValues = { voiceToken, threadId: thread?.threadId ?? null, locale };
    return NextResponse.json({
      provider: "vapi",
      assistantId,
      publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
      voiceToken,
      threadId: thread?.threadId ?? null,
      variableValues,
      overrides: { firstMessage: GREETING[locale], variableValues, metadata: variableValues },
    });
  } catch (error) {
    console.error("[voice] vapi session failed, falling back to web speech", { userId: viewer.userId, error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ provider: "web-speech" });
  }
}
