"use client";

import { MessageSquare, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ago, minutesOf, sameDay } from "./threadTime";
import { useNow } from "./useNow";

export type RailThread = { id: string; title: string; kind?: "chat" | "call"; turns?: number; updatedAt?: string; durationSec?: number };
type Props = { threads: RailThread[]; current: string | null; onResume: (thread: RailThread) => void };

const SHOWN = 8;

// Earlier chats and calls: a type icon, the title on one line, when it was
// (and how long, for a call), grouped Today / Earlier. Eight at first, then
// all of them. Threads nothing was said in are never listed.
export function ThreadList({ threads, current, onResume }: Props) {
  const t = useTranslations("agent.rail");
  const locale = useLocale();
  const now = useNow();
  const [all, setAll] = useState(false);
  const real = threads.filter((th) => (th.turns ?? 1) > 0);
  if (!real.length) return <p className="text-small text-ink-muted">{t("noThreads")}</p>;
  const shown = all ? real : real.slice(0, SHOWN);
  // before the clock is known (server, hydration) it's one list without times
  const groups = now
    ? [{ key: "today", items: shown.filter((th) => th.updatedAt && sameDay(th.updatedAt, now)) }, { key: "earlier", items: shown.filter((th) => !th.updatedAt || !sameDay(th.updatedAt, now)) }]
    : [{ key: "all", items: shown }];

  const row = (th: RailThread) => {
    const Icon = th.kind === "call" ? Phone : MessageSquare;
    const meta = [now && th.updatedAt ? ago(th.updatedAt, now, locale) : null, th.kind === "call" && th.durationSec ? t("minutes", { n: minutesOf(th.durationSec) }) : null].filter(Boolean).join(" · ");
    return (
      <li key={th.id} className="min-w-0">
        <button type="button" aria-current={th.id === current || undefined} onClick={() => onResume(th)} className="flex w-full min-w-0 items-center gap-2.5 rounded-control px-2.5 py-2 text-left outline-none transition-colors duration-(--duration-fast) hover:bg-well focus-visible:ring-2 focus-visible:ring-money aria-[current]:bg-well">
          <Icon className="size-3.5 shrink-0 text-ink-muted" aria-label={th.kind === "call" ? t("call") : t("chat")} />
          <span className="min-w-0 flex-1 truncate text-small aria-[current]:font-medium">{th.title}</span>
          {meta ? <span className="shrink-0 text-caption text-ink-muted">{meta}</span> : null}
        </button>
      </li>
    );
  };

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
      {groups.filter((g) => g.items.length).map((g) => (
        <div key={g.key} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5">
          {g.key === "all" ? null : <p className="px-2.5 text-caption font-medium text-ink-muted">{t(g.key)}</p>}
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-0.5">{g.items.map(row)}</ul>
        </div>
      ))}
      {real.length > SHOWN ? (
        <button type="button" onClick={() => setAll(!all)} className="justify-self-start rounded-control px-2.5 py-1 text-small text-info outline-none hover:underline focus-visible:ring-2 focus-visible:ring-money">
          {all ? t("showLess") : t("showAll", { n: real.length })}
        </button>
      ) : null}
    </div>
  );
}
