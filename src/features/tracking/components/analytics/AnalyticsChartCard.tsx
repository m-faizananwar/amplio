"use client";

import { ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";
import { Card } from "@/components/ui/card";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { SeriesPoint } from "./analytics-series";

const Canvas = dynamic(() => import("./MetricChartCanvas").then((m) => m.MetricChartCanvas), {
  ssr: false,
  loading: () => <div className="h-56 overflow-hidden"><ChartSkeleton /></div>,
});

export type Metric = { key: string; label: string; value: number; hint?: string; tone: "ink" | "money"; points: SeriesPoint[] | null; onOpen: () => void };

// Every figure in one card: pick one along the top and its line draws below;
// "See the rows" opens what it is made of. Followers is a single reading, so
// it says so rather than drawing a flat line.
export function AnalyticsChartCard({ metrics, empty }: { metrics: Metric[]; empty: (key: string) => ReactNode }) {
  const t = useTranslations("creator.analytics");
  const format = useFormatter();
  const [selected, setSelected] = useState(metrics[metrics.length - 1]?.key);
  const m = metrics.find((x) => x.key === selected) ?? metrics[0];
  const n = (v: number) => format.number(v, { notation: "compact" });
  const day = (iso: string) => format.dateTime(new Date(`${iso}T00:00:00Z`), { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <Card className="gap-0 py-0">
      <div role="group" aria-label={t("chart.pick")} className="grid grid-cols-2 border-b border-rule sm:grid-cols-5">
        {metrics.map((x) => (
          <button key={x.key} type="button" aria-pressed={x.key === m.key} onClick={() => setSelected(x.key)}
            className="grid content-start gap-0.5 border-rule px-5 py-4 text-left outline-none transition-colors duration-(--duration-fast) not-last:border-r hover:bg-tint focus-visible:bg-tint aria-pressed:bg-tint max-sm:odd:border-r max-sm:[&:nth-child(-n+4)]:border-b max-sm:last:odd:col-span-2 max-sm:last:odd:border-r-0">
            <span className="text-caption text-ink-muted">{x.label}</span>
            <span className={`text-lead font-semibold ${x.tone === "money" ? "text-money" : "text-ink"}`}><RollingNumber value={x.value} format={(v) => format.number(v)} /></span>
            {x.hint ? <span className="truncate text-caption text-ink-muted">{x.hint}</span> : null}
          </button>
        ))}
      </div>
      <div className="grid gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-small font-medium text-ink">{t(`chart.titles.${m.key}`)}</p>
          <button type="button" onClick={m.onOpen} className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-control text-caption font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ink/15">
            {t("metrics.openTrail")}<ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
        {m.points === null ? <p className="py-10 text-center text-small text-ink-muted">{t("chart.followers")}</p>
          : m.points.length === 0 ? empty(m.key)
          : <Canvas points={m.points} tone={m.tone} label={m.label} replayKey={m.key} format={n} day={day} />}
      </div>
    </Card>
  );
}
