import { SPEECH_LANG, SPEECH_RATE } from "../constants";
import type { VoiceProvider, VoiceProviderEvents } from "./types";

// Minimal typing for the prefixed browser API (Chrome/Safari ship it, Firefox does not).
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

export function recognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const isWebSpeechSupported = () => typeof window !== "undefined" && recognitionCtor() !== null;

export function createWebSpeechProvider(events: VoiceProviderEvents): VoiceProvider {
  let recognition: Recognition | null = null;
  let finalised = false;

  const start = async () => {
    const Ctor = recognitionCtor();
    if (!Ctor) throw new Error("This browser has no speech recognition. Try Chrome or Safari.");
    recognition?.abort();
    recognition = new Ctor();
    finalised = false;
    recognition.lang = SPEECH_LANG;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const text = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ").trim();
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) {
        finalised = true;
        events.onFinal(text);
      } else events.onPartial(text);
    };
    recognition.onerror = (e) => {
      if (e.error === "aborted") return;
      events.onError(e.error === "not-allowed" ? "Microphone access was blocked." : `Couldn't hear you (${e.error}).`);
    };
    recognition.onend = () => {
      if (!finalised) events.onError("I didn't catch anything. Tap the mic and try again.");
    };
    recognition.start();
  };

  const stop = () => {
    finalised = true;
    recognition?.abort();
    recognition = null;
    window.speechSynthesis?.cancel();
  };

  const speak = (text: string) =>
    new Promise<void>((resolve) => {
      if (!window.speechSynthesis) return resolve();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG;
      utterance.rate = SPEECH_RATE;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });

  return { name: "web-speech", start, stop, speak, handlesIntents: true };
}
