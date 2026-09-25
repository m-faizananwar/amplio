"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";
import type { SeriesRange } from "../../constants";
import type { SeriesPoint } from "../../server/queries";

// The chart itself is a separate chunk: recharts is 98 kB, and the numbers
// above it are what the page is for.
const ClicksChartCanvas = dynamic(() => import("./ClicksChartCanvas").then((m) => m.ClicksChartCanvas), {
  ssr: false,
  loading: () => <div className="mt-4 h-64"><ChartSkeleton /></div>,
});


const RANGES: Array<{ key: SeriesRange; label: string }> = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export function ClicksChart({ series, range, basePath }: { series: SeriesPoint[]; range: SeriesRange; basePath: string }) {
  const total = series.reduce((sum, p) => sum + p.clicks, 0);
  return (
    <section className="rounded-2xl border bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Performance over time</h2>
          <p className="text-sm text-muted-foreground">Qualified clicks · {total.toLocaleString("en-US")} in this range</p>
        </div>
        <div role="group" aria-label="Range" className="inline-flex rounded-lg border p-0.5 text-xs font-semibold">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`${basePath}?range=${r.key}`}
              aria-current={range === r.key ? "page" : undefined}
              className="rounded-md px-3 py-1.5 text-muted-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>
      <ClicksChartCanvas series={series} range={range} />
    </section>
  );
}
