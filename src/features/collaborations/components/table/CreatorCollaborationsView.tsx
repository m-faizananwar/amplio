"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/page/EmptyState";
import { CREATOR_TABS, CREATOR_TAB_LABELS, type CreatorTab, countByTab, creatorTabFor } from "@/lib/collaboration-labels";
import type { CollaborationDto } from "../../schemas";
import { COPY } from "../../ui-constants";
import { CollaborationTabs } from "./CollaborationTabs";
import { CollaborationsTable } from "./CollaborationsTable";
import { TablePagination } from "./TablePagination";
import { usePagedRows } from "./usePagedRows";

export function CreatorCollaborationsView({ rows }: { rows: CollaborationDto[] }) {
  const [tab, setTab] = useState<CreatorTab>("all");
  const counts = useMemo(() => countByTab(rows.map((r) => r.status), CREATOR_TABS, creatorTabFor), [rows]);
  const filtered = useMemo(() => (tab === "all" ? rows : rows.filter((r) => creatorTabFor(r.status) === tab)), [rows, tab]);
  const paged = usePagedRows(filtered);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No collaborations yet"
        body="Brand invitations and your accepted applications land here."
        cta={{ href: "/creator/opportunities", label: "Browse opportunities" }}
      />
    );
  }

  return (
    <>
      <CollaborationTabs tabs={CREATOR_TABS} labels={CREATOR_TAB_LABELS} counts={counts} value={tab} onChange={setTab} />
      {/* keyed on the tab so the rows crossfade in when the filter changes */}
      <div key={tab} className="tab-swap overflow-hidden rounded-2xl border bg-background">
        <CollaborationsTable rows={paged.pageRows} role="creator" emptyMessage={COPY.creatorEmpty} />
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
