"use client";

import { Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/markdown/Markdown";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ChatMessage } from "../schemas";
import { TrailDots } from "./TrailDots";

type Props = { messages: ChatMessage[]; busy: boolean; mode: "public" | "brand" | "creator"; onClose: () => void; onClear: () => void };

// The conversation, above the pill: newest at the bottom, the three dots
// pulsing while it thinks, and Call next to the title in the app.
export function AssistantPanel({ messages, busy, mode, onClose, onClear }: Props) {
  const t = useTranslations("common.assistant");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length, busy]);
  return (
    <section aria-label={t("title")} className="flex max-h-[60vh] min-h-24 w-full origin-bottom flex-col overflow-hidden rounded-card border border-rule bg-surface shadow-float animate-pop-in">
      <header className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
        <TrailDots state={busy ? "thinking" : "idle"} />
        <p className="flex-1 text-small font-medium">{t("title")}</p>
        {mode !== "public" ? <Link href={`/${mode}/call`} className={buttonVariants({ variant: "ghost", size: "sm" })}><Phone aria-hidden="true" />{t("call")}</Link> : null}
        {messages.length > 0 ? <Button type="button" variant="ghost" size="sm" onClick={onClear}>{t("clear")}</Button> : null}
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("close")}><X aria-hidden="true" /></Button>
      </header>
      <ol className="flex flex-col gap-2 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.length === 0 ? <li className="text-small text-ink-muted">{mode === "public" ? t("introPublic") : t("intro")}</li> : null}
        {messages.map((m, i) => (
          <li key={`${i}-${m.role}`} className={`max-w-[85%] rounded-card px-3 py-2 text-body animate-rise ${m.role === "user" ? "self-end whitespace-pre-line rounded-br-sm bg-ink text-paper" : "self-start rounded-bl-sm border border-rule bg-paper text-ink"}`}>
            {/* the assistant's replies may carry lists and bold; the user's words stay as typed */}
            {m.role === "user" ? m.text : <Markdown text={m.text} />}
          </li>
        ))}
        {busy ? <li role="status" className="flex items-center gap-2 self-start text-caption text-ink-muted"><TrailDots state="thinking" />{t("thinking")}</li> : null}
        <div ref={endRef} />
      </ol>
    </section>
  );
}
