"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// The right rail on wide screens: what the agent works from (the profile
// summary the server passed in), the notes it keeps (none are stored yet, and
// it says so), earlier chats, and a fresh start.
export function KnowRail({ profile, onNewChat }: { profile: Array<{ label: string; value: string }>; onNewChat: () => void }) {
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
          <div className="grid gap-1"><p className="text-caption text-ink-muted">{t("notes")}</p><p className="text-small text-ink-muted">{t("noNotes")}</p></div>
        </section>
        <section className="grid gap-1 rounded-card border border-rule bg-surface p-4 shadow-lift">
          <h2 className="text-small font-semibold">{t("threads")}</h2>
          <p className="text-small text-ink-muted">{t("noThreads")}</p>
        </section>
      </div>
    </aside>
  );
}
