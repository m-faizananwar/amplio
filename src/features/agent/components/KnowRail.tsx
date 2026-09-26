"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export type RailThread = { id: string; title: string };

type Props = { profile: Array<{ label: string; value: string }>; notes: string[]; threads: RailThread[]; current: string | null; onNewChat: () => void; onResume: (thread: RailThread) => void };

// The right rail on wide screens: what the agent works from (the profile
// summary the server passed in, and the notes it has kept), earlier chats to
// pick up again, and a fresh start. Both lists come empty until the agent
// tables exist, and then say so.

export function KnowRail({ profile, notes, threads, current, onNewChat, onResume }: Props) {
  const t = useTranslations("agent.rail");
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 grid gap-4">
        <Button variant="quiet" size="sm" icon={<Plus />} onClick={onNewChat} className="justify-self-start">{t("newChat")}</Button>
        <section className="grid gap-3 rounded-card border border-rule bg-surface p-4 shadow-lift">
          <h2 className="text-small font-semibold">{t("know")}</h2>
          <dl className="grid gap-2">
            <dt className="text-caption text-ink-muted">{t("profile")}</dt>
            {profile.map((p) => <dd key={p.label} className="text-small"><span className="text-ink-muted">{p.label}: </span>{p.value}</dd>)}
          </dl>
          <div className="grid gap-1">
            <p className="text-caption text-ink-muted">{t("notes")}</p>
            {notes.length ? <ul className="grid gap-1">{[...new Set(notes)].map((n) => <li key={n} className="rounded-control bg-paper px-2.5 py-1.5 text-small">{n}</li>)}</ul> : <p className="text-small text-ink-muted">{t("noNotes")}</p>}
          </div>
        </section>
        <section className="grid gap-1 rounded-card border border-rule bg-surface p-4 shadow-lift">
          <h2 className="text-small font-semibold">{t("threads")}</h2>
          {threads.length ? (
            <ul className="grid gap-0.5">
              {threads.map((th) => <li key={th.id}><button type="button" aria-current={th.id === current || undefined} onClick={() => onResume(th)} className="w-full truncate rounded-control px-2.5 py-1.5 text-left text-small outline-none hover:bg-well focus-visible:ring-2 focus-visible:ring-money aria-[current]:bg-well aria-[current]:font-medium">{th.title}</button></li>)}
            </ul>
          ) : <p className="text-small text-ink-muted">{t("noThreads")}</p>}
        </section>
      </div>
    </aside>
  );
}
