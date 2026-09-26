"use client";

import { useTranslations } from "next-intl";
import { type RailThread, ThreadList } from "./ThreadList";

export type KnowProps = { profile: Array<{ label: string; value: string }>; notes: string[]; threads: RailThread[]; current: string | null; onResume: (thread: RailThread) => void };

// What the agent works from (the profile summary and the notes it keeps) and
// the earlier conversations: the same content in the rail and in the drawer.
export function KnowPanel({ profile, notes, threads, current, onResume }: KnowProps) {
  const t = useTranslations("agent.rail");
  return (
    <>
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
      <section className="grid gap-2 rounded-card border border-rule bg-surface p-3 shadow-lift">
        <h2 className="px-1.5 text-small font-semibold">{t("threads")}</h2>
        <ThreadList threads={threads} current={current} onResume={onResume} />
      </section>
    </>
  );
}
