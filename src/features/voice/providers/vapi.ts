import type { VoiceProvider, VoiceProviderEvents } from "./types";

export type VapiSession = { assistantId: string; publicKey: string; voiceToken: string; overrides?: Record<string, unknown> };

type VapiMessage = { type?: string; role?: string; transcriptType?: string; transcript?: string };

// Vapi runs the whole conversation (mic, transcription, its own voice) and
// calls our webhook for actions. Loaded on demand so the SDK never ships to
// users without keys. Navigation from Vapi replies is handled by the webhook
// response text only; the page follows on the next action.
export async function createVapiProvider(session: VapiSession, events: VoiceProviderEvents): Promise<VoiceProvider> {
  const { default: Vapi } = await import("@vapi-ai/web");
  const vapi = new Vapi(session.publicKey);

  vapi.on("message", (message: VapiMessage) => {
    if (message.type !== "transcript" || !message.transcript) return;
    if (message.role === "assistant") {
      if (message.transcriptType === "final") events.onAssistantSpeech?.(message.transcript);
      return;
    }
    if (message.transcriptType === "final") events.onFinal(message.transcript);
    else events.onPartial(message.transcript);
  });
  vapi.on("speech-end", () => events.onSpeakingEnd?.());
  vapi.on("error", (error: unknown) => events.onError(error instanceof Error ? error.message : "Voice call failed."));

  return {
    name: "vapi",
    handlesIntents: false,
    start: async () => {
      // the session route builds the overrides (greeting, voiceToken, threadId, locale)
      await vapi.start(session.assistantId, session.overrides ?? { variableValues: { voiceToken: session.voiceToken }, metadata: { voiceToken: session.voiceToken } });
    },
    stop: () => vapi.stop(),
    speak: async () => undefined,
  };
}
