"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { useListTransition } from "@/components/motion/useListTransition";
import { toast } from "sonner";
import { buttonVariants, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OpportunityDto } from "../../schemas";
import { applyToCampaign } from "../../server/actions";
import { BriefDrawer } from "../brief/BriefDrawer";
import { ApplyDialog } from "./ApplyDialog";
import { distinctValues, filterOpportunities } from "./filterOpportunities";
import { INITIAL_FILTERS, OpportunityFilters } from "./OpportunityFilters";
import { OpportunityRow } from "./OpportunityRow";
import { RadarScene } from "@/components/graphics/scenes";

type Props = { opportunities: OpportunityDto[]; csrfToken: string };

// Open campaigns as a ranked ledger: best fit first, the fit explained in
// place, the brief one click away, applying behind one confirm.
export function OpportunitiesView({ opportunities, csrfToken }: Props) {
  const t = useTranslations("creator.opportunities");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const listTransition = useListTransition();
  const [confirming, setConfirming] = useState<OpportunityDto | null>(null);
  const [briefFor, setBriefFor] = useState<OpportunityDto | null>(null);
  // The row flips to "Applying…" at once and back on its own if the action fails.
  const [pendingIds, addPending] = useOptimistic<string[], string>([], (ids, id) => [...ids, id]);
  const industries = useMemo(() => distinctValues(opportunities, (o) => o.industries), [opportunities]);
  const regions = useMemo(() => distinctValues(opportunities, (o) => o.regions), [opportunities]);
  const visible = useMemo(() => filterOpportunities(opportunities, filters), [opportunities, filters]);

  function apply(o: OpportunityDto) {
    setConfirming(null);
    startTransition(async () => {
      addPending(o.campaignId);
      const result = await applyToCampaign({ campaignId: o.campaignId, csrfToken });
      if (!result.ok) toast.error(result.error);
      else toast.success(t("applyDialog.success", { brand: o.brandCompany }));
    });
  }

  if (opportunities.length === 0) {
    return <EmptyState illustration={<RadarScene />} title={t("empty.none.title")} body={t("empty.none.body")} action={<Link href="/creator/card" className={buttonVariants()}>{t("empty.none.action")}</Link>} />;
  }
  return (
    <div className="grid gap-4">
      <OpportunityFilters value={filters} onChange={(next) => listTransition(() => setFilters(next))} industries={industries} regions={regions} count={visible.length} />
      {visible.length === 0 ? (
        <EmptyState size="compact" title={t("empty.filtered.title")} body={t("empty.filtered.body")} action={<Button variant="secondary" onClick={() => setFilters(INITIAL_FILTERS)}>{t("empty.filtered.action")}</Button>} />
      ) : (
        <ol className="list-stagger divide-y divide-rule rounded-card border border-rule bg-surface">
          {visible.map((o) => <OpportunityRow key={o.campaignId} opportunity={o} pending={pendingIds.includes(o.campaignId)} onApply={setConfirming} onBrief={setBriefFor} />)}
        </ol>
      )}
      <ApplyDialog opportunity={confirming} onOpenChange={(open) => !open && setConfirming(null)} onConfirm={apply} />
      {briefFor ? <BriefDrawer brief={briefFor.brief} open onOpenChange={(open) => !open && setBriefFor(null)} /> : null}
    </div>
  );
}
