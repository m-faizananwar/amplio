"use client";

import { ChevronDown, Mic, Phone, SendHorizontal, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "../constants";
import { AssistantPanel } from "./AssistantPanel";
import { TrailDots } from "./TrailDots";
import { useAssistantChat } from "./useAssistantChat";
import { useSpeechInput } from "./useSpeechInput";
import "./assistant.css";

type Props = { mode: "public" | "brand" | "creator"; csrfToken?: string };

function stored() {
  try { return localStorage.getItem(STORAGE_KEYS.collapsed) === "1"; } catch { return false; }
}
function store(on: boolean) {
  try { if (on) localStorage.setItem(STORAGE_KEYS.collapsed, "1"); else localStorage.removeItem(STORAGE_KEYS.collapsed); } catch { /* storage blocked */ }
}

// The assistant, calm: a pill at the bottom of every page (type or talk),
// the conversation above it, and a small button in the corner when hidden.
// Same brain as before — it asks before anything that moves money or
// changes a collaboration (the server holds the pending action until "yes").
export function AssistantDock({ mode, csrfToken }: Props) {
  const t = useTranslations("common.assistant");
  const chat = useAssistantChat(csrfToken);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const speech = useSpeechInput({ onPartial: setDraft, onFinal: (text) => { setDraft(""); setOpen(true); void chat.send(text); } }, () => input.current?.focus());
  const listening = speech.status !== "idle";
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the stored preference is read after mount
  useEffect(() => setHidden(stored()), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const hide = (on: boolean) => { setHidden(on); store(on); if (on) setOpen(false); };
  const submit = (e: FormEvent) => { e.preventDefault(); if (!draft.trim()) return; setOpen(true); void chat.send(draft); setDraft(""); };

  if (hidden) {
    return (
      <Button type="button" variant="secondary" size="icon-lg" aria-label={t("expand")} onClick={() => hide(false)} className="fixed right-4 bottom-4 z-30 rounded-chip shadow-float">
        <TrailDots state={chat.busy ? "thinking" : "idle"} className="w-6" />
      </Button>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
      <div className={`pointer-events-auto grid w-full gap-2 ${mode === "public" ? "max-w-xl" : "max-w-md"}`}>
        {open ? <AssistantPanel messages={chat.messages} busy={chat.busy} mode={mode} onClose={() => setOpen(false)} onClear={chat.clear} /> : null}
        <form onSubmit={submit} className="flex h-12 items-center gap-2 rounded-chip border border-rule bg-surface pr-1.5 pl-4 shadow-float">
          <TrailDots state={listening ? "listening" : chat.busy ? "thinking" : "idle"} />
          <label htmlFor="assistant-input" className="sr-only">{t("label")}</label>
          <input id="assistant-input" ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} onFocus={() => chat.messages.length > 0 && setOpen(true)}
            placeholder={listening ? (speech.status === "call" ? t("onCall") : t("listening")) : t("placeholder1")} autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted" />
          {draft.trim() ? (
            <Button type="submit" size="icon-sm" aria-label={t("send")}><SendHorizontal aria-hidden="true" /></Button>
          ) : (
            <Button type="button" size="icon-sm" variant={listening ? "primary" : "ghost"} onClick={speech.toggle} aria-pressed={listening} aria-label={listening ? (speech.status === "call" ? t("hangUp") : t("stopListening")) : t("talk")}>
              {listening ? (speech.status === "call" ? <Phone aria-hidden="true" /> : <Square aria-hidden="true" />) : <Mic aria-hidden="true" />}
            </Button>
          )}
          <Button type="button" size="icon-sm" variant="ghost" onClick={() => hide(true)} aria-label={t("collapse")}><ChevronDown aria-hidden="true" /></Button>
        </form>
      </div>
    </div>
  );
}
