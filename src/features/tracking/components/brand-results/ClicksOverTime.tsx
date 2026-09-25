"use client";

import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { SeriesRange } from "../../constants";
import type { SeriesPoint } from "../../server/queries";
import { Section } from "./Section";

const Canvas = dynamic(() => import("../results/ClicksChartCanvas").then((m) => m.ClicksChartCanvas), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 overflow-hidden"><ChartSkeleton /></div>,
});

const RANGES: SeriesRange[] = ["week", "month", "year"];

// Clicks per day for the chosen range. The range is in the URL so a link can
// share it; switching re-reads on the server (the series is cached).
export function ClicksOverTime({ series, range }: { series: SeriesPoint[]; range: SeriesRange }) {
  const t = useTranslations("brand.results.chart");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const total = series.reduce((sum, p) => sum + p.clicks, 0);
  return (
    <Section
      id="chart-title"
      title={t("title")}
      description={t("description", { total: format.number(total) })}
      action={<SegmentedControl size="sm" label={t("range")} value={range} onValueChange={(next) => router.replace(`${pathname}?range=${next}`, { scroll: false })} options={RANGES.map((r) => ({ value: r, label: t(`ranges.${r}`) }))} />}
    >
      <div className="rounded-card border border-rule bg-surface p-4"><Canvas series={series} range={range} /></div>
    </Section>
  );
}
