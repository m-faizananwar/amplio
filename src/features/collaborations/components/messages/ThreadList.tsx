"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { CampaignOption, ThreadDto, ViewerRole } from "../../schemas";
import { ThreadListItem } from "./ThreadListItem";
import { TypingScene } from "@/components/graphics/scenes";

type Props = { threads: ThreadDto[]; role: ViewerRole; activeId: string | null; campaigns: CampaignOption[] };

// Every open thread, newest first, searchable by name or campaign.
export function ThreadList({ threads, role, activeId }: Props) {
  const t = useTranslations("collaboration.messages");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? threads.filter((th) => `${th.counterpartName} ${th.campaignName}`.toLowerCase().includes(q)) : threads;
  }, [threads, query]);
  if (threads.length === 0) {
    const empty = role === "brand" ? "brandNoThreads" : "noThreads";
    const href = role === "brand" ? "/brand/creators" : "/creator/opportunities";
    return <EmptyState size="compact" className="m-4 border-0" illustration={<TypingScene />} title={t(`empty.${empty}.title`)} body={t(`empty.${empty}.body`)} action={<Link href={href} className={buttonVariants({ variant: "secondary" })}>{t(`empty.${empty}.action`)}</Link>} />;
  }
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-rule p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <Input type="search" aria-label={t("list.search")} placeholder={t("list.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </div>
      <ul className="list-stagger min-h-0 flex-1 divide-y divide-rule overflow-y-auto">
        {visible.map((th) => <ThreadListItem key={th.collaborationId} thread={th} role={role} active={activeId === th.collaborationId} />)}
      </ul>
      {visible.length === 0 ? <p className="px-4 py-6 text-small text-ink-muted">{t("list.noMatch")}</p> : null}
    </div>
  );
}
