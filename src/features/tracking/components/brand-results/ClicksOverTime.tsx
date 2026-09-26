"use client";

import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { SeriesRange } from "../../constants";
import type { SeriesPoint } from "../../server/queries";

const Canvas = dynamic(() => import("../results/ClicksChartCanvas").then((m) => m.ClicksChartCanvas), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 overflow-hidden"><ChartSkeleton /></div>,
});

const RANGES: SeriesRange[] = ["week", "month", "year"];

// One card: clicks per day for the chosen range, and in its footer whatever
// explains where the numbers come from (the pixel). The range is in the URL
// so a link can share it; switching re-reads on the server (cached).
export function ClicksOverTime({ series, range, footer }: { series: SeriesPoint[]; range: SeriesRange; footer?: ReactNode }) {
  const t = useTranslations("brand.results.chart");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const total = series.reduce((sum, p) => sum + p.clicks, 0);
  return (
    <section aria-labelledby="chart-title" className="grid gap-2 rounded-card border border-rule bg-surface p-5 shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="chart-title" className="text-h4">{t("title")}</h2>
          <p className="text-small text-ink-muted">{t("description", { total: format.number(total) })}</p>
        </div>
        <SegmentedControl size="sm" label={t("range")} value={range} onValueChange={(next) => router.replace(`${pathname}?range=${next}`, { scroll: false })} options={RANGES.map((r) => ({ value: r, label: t(`ranges.${r}`) }))} />
      </div>
      <Canvas series={series} range={range} />
      {footer ? <div className="mt-2 border-t border-rule pt-4">{footer}</div> : null}
    </section>
  );
}
