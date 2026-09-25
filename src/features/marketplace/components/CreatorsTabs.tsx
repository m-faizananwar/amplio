import Link from "next/link";
import { cn } from "cn";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";
import { CREATORS_PATH, MATCHING_PATH } from "../constants";

type Props = { active: "matching" | "marketplace"; campaignId?: string | null };

// The two top-level tabs of Brand › Creators, in the product's order.
export function CreatorsTabs({ active, campaignId }: Props) {
  const suffix = campaignId ? `?campaign=${campaignId}` : "";
  const tabs = [
    { key: "matching", label: "AI Matching", href: `${MATCHING_PATH}${suffix}` },
    { key: "marketplace", label: "Creator Marketplace", href: `${CREATORS_PATH}${suffix}` },
  ] as const;
  return (
    // The white chip is the indicator now, so it slides between the two.
    <SlidingIndicator variant="pill" className="mb-6 inline-flex rounded-lg bg-muted p-1 text-sm font-medium">
    <nav aria-label="Creators" className="inline-flex">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={cn(
            "rounded-md px-4 py-1.5 text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring",
            active === tab.key && "text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
    </SlidingIndicator>
  );
}
