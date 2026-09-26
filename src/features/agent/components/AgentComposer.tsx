"use client";

import { ArrowUp, Mic, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechInput } from "@/features/assistant/components/useSpeechInput";
import { AGENT_INPUT_MAX } from "../events";

// The message box: the description field's look, one row that grows; Enter
// sends, Shift+Enter breaks the line. The mic dictates into it; Call opens
// the voice view.
export function AgentComposer({ busy, onSend, onCall }: { busy: boolean; onSend: (text: string) => void; onCall: () => void }) {
  const t = useTranslations("agent.composer");
  const [text, setText] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const submit = (value = text) => {
    const clean = value.trim();
    if (!clean || busy) return;
    onSend(clean);
    setText("");
  };
  const speech = useSpeechInput({ onPartial: setText, onFinal: (final) => submit(final) }, () => box.current?.focus());
  return (
    <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <label htmlFor="agent-input" className="sr-only">{t("label")}</label>
      <Textarea
        ref={box}
        id="agent-input"
        minRows={1}
        value={text}
        maxLength={AGENT_INPUT_MAX}
        placeholder={t("placeholder")}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("mic")} aria-pressed={speech.status !== "idle"} onClick={speech.toggle}><Mic /></Button>
        <Button type="button" variant="quiet" size="sm" icon={<Phone />} onClick={onCall}>{t("call")}</Button>
        <Button type="submit" size="sm" disabled={busy || !text.trim()} icon={<ArrowUp />}>{t("send")}</Button>
      </div>
    </form>
  );
}
