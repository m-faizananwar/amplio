"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { VoiceProvider, VoiceProviderEvents } from "@/features/voice/providers/types";
import { createVapiProvider } from "@/features/voice/providers/vapi";
import { createWebSpeechProvider, isWebSpeechSupported } from "@/features/voice/providers/web-speech";

export type SpeechStatus = "idle" | "listening" | "call";
export type SpeechFault = "unsupported" | "blocked" | null;
type Handlers = { onPartial: (text: string) => void; onFinal: (text: string) => void };
type SessionInfo = { provider: "vapi"; assistantId: string; publicKey: string; voiceToken: string } | { provider: "web-speech" };

const SILENCE_MS = 1500;

// The pill's mic. Web Speech API: interim results stream into the input, the
// final result (or a stop click, or 1.5s of silence) submits through the same
// path as typing. With NEXT_PUBLIC_VAPI_PUBLIC_KEY set the button starts a Vapi
// call instead (click again to hang up). Never a silent no-op: unsupported
// browsers and a blocked mic get a toast and the input gets focus.
export function useSpeechInput(handlers: Handlers, focusInput: () => void) {
  const t = useTranslations("common.assistant");
  const UNSUPPORTED = t("micUnsupported");
  const BLOCKED = t("micBlocked");
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [fault, setFault] = useState<SpeechFault>(null);
  const provider = useRef<VoiceProvider | null>(null);
  const silence = useRef<number>(0);
  const latest = useRef("");
  const h = useRef(handlers);
  useEffect(() => {
    h.current = handlers;
  });

  const stop = useCallback(() => {
    window.clearTimeout(silence.current);
    provider.current?.stop();
    provider.current = null;
    setStatus("idle");
  }, []);

  const finish = useCallback(
    (text: string) => {
      const t = text.trim();
      stop();
      if (t) h.current.onFinal(t);
    },
    [stop],
  );

  const start = useCallback(async () => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (key) {
      const info = (await fetch("/api/voice/session", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)) as SessionInfo | null;
      if (info?.provider === "vapi") {
        const events: VoiceProviderEvents = { onPartial: (t) => h.current.onPartial(t), onFinal: () => undefined, onError: (m) => { toast.error(m); stop(); } };
        provider.current = await createVapiProvider(info, events);
        setStatus("call");
        await provider.current.start();
        return;
      }
    }
    if (!isWebSpeechSupported()) {
      setFault("unsupported");
      toast(UNSUPPORTED);
      focusInput();
      return;
    }
    latest.current = "";
    const events: VoiceProviderEvents = {
      onPartial: (t) => {
        latest.current = t;
        h.current.onPartial(t);
        window.clearTimeout(silence.current);
        silence.current = window.setTimeout(() => finish(latest.current), SILENCE_MS);
      },
      onFinal: (t) => finish(t),
      onError: (m) => {
        const blocked = /blocked|not-allowed/i.test(m);
        if (blocked) setFault("blocked");
        // "didn't catch anything" is silence, not a fault: the call loop just restarts
        if (blocked || !/didn't catch/i.test(m)) toast.error(blocked ? BLOCKED : m);
        stop();
        if (blocked) focusInput();
      },
    };
    provider.current = createWebSpeechProvider(events);
    setStatus("listening");
    try {
      await provider.current.start();
    } catch (e) {
      const blocked = e instanceof Error && /not-allowed|blocked/i.test(e.message);
      setFault(blocked ? "blocked" : "unsupported");
      toast.error(blocked ? BLOCKED : UNSUPPORTED);
      stop();
      focusInput();
    }
  }, [finish, focusInput, stop, BLOCKED, UNSUPPORTED]);

  const toggle = useCallback(() => {
    if (status === "listening") finish(latest.current);
    else if (status === "call") stop();
    else void start();
  }, [status, start, finish, stop]);

  useEffect(() => () => provider.current?.stop(), []);
  // stop without submitting (the call pauses recognition while it speaks)
  const cancel = stop;
  return { status, fault, toggle, start, cancel };
}
