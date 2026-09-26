import { recognitionCtor, type Recognition } from "@/features/voice/providers/web-speech";
import type { CallEngineName } from "./callTypes";

// A call engine owns the audio: the words it hears, the voice it speaks with,
// the output level. The provider owns the state; engines stay thin.
export type EngineHandlers = {
  onUser: (text: string, final: boolean) => void;
  onAgent: (text: string, final: boolean) => void;
  onSpeaking: (speaking: boolean) => void;
  onInputLevel: (level: number) => void;
  onOutputLevel: (level: number) => void;
  onEnd: () => void;
  onError: (message: string) => void;
};

export type CallEngine = { name: CallEngineName; start: () => Promise<void>; stop: () => void; setMuted: (muted: boolean) => void; speak: (text: string) => void };

// `overrides` comes ready from /api/voice/session (greeting in the caller's
// language, variableValues, metadata { voiceToken, threadId, locale }).
export type AgentVoiceSession = { provider: "vapi"; assistantId: string; publicKey: string; voiceToken: string; threadId: string | null; overrides: Record<string, unknown> };

type VapiMessage = { type?: string; role?: string; transcriptType?: string; transcript?: string };

const RESTART_MS = 250;
const SYNTH_LEVEL_MS = 90;
const SYNTH_FLOOR = 0.25;
const SYNTH_SWING = 0.55;

const messageOf = (error: unknown) => (error instanceof Error ? error.message : typeof error === "string" ? error : "voice error");

// The phone-quality line: Vapi runs the mic, the transcription and the voice;
// its brain is our agent loop (server side), so the steps arrive by the feed.
export async function createVapiEngine(session: AgentVoiceSession, h: EngineHandlers): Promise<CallEngine> {
  const { default: Vapi } = await import("@vapi-ai/web");
  const vapi = new Vapi(session.publicKey);
  vapi.on("message", (m: VapiMessage) => {
    if (m.type !== "transcript" || !m.transcript) return;
    (m.role === "assistant" ? h.onAgent : h.onUser)(m.transcript, m.transcriptType === "final");
  });
  vapi.on("speech-start", () => h.onSpeaking(true));
  vapi.on("speech-end", () => h.onSpeaking(false));
  vapi.on("volume-level", (v) => h.onOutputLevel(v));
  vapi.on("local-volume-level", (v) => h.onInputLevel(v));
  vapi.on("call-end", () => h.onEnd());
  vapi.on("error", (e: unknown) => h.onError(messageOf(e)));
  return {
    name: "vapi",
    start: async () => {
      const call = await vapi.start(session.assistantId, session.overrides as Parameters<typeof vapi.start>[1]);
      if (!call) throw new Error("vapi did not start");
    },
    stop: () => void vapi.stop(),
    setMuted: (muted) => vapi.setMuted(muted),
    speak: () => undefined,
  };
}

// The fallback: the browser's own recognition and voice, one turn at a time,
// against /api/agent like typing. It stops listening while it speaks, so it
// never hears itself.
export function createBrowserEngine(h: EngineHandlers, lang: string): CallEngine {
  let recognition: Recognition | null = null;
  let live = false;
  let muted = false;
  let speaking = false;
  let synth = 0;

  // drop the current recogniser now, not when (or if) its onend arrives
  const hush = () => {
    const current = recognition;
    recognition = null;
    current?.abort();
  };

  const listen = () => {
    const Ctor = recognitionCtor();
    if (!Ctor || !live || muted || speaking || recognition) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ").trim();
      if (text) h.onUser(text, Boolean(last?.isFinal));
    };
    rec.onerror = (e) => { if (e.error === "not-allowed") h.onError("not-allowed"); };
    rec.onend = () => {
      if (recognition === rec) recognition = null;
      window.setTimeout(listen, RESTART_MS);
    };
    recognition = rec;
    try { rec.start(); } catch { recognition = null; }
  };

  const quiet = () => {
    window.clearInterval(synth);
    speaking = false;
    h.onOutputLevel(0);
    h.onSpeaking(false);
    listen();
  };

  return {
    name: "browser",
    start: async () => {
      if (!recognitionCtor()) throw new Error("no speech recognition");
      live = true;
      listen();
    },
    stop: () => {
      live = false;
      window.clearInterval(synth);
      hush();
      window.speechSynthesis?.cancel();
    },
    setMuted: (next) => {
      muted = next;
      if (next) hush();
      else listen();
    },
    speak: (text) => {
      if (!live || !("speechSynthesis" in window)) return;
      speaking = true;
      hush();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      // the browser voice reports no level: a soft swing stands in for it
      utterance.onstart = () => {
        h.onSpeaking(true);
        synth = window.setInterval(() => h.onOutputLevel(SYNTH_FLOOR + Math.random() * SYNTH_SWING), SYNTH_LEVEL_MS);
      };
      utterance.onend = quiet;
      utterance.onerror = quiet;
      window.speechSynthesis.speak(utterance);
    },
  };
}
