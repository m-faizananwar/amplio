import "server-only";
import { type Content, GoogleGenAI, type Part } from "@google/genai";
import { answerChat } from "@/features/assistant/server/answer";
import type { Viewer } from "@/features/auth/server/session";
import { GEMINI_MODEL } from "@/features/ai/constants";
import { resolveAiProvider } from "@/lib/ai-provider";
import { ID_RADIX, MAX_CHIPS, SUMMARY_MAX } from "../constants";
import type { AgentEvent } from "../events";
import { inventedIds } from "../id-guard";
import { amountsFrom, checkMoney, withEuros } from "../money-check";
import { compactForModel } from "./compact";
import { createPending } from "./pending";
import { ASK_USER, type Recall, systemPrompt } from "./prompt";
import { declarationsFor, findTool } from "./tools";
import type { NextStep, ToolContext } from "./tools/types";

export const MAX_TOOL_STEPS = 8;
export const TURN_BUDGET_MS = 45_000;
// a call waits on the answer (Vapi's tool timeout is set to 40 s)
export const VOICE_BUDGET_MS = 28_000;
export const CALL_TIMEOUT_MS = 12_000;
const HISTORY_TURNS = 10;
const CHUNK_WORDS = 6;
const FALLBACK_MAX = 500;
const FALLBACK_TURNS = 12;

export type Turn = { role: "user" | "assistant"; text: string };
type Emit = (event: AgentEvent) => void;
export type TurnInput = { viewer: Viewer; locale: "en" | "fr"; text: string; history: Turn[]; emit: Emit; recall?: Recall; scope?: string; voice?: boolean };

