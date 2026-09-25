"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { startTransition, useEffect, useOptimistic, useRef } from "react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/ui/avatar";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import type { MessageDto, ThreadDetailDto, ViewerRole } from "../../schemas";
import { sendMessage } from "../../server/messages-actions";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";

type Props = { detail: ThreadDetailDto; role: ViewerRole; csrfToken: string; senderName: string; senderAvatarUrl: string | null };
type Pending = MessageDto & { pending: true };

// One thread: who, where the collaboration stands, the messages, the composer.
// Sent messages appear at once and drop again if the action fails.
export function ThreadView({ detail, role, csrfToken, senderName, senderAvatarUrl }: Props) {
  const t = useTranslations("collaboration");
  const { thread, messages } = detail;
  const [optimistic, addOptimistic] = useOptimistic<Array<MessageDto | Pending>, Pending>(messages, (list, m) => [...list, m]);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [optimistic.length]);

  function send({ body }: { body: string }) {
    startTransition(async () => {
      addOptimistic({ id: `pending-${Date.now()}`, body, senderName, senderAvatarUrl, mine: true, createdAt: new Date().toISOString(), pending: true });
      const result = await sendMessage({ collaborationId: thread.collaborationId, body, csrfToken });
      if (!result.ok) toast.error(t("messages.errors.sendFailed"));
    });
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-rule px-4 py-3">
        <Link href={`/${role}/messages`} className="lg:hidden" aria-label={t("messages.thread.back")}><ArrowLeft className="size-5" aria-hidden="true" /></Link>
        <PersonAvatar name={thread.counterpartName} src={thread.counterpartAvatarUrl} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-medium">{thread.counterpartName}</h2>
          <p className="truncate text-caption text-ink-muted">{thread.campaignName}</p>
        </div>
        <StatusChip tone={statusTone(thread.status)}>{t(`status.${thread.status}`)}</StatusChip>
        <Link href={`/${role}/collaborations/${thread.collaborationId}`} className="hidden text-small text-info hover:underline sm:block">{t("messages.thread.openCollaboration")}</Link>
      </header>
      <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {optimistic.length === 0 ? <li className="py-10 text-center text-small text-ink-muted">{t("messages.empty.noMessages")}</li> : null}
        {optimistic.map((m) => <MessageBubble key={m.id} message={m} pending={"pending" in m} />)}
        <div ref={bottomRef} />
      </ul>
      <Composer disabled={false} onSend={send} />
    </>
  );
}
