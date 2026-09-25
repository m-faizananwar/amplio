"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countByFilter, filterFor, type NextStepFilter } from "@/lib/next-step";
import type { CampaignOption, CollaborationDto } from "../../schemas";
import { BrandCollaborationRow } from "./BrandCollaborationRow";

// For a brand, a live post is "needs you" (releasing the payment is theirs),
// so the list has no separate Live group.
export type BrandListFilter = Exclude<NextStepFilter, "live"> | "all";
const FILTERS: BrandListFilter[] = ["needs_you", "waiting", "done", "all"];
const LABEL: Record<BrandListFilter, string> = { needs_you: "needsYou", waiting: "waiting", done: "done", all: "all" };
const ALL = "all";

type Props = { rows: CollaborationDto[]; campaigns: CampaignOption[]; initialFilter: BrandListFilter | null };

// Default view is Needs you. The filter lives in the URL (?filter=) so the
// Overview and notifications can link to a group.
export function BrandCollaborationsList({ rows, campaigns, initialFilter }: Props) {
  const t = useTranslations("brand.collaborations");
  const router = useRouter();
  const pathname = usePathname();
  // No filter in the URL: Needs you when something does, otherwise everything —
  // an empty default view with rows one click away reads as "nothing here".
  const [filter, setFilter] = useState<BrandListFilter>(() => initialFilter ?? (rows.some((r) => filterFor(r.status, "brand") === "needs_you") ? "needs_you" : "all"));
  const [campaign, setCampaign] = useState<string>(ALL);
  const scoped = useMemo(() => (campaign === ALL ? rows : rows.filter((r) => r.campaignId === campaign)), [rows, campaign]);
  const counts = useMemo(() => countByFilter(scoped.map((r) => r.status), "brand"), [scoped]);
  const visible = useMemo(() => (filter === "all" ? scoped : scoped.filter((r) => filterFor(r.status, "brand") === filter)), [scoped, filter]);
  const choose = (next: BrandListFilter) => {
    setFilter(next);
    router.replace(`${pathname}?filter=${next}`, { scroll: false });
  };

  if (rows.length === 0) {
    return <EmptyState title={t("empty.none.title")} body={t("empty.none.body")} action={<Link href="/brand/creators" className={buttonVariants()}>{t("empty.none.action")}</Link>} />;
  }
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => choose(v as BrandListFilter)}>
          <TabsList variant="pill" aria-label={t("filters.label")} className="max-w-full overflow-x-auto">
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {t(`filters.${LABEL[f]}`)} <span className="num text-caption text-ink-muted">{f === "all" ? scoped.length : counts[f]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {campaigns.length > 1 ? (
          <Select value={campaign} onValueChange={(v) => setCampaign(String(v))} items={[{ value: ALL, label: t("filters.allCampaigns") }, ...campaigns.map((c) => ({ value: c.id, label: c.name }))]}>
            <SelectTrigger size="sm" className="w-56" aria-label={t("filters.campaign")}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allCampaigns")}</SelectItem>
              {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <EmptyState size="compact" title={t(`empty.${LABEL[filter]}.title`)} body={t(`empty.${LABEL[filter]}.body`)} action={<Button variant="secondary" onClick={() => choose("all")}>{t(`empty.${LABEL[filter]}.action`)}</Button>} />
      ) : (
        <ol key={`${filter}-${campaign}`} className="tab-swap list-stagger divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface">
          {visible.map((c) => <BrandCollaborationRow key={c.id} c={c} />)}
        </ol>
      )}
    </div>
  );
}
