import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import type { AgentEvent } from "../events";
import { ID_RADIX } from "../constants";
import { runTurn } from "./loop";
import { openThread, saveTurn } from "./memory";
import { claimPending, readPending } from "./pending";
import { findTool } from "./tools";

type Input = { viewer: Viewer; locale: "en" | "fr"; id: string; decision: "confirm" | "cancel"; emit: (e: AgentEvent) => void; threadId?: string | null };

const REASON: Record<string, { en: string; fr: string }> = {
  expired: { en: "That confirmation expired. Ask me again and I'll prepare it fresh.", fr: "Cette confirmation a expiré. Redemandez-moi et je la prépare à nouveau." },
  default: { en: "I can't run that confirmation. Ask me again.", fr: "Je ne peux pas exécuter cette confirmation. Redemandez-moi." },
};

// The only place a confirm tool executes: the signed id must be valid, for
// this user and session, and unexpired; the tool is looked up again in this
// role's registry. Then the agent continues from the result.
export async function runConfirmed({ viewer, locale, id, decision, emit, threadId }: Input): Promise<string | null> {
  const check = readPending(id, { userId: viewer.userId, session: viewer.csrfToken });
  const msg = (text: string) => { const mid = `m${Date.now().toString(ID_RADIX)}`; emit({ type: "message", id: mid, text, final: false }); emit({ type: "message", id: mid, text: "", final: true }); return threadId ?? null; };
  if (!check.ok) return msg((REASON[check.reason] ?? REASON.default)[locale]);
  const tool = findTool(viewer.brand ? "brand" : "creator", check.action.tool);
  if (!tool || tool.kind !== "confirm") return msg(REASON.default[locale]);
  if (!claimPending(id, check.action.exp)) return msg(locale === "fr" ? "C’est déjà fait." : "That has already been done.");
  if (decision === "cancel") return msg(locale === "fr" ? "D’accord, je n’ai rien fait." : "Okay, I didn't do it.");
  emit({ type: "step", id: "c1", label: tool.label.replace(/^Preparing/, "Doing"), status: "running", tool: tool.name });
  const outcome = await tool.execute({ viewer, locale }, check.action.args);
  emit({ type: "step", id: "c1", label: tool.label.replace(/^Preparing/, "Doing"), status: outcome.ok ? "done" : "failed", tool: tool.name, output: outcome.summary });
  const note = outcome.ok ? `The user confirmed and it was done: ${outcome.summary}. Tell them in one or two sentences what happened and what comes next.` : `The user confirmed but it failed: ${outcome.summary}. Say so plainly and suggest the fix.`;
  // carry on inside the thread the card came from, when threads are stored
  const thread = threadId ? await openThread(viewer.userId, threadId, tool.name) : null;
  const reply = await runTurn({ viewer, locale, text: note, history: thread?.history ?? [], emit });
  if (thread) await saveTurn(thread.threadId, { user: `(confirmed: ${tool.name})`, assistant: reply });
  return thread?.threadId ?? null;
}
