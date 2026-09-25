"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/page/EmptyState";
import { BRAND_TABS, BRAND_TAB_LABELS, type BrandTab, brandTabFor, countByTab } from "@/lib/collaboration-labels";
import type { CampaignOption, CollaborationDto } from "../../schemas";
import { COPY } from "../../ui-constants";
import { CollaborationTabs } from "./CollaborationTabs";
import { CollaborationsTable } from "./CollaborationsTable";
import { TablePagination } from "./TablePagination";
import { usePagedRows } from "./usePagedRows";

type Props = { rows: CollaborationDto[]; campaigns: CampaignOption[] };

export function BrandCollaborationsView({ rows, campaigns }: Props) {
  const [tab, setTab] = useState<BrandTab>("all");
  const [campaignId, setCampaignId] = useState("");
  const inCampaign = useMemo(() => (campaignId ? rows.filter((r) => r.campaignId === campaignId) : rows), [rows, campaignId]);
  const counts = useMemo(() => countByTab(inCampaign.map((r) => r.status), BRAND_TABS, brandTabFor), [inCampaign]);
  const filtered = useMemo(
    () => (tab === "all" ? inCampaign : inCampaign.filter((r) => brandTabFor(r.status) === tab)),
    [inCampaign, tab],
  );
  const paged = usePagedRows(filtered);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No collaborations yet"
        body="Invite a creator from the Marketplace. Accepted bookings show up here."
        cta={{ href: "/brand/creators", label: "Open the marketplace" }}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Campaign
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CollaborationTabs tabs={BRAND_TABS} labels={BRAND_TAB_LABELS} counts={counts} value={tab} onChange={setTab} />
      {/* keyed on the tab so the rows crossfade in when the filter changes */}
      <div key={tab} className="tab-swap overflow-hidden rounded-2xl border bg-background">
        <CollaborationsTable rows={paged.pageRows} role="brand" emptyMessage={COPY.brandEmpty} />
        <TablePagination
          total={filtered.length}
          page={paged.page}
          pageSize={paged.pageSize}
          onPageChange={paged.setPage}
          onPageSizeChange={paged.setPageSize}
        />
      </div>
    </>
  );
}
