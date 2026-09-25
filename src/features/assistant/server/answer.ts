import "server-only";
import { BRAND } from "@/config/brand";
import { describeAiError, generateText } from "@/features/ai/server/llm";
import type { Viewer } from "@/features/auth/server/session";
import { handleTranscript } from "@/features/voice/server/handle-transcript";
import { ANSWER_MAX_TOKENS, ANSWER_MAX_WORDS, HISTORY_MAX } from "../constants";
import type { ChatMessage, ChatRequest, ChatResponse } from "../schemas";
import { publicContext, viewerContext } from "./context";

const SYSTEM = (context: string, loggedOut: boolean) =>
  [
    `You are the assistant inside ${BRAND.name}, a B2B LinkedIn creator marketplace. Answer in plain sentences, no markdown, no lists, under ${ANSWER_MAX_WORDS} words, in the language the user writes in (English or French).`,
    "Use only the context below. Never invent numbers, prices, customers or results; if something is not in the context, say you don't have it.",
    loggedOut ? "The reader is not signed in. When it fits, end with a short nudge to sign up at /register." : "The reader is signed in; be concrete about their own workspace.",
    "Context:",
    context,
  ].join("\n");

// Signed in: the message goes through the voice layer's intent parser and
// executor first (same tools, same confirm gate); only an "unknown" intent
// falls through to a conversational answer. Logged out: conversation only.
export async function answerChat(req: ChatRequest, viewer: Viewer | null): Promise<ChatResponse> {
  if (viewer) {
    const result = await handleTranscript({ transcript: req.message, pending: req.pending, viewer });
    if (result.intent?.tool !== "unknown" || req.pending) {
      return { ok: result.ok, text: result.speech, navigate: result.navigate, pending: result.pending, source: "tool" };
    }
  }
  const context = viewer ? await viewerContext(viewer) : publicContext();
  const user = [...(req.history ?? []).slice(-HISTORY_MAX).map((m: ChatMessage) => `${m.role}: ${m.text}`), `user: ${req.message}`].join("\n");
  try {
    const answer = await generateText({ system: SYSTEM(context, !viewer), user, maxTokens: ANSWER_MAX_TOKENS });
    if (answer) return { ok: true, text: answer.text, source: "llm" };
  } catch (error) {
    console.error("[assistant] llm answer failed, using template", { reason: describeAiError(error) });
  }
  return { ok: true, text: templateAnswer(req.message, context, !viewer), source: "template" };
}

// Keyless fallback: the context line that shares the most words with the
// question, or an honest "I don't have that".
export function templateAnswer(message: string, context: string, loggedOut: boolean): string {
  const words = new Set(message.toLowerCase().match(/[a-z€%0-9]{3,}/g) ?? []);
  const lines = context.split("\n").filter((l) => l.trim());
  let best: { line: string; score: number } = { line: "", score: 0 };
  for (const line of lines) {
    const score = (line.toLowerCase().match(/[a-z€%0-9]{3,}/g) ?? []).filter((w) => words.has(w)).length;
    if (score > best.score) best = { line, score };
  }
  const nudge = loggedOut ? " You can try it at /register." : "";
  if (best.score === 0) return `I don't have that in front of me. I can answer about ${loggedOut ? "how the product works and what it costs" : "your campaigns, collaborations and balance"}.${nudge}`;
  return `${best.line}${nudge}`;
}
