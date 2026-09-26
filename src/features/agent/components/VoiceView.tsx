"use client";

import { ArrowLeft, Phone, PhoneOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VoiceMark } from "@/features/assistant/components/call/VoiceMark";
import { useSpeechInput } from "@/features/assistant/components/useSpeechInput";
import type { ConfirmEvent, StepEvent } from "../events";
import { ConfirmCard } from "./ConfirmCard";
import { StepGroup } from "./StepGroup";
import type { AgentItem, ConfirmState } from "./useAgentRun";

const YES = /^(yes|yeah|yep|confirm|oui|d'accord|ok)\b/i;

type Props = {
  items: AgentItem[];
  confirms: Record<string, ConfirmState>;
  busy: boolean;
  onSend: (text: string) => void;
  onDecide: (event: ConfirmEvent, decision: "confirm" | "cancel") => void;
  onClose: () => void;
};

// The call: the same run, spoken. The mark's three dots listen, think and
// speak; a caption shows what it says; its steps run underneath; a confirm
// comes up large, and saying "yes" confirms it.
export function VoiceView({ items, confirms, busy, onSend, onDecide, onClose }: Props) {
  const t = useTranslations("agent.voice");
  const tc = useTranslations("agent.composer");
  const [speaking, setSpeaking] = useState(false);
  const spoken = useRef(new Set<string>());
  const open = [...items].reverse().find((i): i is AgentItem & ConfirmEvent => i.type === "confirm" && (confirms[i.id] ?? "open") === "open");
  const speech = useSpeechInput({
    onPartial: () => undefined,
    onFinal: (text) => (open && YES.test(text.trim()) ? onDecide(open, "confirm") : onSend(text)),
  }, () => undefined);
  const last = [...items].reverse().find((i) => i.type === "message");
  const caption = last && last.type === "message" ? last.text : "";
  const steps = items.filter((i): i is AgentItem & StepEvent => i.type === "step").slice(-4);

  // say each finished message once
  useEffect(() => {
    if (!last || last.type !== "message" || !last.final || spoken.current.has(last.id) || !("speechSynthesis" in window)) return;
    spoken.current.add(last.id);
    const utterance = new SpeechSynthesisUtterance(last.text);
    utterance.lang = document.documentElement.lang;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [last]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const state = speaking ? "speaking" : busy ? "thinking" : speech.status !== "idle" ? "listening" : null;
  return (
    <section className="grid min-h-[60vh] content-start justify-items-center gap-6 py-6 text-center">
      <div className="size-40"><VoiceMark listening={speech.status !== "idle"} speaking={speaking} /></div>
      <p className="text-small font-medium text-ink-muted" aria-live="polite">{state ? t(state) : " "}</p>
      <p className="max-w-xl text-h4 leading-snug text-ink" aria-live="polite">{caption}</p>
      {steps.length ? <div className="w-full max-w-md text-left"><StepGroup steps={steps} /></div> : null}
      {open ? <ConfirmCard big event={open} state={confirms[open.id]} onDecide={(d) => onDecide(open, d)} /> : null}
      <div className="flex gap-2">
        {speech.status === "idle" ? <Button icon={<Phone />} onClick={speech.start}>{tc("call")}</Button> : <Button variant="danger" icon={<PhoneOff />} onClick={speech.cancel}>{t("end")}</Button>}
        <Button variant="ghost" onClick={() => { speech.cancel(); onClose(); }}><ArrowLeft aria-hidden="true" />{t("back")}</Button>
      </div>
    </section>
  );
}
