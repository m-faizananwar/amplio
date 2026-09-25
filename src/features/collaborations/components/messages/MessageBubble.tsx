"use client";

import { useFormatter, useTranslations } from "next-intl";
import { PersonAvatar } from "@/components/ui/avatar";
import type { MessageDto } from "../../schemas";

export function MessageBubble({ message: m, pending = false }: { message: MessageDto; pending?: boolean }) {
  const t = useTranslations("collaboration.messages");
  const format = useFormatter();
  return (
    <li className={`flex items-end gap-2 ${m.mine ? "flex-row-reverse" : ""}`}>
      <PersonAvatar name={m.senderName} src={m.senderAvatarUrl} size="sm" />
      <div className={`max-w-[75%] ${m.mine ? "text-right" : ""}`}>
        <p className="text-caption text-ink-muted">
          {m.mine ? t("thread.you") : m.senderName} · <time className="num" dateTime={m.createdAt}>{format.dateTime(new Date(m.createdAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
          {pending ? ` · ${t("composer.sending")}` : ""}
        </p>
        <p className={`mt-1 inline-block whitespace-pre-line rounded-card px-3.5 py-2 text-left text-body ${m.mine ? "rounded-br-sm bg-ink text-paper" : "rounded-bl-sm border border-rule bg-paper text-ink"} ${pending ? "opacity-60" : ""}`}>{m.body}</p>
      </div>
    </li>
  );
}
