import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";
import { cn } from "@/lib/cn";
import { CREATORS_PATH, MATCHING_PATH } from "../constants";

type Props = { active: "matching" | "marketplace"; campaignId?: string | null };

// Two ways to find creators: the ranked list you filter yourself, or describe
// who you want and let the assistant rank them with a reason each.
export async function CreatorsTabs({ active, campaignId }: Props) {
  const t = await getTranslations("brand.creators.modes");
  const suffix = campaignId ? `?campaign=${campaignId}` : "";
  const tabs = [
    { key: "marketplace", label: t("list"), href: `${CREATORS_PATH}${suffix}` },
    { key: "matching", label: t("match"), href: `${MATCHING_PATH}${suffix}` },
  ] as const;
  return (
    <SlidingIndicator variant="underline" className="mb-6 border-b border-rule">
      <nav aria-label={t("label")} className="flex gap-5">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active === tab.key ? "page" : undefined}
            className={cn("py-2 text-body text-ink-muted outline-none transition-colors duration-(--duration-fast) hover:text-ink focus-visible:ring-3 focus-visible:ring-ink/15", active === tab.key && "font-medium text-ink")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </SlidingIndicator>
  );
}
