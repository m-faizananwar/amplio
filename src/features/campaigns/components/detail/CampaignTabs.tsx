import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";
import { cn } from "@/lib/cn";

export type CampaignTabKey = "collaborations" | "brief" | "shortlist" | "analytics";

const TABS: Array<{ key: CampaignTabKey; path: string }> = [
  { key: "collaborations", path: "" },
  { key: "brief", path: "/brief" },
  { key: "shortlist", path: "/shortlist" },
  { key: "analytics", path: "/analytics" },
];

export function tabPath(tab: CampaignTabKey) {
  return TABS.find((t) => t.key === tab)?.path ?? "";
}

// The four sections of a campaign, as links (each is its own URL).
export async function CampaignTabs({ campaignId, active }: { campaignId: string; active: CampaignTabKey }) {
  const t = await getTranslations("brand.campaigns.detail.tabs");
  return (
    <nav aria-label={t("label")}>
      <SlidingIndicator variant="underline" className="overflow-x-auto border-b border-rule">
        <ul className="flex gap-5">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <Link href={`/brand/campaigns/${campaignId}${tab.path}`} aria-current={tab.key === active ? "page" : undefined}
                className={cn("inline-block py-2 text-body text-ink-muted outline-none transition-colors duration-(--duration-fast) hover:text-ink focus-visible:ring-3 focus-visible:ring-ink/15", tab.key === active && "font-medium text-ink")}>
                {t(tab.key)}
              </Link>
            </li>
          ))}
        </ul>
      </SlidingIndicator>
    </nav>
  );
}