const geminiKey = () => {
  const p = resolveAiProvider({ ...process.env, ANTHROPIC_API_KEY: undefined });
  return p.name === "gemini" ? p.apiKey : null;
};

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([work, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timed out")), ms))]);
}

// Assistant text goes out in small chunks of one message id.
function say(emit: Emit, text: string) {
  const id = `m${Date.now().toString(ID_RADIX)}`;
  const words = text.split(/(\s+)/);
  for (let i = 0; i < words.length; i += CHUNK_WORDS * 2) emit({ type: "message", id, text: words.slice(i, i + CHUNK_WORDS * 2).join(""), final: false });
  emit({ type: "message", id, text, final: true });
}

// One call the model asked for: a question ends the turn, a read runs (with
// its own timeout) and reports a step, a confirm tool is only prepared.
type CallInput = { call: { name?: string; args?: Record<string, unknown> }; ctx: ToolContext; emit: Emit; stepId: string; seen?: Set<number>; next?: NextStep[] };
export async function runCall({ call, ctx, emit, stepId, seen, next }: CallInput): Promise<{ response: Record<string, unknown>; stop?: "question" | "confirm" }> {
  const name = call.name ?? "";
  const args = call.args ?? {};
  if (name === ASK_USER.name) {
    const chips = Array.isArray(args.chips) ? args.chips.map(String).slice(0, MAX_CHIPS) : [];
    emit({ type: "question", text: String(args.question ?? ""), chips });
    return { response: { asked: true }, stop: "question" };
  }
  const tool = findTool(ctx.viewer.brand ? "brand" : "creator", name);
  if (!tool) return { response: { error: `No tool named ${name} for this account.` } };
  const invented = inventedIds(args);
  if (invented.length) return { response: { error: `${invented.join(", ")} must come from a tool result in this turn. Call the read tool again to get it.` } };
  emit({ type: "step", id: stepId, label: tool.label, status: "running", tool: name, input: summarise(args) });
  try {
    if (tool.kind === "read") {
      const out = await withTimeout(tool.run(ctx, args), CALL_TIMEOUT_MS);
      emit({ type: "step", id: stepId, label: tool.label, status: "done", tool: name, output: out.summary });
      if (out.result) emit(out.result);
      if (out.navigate) emit({ type: "navigate", href: out.navigate });
      if (seen) amountsFrom(out.data, seen);
      if (next && out.nextSteps) next.push(...out.nextSteps);
      return { response: compactForModel(withEuros(out.data, ctx.locale)) };
    }
    const prepared = await withTimeout(tool.prepare(ctx, args), CALL_TIMEOUT_MS);
    if ("error" in prepared) {
      emit({ type: "step", id: stepId, label: tool.label, status: "failed", tool: name, output: prepared.error });
      if (next && prepared.nextSteps) next.push(...prepared.nextSteps);
      return { response: { error: prepared.error } };
    }
    if (seen) amountsFrom(prepared.facts, seen);
    const pending = createPending({ tool: name, args, userId: ctx.viewer.userId }, ctx.scope ?? ctx.viewer.csrfToken);
    emit({ type: "step", id: stepId, label: tool.label, status: "done", tool: name, output: "waiting for your confirmation" });
    emit({ type: "confirm", id: pending.id, title: prepared.title, facts: prepared.facts, confirmLabel: prepared.confirmLabel, cancelLabel: ctx.locale === "fr" ? "Pas maintenant" : "Not now", expiresAt: pending.expiresAt });
    return { response: { status: "prepared; the user must confirm it in the app before anything happens" }, stop: "confirm" };
  } catch (error) {
    console.error("[agent] tool failed", { tool: name, error: error instanceof Error ? error.message : String(error) });
    emit({ type: "step", id: stepId, label: tool.label, status: "failed", tool: name, output: "failed" });
    return { response: { error: "The tool failed. Say so plainly; don't guess." } };
  }
}

const summarise = (args: Record<string, unknown>) => {
  const s = Object.entries(args).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ");
  return s.length > SUMMARY_MAX ? `${s.slice(0, SUMMARY_MAX)}…` : s;
};

const toContents = (history: Turn[], text: string): Content[] => [
  ...history.slice(-HISTORY_TURNS * 2).map((t) => ({ role: t.role === "user" ? "user" : "model", parts: [{ text: t.text }] })),
  { role: "user", parts: [{ text }] },
];

// One turn: the model plans, calls tools (reads together), and either asks,
// prepares a confirm, or answers. Capped at 8 tool steps and 45 seconds.
export async function runTurn({ viewer, locale, text, history, emit, recall, scope, voice }: TurnInput): Promise<string> {
  const apiKey = geminiKey();
  if (!apiKey) {
    // no Gemini key: the existing assistant answers (it has its own grammar tools)
    const fallback = await answerChat({ message: text.slice(0, FALLBACK_MAX), history: history.slice(-FALLBACK_TURNS) }, viewer, locale);
    say(emit, fallback.text);
    return fallback.text;
  }
  const ai = new GoogleGenAI({ apiKey });
  const ctx: ToolContext = { viewer, locale, scope };
  const contents = toContents(history, text);
  const deadline = Date.now() + (voice ? VOICE_BUDGET_MS : TURN_BUDGET_MS);
  // every amount a tool returned this turn; the reply may only use these (no
  // balance from the session: it can be stale, so the model asks a tool)
  const seen = new Set<number>();
  const next: NextStep[] = [];
  let steps = 0;
  while (Date.now() < deadline) {
    const res = await withTimeout(ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction: systemPrompt(viewer, locale, { notes: [], summary: "", ...recall, voice }), tools: [{ functionDeclarations: [ASK_USER, ...declarationsFor(viewer.brand ? "brand" : "creator")] as never }], thinkingConfig: { thinkingBudget: 0 } },
    }), Math.max(1, deadline - Date.now()));
    const calls = res.functionCalls ?? [];
    const modelParts: Part[] = res.candidates?.[0]?.content?.parts ?? [];
    if (calls.length === 0 || steps >= MAX_TOOL_STEPS) {
      const checked = checkMoney(res.text?.trim() ?? "", seen, locale);
      if (checked.dropped) console.warn("[agent] dropped unverified amounts", { sentences: checked.dropped });
      const reply = checked.text || (locale === "fr" ? "Voici ce que j’ai trouvé." : "Here's what I found.");
      say(emit, reply);
      // a blocker never ends the turn cold: the tools' own next steps as chips
      const steps = next.filter((s, i) => next.findIndex((o) => o.label === s.label) === i).slice(0, MAX_CHIPS);
      if (steps.length) emit({ type: "question", text: "", chips: steps.map((s) => s.label), hints: Object.fromEntries(steps.map((s) => [s.label, s.hint])) });
      return reply;
    }
    contents.push({ role: "model", parts: modelParts });
    const outcomes = await Promise.all(calls.map((call, i) => runCall({ call, ctx, emit, stepId: `s${steps + i + 1}`, seen, next })));
    steps += calls.length;
    contents.push({ role: "user", parts: calls.map((call, i) => ({ functionResponse: { name: call.name ?? "", response: outcomes[i].response } })) });
    const stop = outcomes.find((o) => o.stop)?.stop;
    if (stop === "question") return "";
    if (stop === "confirm") {
      const note = locale === "fr" ? "C’est prêt. Confirmez pour que je le fasse." : "It's ready. Confirm and I'll do it.";
      say(emit, note);
      return note;
    }
  }
  const late = locale === "fr" ? "Ça prend trop de temps ; je m’arrête là. Réessayez avec une demande plus précise." : "That took too long, so I stopped. Try a narrower request.";
  say(emit, late);
  return late;
}
