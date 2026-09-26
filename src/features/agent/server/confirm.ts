import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import { ID_RADIX } from "../constants";
import type { AgentEvent } from "../events";
import { localizer } from "./localize";
import { appendEvents, getPending, openThread, ownsThread, saveTurn, setPending } from "./memory";
import { claimPending, type PendingCheck, readPending } from "./pending";
import { findTool } from "./tools";

type Input = { viewer: Viewer; locale: "en" | "fr"; id: string; decision: "confirm" | "cancel"; emit: (e: AgentEvent) => void; threadId?: string | null };

const REASON: Record<string, { en: string; fr: string }> = {
  expired: { en: "That confirmation expired. Ask me again and I'll prepare it fresh.", fr: "Cette confirmation a expiré. Redemandez-moi et je la prépare à nouveau." },
  default: { en: "I can't run that confirmation. Ask me again.", fr: "Je ne peux pas exécuter cette confirmation. Redemandez-moi." },
};

// A card is bound to the user and either the browser session (chat without
// stored threads) or the thread (so one made on a call can be tapped).
async function check(viewer: Viewer, id: string, threadId?: string | null): Promise<PendingCheck> {
  const bySession = readPending(id, { userId: viewer.userId, session: viewer.csrfToken });
  if (bySession.ok || bySession.reason !== "signature" || !threadId) return bySession;
  if (!(await ownsThread(viewer.userId, threadId))) return bySession;
  return readPending(id, { userId: viewer.userId, session: `thread:${threadId}` });
}

// The only place a confirm tool executes: the signed id must be valid for
// this user (and session or thread) and unexpired, used once, and the tool is
// looked up again in this role's registry. What happened is said from the
// action's own result, never by the model.
export async function runConfirmed({ viewer, locale, id, decision, emit: send, threadId }: Input): Promise<string | null> {
  const local = await localizer(locale);
  const events: AgentEvent[] = [];
  const emit = (e: AgentEvent) => { events.push(local(e)); send(e); };
  const say = (text: string) => { const mid = `m${Date.now().toString(ID_RADIX)}`; emit({ type: "message", id: mid, text, final: false }); emit({ type: "message", id: mid, text, final: true }); return text; };
  const reply = await settle({ viewer, locale, id, decision, emit, threadId }, say);
  if (threadId && (await ownsThread(viewer.userId, threadId))) {
    if ((await getPending(threadId)) === id) await setPending(threadId, null);
    await Promise.all([appendEvents(threadId, events), openThread(viewer.userId, threadId, { title: "" }).then((t) => (t ? saveTurn(t.threadId, { user: decision === "confirm" ? "(confirmed)" : "(cancelled)", assistant: reply }) : undefined))]);
  }
  return threadId ?? null;
}

async function settle(input: Input, say: (text: string) => string): Promise<string> {
  const { viewer, locale, id, decision, emit, threadId } = input;
  const valid = await check(viewer, id, threadId);
  if (!valid.ok) return say((REASON[valid.reason] ?? REASON.default)[locale]);
  const tool = findTool(viewer.brand ? "brand" : "creator", valid.action.tool);
  if (!tool || tool.kind !== "confirm") return say(REASON.default[locale]);
  if (!claimPending(id, valid.action.exp)) return say(locale === "fr" ? "C’est déjà fait." : "That has already been done.");
  if (decision === "cancel") {
    emit({ type: "resolved", id, outcome: "cancelled" });
    return say(locale === "fr" ? "D’accord, je n’ai rien fait." : "Okay, I didn't do it.");
  }
  const label = tool.label.replace(/^Preparing/, "Doing");
  emit({ type: "step", id: "c1", label, status: "running", tool: tool.name });
  const outcome = await tool.execute({ viewer, locale }, valid.action.args);
  emit({ type: "step", id: "c1", label, status: outcome.ok ? "done" : "failed", tool: tool.name, output: outcome.summary });
  emit({ type: "resolved", id, outcome: outcome.ok ? "done" : "failed" });
  return say(outcome.ok ? outcome.summary : `${locale === "fr" ? "Ça n’a pas marché" : "That didn't go through"}: ${outcome.summary}`);
}
