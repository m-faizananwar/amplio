"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_SIZE } from "../constants";
import type { CountryOptionDto, CreatorListDto, MarketplaceContextDto, MarketplaceQuery } from "../schemas";
import { CampaignSelector } from "./filters/CampaignSelector";
import { MarketplaceToolbar } from "./filters/MarketplaceToolbar";
import { useMarketplaceUrl } from "./filters/useMarketplaceUrl";
import { CreatorLedgerRow } from "./ledger/CreatorLedgerRow";
import { MarketplaceProvider } from "./MarketplaceProvider";

type Props = { ctx: MarketplaceContextDto; list: CreatorListDto; query: MarketplaceQuery; countries: CountryOptionDto[] };

// Creators as a ranked ledger: best fit for the selected campaign first, one
// row each, the same few facts side by side so they can be compared. The fit
// score opens in place; Invite is on the row (no separate Invite page).
export function MarketplaceView({ ctx, list, query, countries }: Props) {
  const t = useTranslations("brand.creators");
  const { update } = useMarketplaceUrl();
  return (
    <MarketplaceProvider ctx={ctx}>
      <div className="grid gap-5">
        {ctx.campaigns.length === 0 ? (
          <EmptyState size="compact" title={t("noCampaign.title")} body={t("noCampaign.body")} action={<Link href="/brand/campaigns/new" className={buttonVariants()}>{t("noCampaign.action")}</Link>} />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={query.tab} onValueChange={(v) => update({ tab: v === "all" ? undefined : String(v) })}>
            <TabsList variant="pill" aria-label={t("lists.label")}>
              <TabsTrigger value="all">{t("lists.all")} <span className="num text-caption text-ink-muted">{query.tab === "all" ? list.total : list.allCount}</span></TabsTrigger>
              <TabsTrigger value="shortlist">{t("lists.shortlist")} <span className="num text-caption text-ink-muted">{list.shortlistCount}</span></TabsTrigger>
            </TabsList>
          </Tabs>
          <CampaignSelector campaigns={ctx.campaigns} selected={ctx.selectedCampaign} />
        </div>
        <MarketplaceToolbar query={query} countries={countries} count={list.total} />
        <ListBody list={list} query={query} />
      </div>
    </MarketplaceProvider>
  );
}

function ListBody({ list, query }: { list: CreatorListDto; query: MarketplaceQuery }) {
  const t = useTranslations("brand.creators");
  const { reset, update } = useMarketplaceUrl();
  if (list.items.length === 0) {
    return query.tab === "shortlist"
      ? <EmptyState title={t("empty.shortlist.title")} body={t("empty.shortlist.body")} action={<Button variant="secondary" onClick={() => update({ tab: undefined })}>{t("empty.shortlist.action")}</Button>} />
      : <EmptyState title={t("empty.filters.title")} body={t("empty.filters.body")} action={<Button variant="secondary" onClick={reset}>{t("empty.filters.action")}</Button>} />;
  }
  const shown = Math.min(list.items.length, query.page * PAGE_SIZE);
  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-card border border-rule bg-surface">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_6.5rem_5.5rem_5.5rem_5.5rem_9.5rem] gap-4 border-b border-rule px-5 py-2.5 text-caption text-ink-muted md:grid" aria-hidden="true">
          <span>{t("columns.creator")}</span><span>{t("columns.fit")}</span><span>{t("columns.followers")}</span><span>{t("columns.views")}</span><span>{t("columns.price")}</span><span />
        </div>
        <ol key={`${query.tab}-${query.sort}`} className="list-stagger divide-y divide-rule">
          {list.items.map((c) => <CreatorLedgerRow key={c.id} creator={c} />)}
        </ol>
      </div>
      {list.hasMore ? (
        <Button variant="secondary" className="justify-self-center" onClick={() => update({ page: query.page + 1 }, { keepPage: true })}>{t("more", { shown, total: list.total })}</Button>
      ) : (
        <p className="text-center text-small text-ink-muted">{t("all", { total: list.total })}</p>
      )}
    </div>
  );
}
