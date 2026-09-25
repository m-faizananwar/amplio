"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import Link from "next/link";
import { PersonAvatar } from "@/components/ui/avatar";
import type { ThreadDto, ViewerRole } from "../../schemas";

type Props = { thread: ThreadDto; role: ViewerRole; active: boolean };

export function ThreadListItem({ thread: t, role, active }: Props) {
  const tr = useTranslations("collaboration.messages.list");
  const format = useFormatter();
  // relativeTime needs a reference instant on the client; useNow keeps server and client agreeing
  const now = useNow();
  return (
    <li>
      <Link
        prefetch={false}
        href={`/${role}/messages/${t.collaborationId}`}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 px-4 py-3 transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:bg-tint focus-visible:outline-none ${active ? "bg-tint" : ""}`}
      >
        <PersonAvatar name={t.counterpartName} src={t.counterpartAvatarUrl} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-small font-medium text-ink">{t.counterpartName}</span>
            {t.lastMessageAt ? <time className="num shrink-0 text-caption text-ink-muted" dateTime={t.lastMessageAt}>{format.relativeTime(new Date(t.lastMessageAt), now)}</time> : null}
          </span>
          <span className="block truncate text-caption text-ink-muted">{t.campaignName}</span>
          <span className="block truncate text-caption text-ink-muted">{t.lastMessagePreview ?? tr("noPreview")}</span>
        </span>
      </Link>
    </li>
  );
}
