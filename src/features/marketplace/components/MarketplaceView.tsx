"use client";

import { Bookmark, SearchX } from "lucide-react";
import { cn } from "cn";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";
import { EmptyState } from "@/components/page/EmptyState";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "../constants";
import type { CountryOptionDto, CreatorListDto, MarketplaceContextDto, MarketplaceQuery } from "../schemas";
import { CreatorGrid } from "./cards/CreatorGrid";
import { ImprovingStrip } from "./cards/ImprovingStrip";
import { ShowMoreButton } from "./cards/ShowMoreButton";
import { CampaignSelector } from "./filters/CampaignSelector";
import { MarketplaceToolbar } from "./filters/MarketplaceToolbar";
import { useMarketplaceUrl } from "./filters/useMarketplaceUrl";
import { MarketplaceProvider } from "./MarketplaceProvider";

import { LazyGlobe } from "@/features/globe/components/LazyGlobe";
type Props = { ctx: MarketplaceContextDto; list: CreatorListDto; query: MarketplaceQuery; countries: CountryOptionDto[] };

function ListTabs({ query, list }: { query: MarketplaceQuery; list: CreatorListDto }) {
  const { update } = useMarketplaceUrl();
  const tabs = [
    { key: "all", label: "All creators", count: query.tab === "all" ? list.total : list.allCount },
    { key: "shortlist", label: "Shortlist", count: list.shortlistCount },
  ] as const;
  return (
    <SlidingIndicator variant="underline" className="border-b">
    <div role="tablist" aria-label="Creator lists" className="flex gap-1">
      {tabs.map((tab) => {
        const active = query.tab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => update({ tab: tab.key === "all" ? undefined : tab.key })}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active ? "text-brand" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-brand text-brand-foreground" : "bg-muted")}>{tab.count}</span>
          </button>
        );
      })}
    </div>
    </SlidingIndicator>
  );
}

function ListBody({ list, query }: { list: CreatorListDto; query: MarketplaceQuery }) {
  const { reset, update } = useMarketplaceUrl();
  if (list.items.length > 0) {
    return (
      <>
        <ImprovingStrip />
        <CreatorGrid creators={list.items} topRanked={list.topRanked} />
        <ShowMoreButton shown={Math.min(list.items.length, query.page * PAGE_SIZE)} total={list.total} page={query.page} hasMore={list.hasMore} />
      </>
    );
  }
  if (query.tab === "shortlist") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Bookmark className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Your shortlist is empty</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">Bookmark creators from the marketplace to compare them here before booking.</p>
        <Button type="button" className="mt-6" onClick={() => update({ tab: undefined })}>
          Browse all creators
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">No creators match these filters</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">Try a wider price range, another industry or country, or clear the search.</p>
      <Button type="button" className="mt-6" onClick={reset}>
        Reset filters
      </Button>
    </div>
  );
}

export function MarketplaceView({ ctx, list, query, countries }: Props) {
  return (
    <MarketplaceProvider ctx={ctx}>
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">All creators</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              All creators are shown from most to least relevant, using sector fit first and verified performance statistics to refine the order.
            </p>
          </div>
          <CampaignSelector campaigns={ctx.campaigns} selected={ctx.selectedCampaign} />
        </div>
        {ctx.campaigns.length === 0 ? (
          <EmptyState
            title="No campaign to match against yet"
            body="Fit scores need a campaign brief. Create one and every card will show how well the creator fits it."
            cta={{ href: "/brand/campaigns", label: "Create a campaign" }}
          />
        ) : null}
        <ListTabs query={query} list={list} />
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1"><MarketplaceToolbar query={query} countries={countries} count={list.total} /></div>
          <LazyGlobe size={120} countries={countries} className="hidden shrink-0 xl:block" label="Creators by country — use the country filter to narrow the list" />
        </div>
        <ListBody list={list} query={query} />
      </section>
    </MarketplaceProvider>
  );
}
