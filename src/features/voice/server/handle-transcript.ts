import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import { NO_PATTERN, TRANSCRIPT_MAX_CHARS, YES_PATTERN } from "../constants";
import { type VoiceIntent, type VoiceResponse } from "../schemas";
import { executeIntent } from "./execute-intent";
import { parseIntent } from "./parse-intent";

// One spoken turn: either an answer to a pending "confirm?" or a fresh command.
export async function handleTranscript(input: {
  transcript: string;
  pending?: VoiceIntent;
  confirmed?: boolean;
  viewer: Viewer;
  locale?: "en" | "fr";
}): Promise<VoiceResponse> {
  const transcript = input.transcript.trim().slice(0, TRANSCRIPT_MAX_CHARS);
  const role = input.viewer.brand ? "brand" : "creator";

  if (input.pending) {
    if (YES_PATTERN.test(transcript)) {
      const outcome = await executeIntent(input.pending, { viewer: input.viewer, confirmed: true, locale: input.locale });
      return { ok: !outcome.failed, ...outcome, intent: input.pending, source: "grammar" };
    }
    if (NO_PATTERN.test(transcript)) return { ok: true, speech: "Cancelled.", intent: input.pending, source: "grammar" };
    // Anything else replaces the pending action with a new command.
  }

  const { intent, source, reason } = await parseIntent(transcript, role);
  const outcome = await executeIntent(intent, { viewer: input.viewer, confirmed: input.confirmed === true, locale: input.locale });
  return { ok: !outcome.failed, ...outcome, intent, source, ...(reason ? { fallbackReason: reason } : {}) };
}
