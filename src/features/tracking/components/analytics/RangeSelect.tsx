"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { AnalyticsRange } from "@/features/tracking/server/creator-queries";

// All time / 30 / 90 days; drives the URL so the server re-queries the range.
export function RangeSelect({ value }: { value: AnalyticsRange }) {
  const t = useTranslations("creator.analytics.range");
  const router = useRouter();
  const pathname = usePathname();
  return (
    <SegmentedControl
      size="sm"
      label={t("label")}
      value={value}
      onValueChange={(next) => router.push(next === "all" ? pathname : `${pathname}?range=${next}`, { scroll: false })}
      options={[{ value: "all", label: t("all") }, { value: "30", label: t("last30") }, { value: "90", label: t("last90") }]}
    />
  );
}
