import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import type { AgentEvent } from "../events";
import { speakable, speechFor } from "../speech";
import { decideSpoken } from "../voice-rule";
import type { Turn } from "./loop";
import { getPending } from "./memory";
import { agentTurn } from "./turn";

// Settling a card runs the app's own actions, which read the user from the
// request's session; the caller passes a function that posts to
// /api/agent/confirm as the call's session and returns the events.
export type SettleCard = (id: string, decision: "confirm" | "cancel") => Promise<AgentEvent[]>;
type VoiceTurn = { viewer: Viewer; locale: "en" | "fr"; transcript: string; threadId: string | null; settle: SettleCard; history?: Turn[] };

// One thing the caller said. A yes or no settles the card pending in this
// thread right now (and nothing else); anything else is a turn of the agent.
// Everything lands in the thread's feed for the screen; the return value is
// what the call says.
export async function voiceTurn({ viewer, locale, transcript, threadId, settle, history }: VoiceTurn): Promise<string> {
  const pending = threadId ? await getPending(threadId) : null;
  const decision = decideSpoken(transcript, pending);
  if (decision.kind === "nothing") return locale === "fr" ? "Rien n’attend de confirmation pour l’instant. Que voulez-vous faire ?" : "Nothing's waiting on a yes right now. What would you like to do?";
  if (decision.kind !== "turn") {
    const said = await settle(decision.id, decision.kind);
    const last = [...said].reverse().find((e) => e.type === "message" && e.final);
    return last && last.type === "message" ? speakable(last.text, locale) : "";
  }
  const { events } = await agentTurn({ viewer, locale, text: transcript, threadId, voice: true, history });
  return speechFor(events, locale);
}
