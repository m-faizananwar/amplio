import Link from "next/link";

import { SlidingIndicator } from "@/components/motion/SlidingIndicator";

export type CampaignTabKey = "collaborations" | "brief" | "shortlist" | "analytics";

const TABS: Array<{ key: CampaignTabKey; label: string; path: string }> = [
  { key: "collaborations", label: "Collaborations", path: "" },
  { key: "brief", label: "Brief", path: "/brief" },
  { key: "shortlist", label: "Shortlist", path: "/shortlist" },
  { key: "analytics", label: "Analytics", path: "/analytics" },
];

export function tabPath(tab: CampaignTabKey) {
  return TABS.find((t) => t.key === tab)?.path ?? "";
}

export function CampaignTabs({ campaignId, active }: { campaignId: string; active: CampaignTabKey }) {
  return (
    <nav aria-label="Campaign sections" className="-mx-4 px-4 lg:mx-0 lg:px-0">
      <SlidingIndicator variant="underline" className="overflow-x-auto border-b">
      <ul className="flex gap-1">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={`/brand/campaigns/${campaignId}${tab.path}`}
              aria-current={tab.key === active ? "page" : undefined}
              className="inline-block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground aria-[current=page]:text-brand"
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      </SlidingIndicator>
    </nav>
  );
}
