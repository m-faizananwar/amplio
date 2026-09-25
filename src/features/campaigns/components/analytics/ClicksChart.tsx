"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";

// recharts is the heaviest thing on the analytics tab and the only part of it
// that is not text; it loads as its own chunk, behind the same skeleton the
// rest of the page uses.
const ClicksChartCanvas = dynamic(() => import("./ClicksChartCanvas").then((m) => m.ClicksChartCanvas), {
  ssr: false,
  loading: () => <div className="h-64 w-full"><ChartSkeleton /></div>,
});

export function ClicksChart({ data }: { data: Array<{ day: string; clicks: number }> }) {
  return <ClicksChartCanvas data={data} />;
}
