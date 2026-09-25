"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countByFilter, filterFor, type NextStepFilter } from "@/lib/next-step";
import type { CollaborationDto } from "../../schemas";
import { CreatorCollaborationRow } from "./CreatorCollaborationRow";

export type ListFilter = NextStepFilter | "all";
const FILTERS: ListFilter[] = ["needs_you", "waiting", "live", "done", "all"];
const LABEL_KEY: Record<ListFilter, string> = { needs_you: "needsYou", waiting: "waitingOnBrand", live: "live", done: "done", all: "all" };

// Default view is Needs you: the rows waiting on the creator. The filter is
// kept in the URL so the Overview can link straight to "live".
export function CreatorCollaborationsList({ rows, initialFilter }: { rows: CollaborationDto[]; initialFilter: ListFilter }) {
  const t = useTranslations("creator.collaborations");
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<ListFilter>(initialFilter);
  const counts = useMemo(() => countByFilter(rows.map((r) => r.status), "creator"), [rows]);
  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((r) => filterFor(r.status, "creator") === filter)), [rows, filter]);
  const choose = (next: ListFilter) => {
    setFilter(next);
    router.replace(next === "needs_you" ? pathname : `${pathname}?filter=${next}`, { scroll: false });
  };

  if (rows.length === 0) {
    return <EmptyState title={t("empty.none.title")} body={t("empty.none.body")} action={<Link href="/creator/opportunities" className={buttonVariants()}>{t("empty.none.action")}</Link>} />;
  }
  const emptyKey = LABEL_KEY[filter];
  return (
    <div className="grid gap-4">
      <Tabs value={filter} onValueChange={(v) => choose(v as ListFilter)}>
        <TabsList variant="pill" aria-label={t("filters.label")} className="max-w-full overflow-x-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {t(`filters.${LABEL_KEY[f]}`)} <span className="num text-caption text-ink-muted">{f === "all" ? rows.length : counts[f]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {visible.length === 0 ? (
        <EmptyState size="compact" title={t(`empty.${emptyKey}.title`)} body={t(`empty.${emptyKey}.body`)} action={<Button variant="secondary" onClick={() => choose("all")}>{t(`empty.${emptyKey}.action`)}</Button>} />
      ) : (
        <ol key={filter} className="tab-swap list-stagger divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface">
          {visible.map((c) => <CreatorCollaborationRow key={c.id} c={c} />)}
        </ol>
      )}
    </div>
  );
}
