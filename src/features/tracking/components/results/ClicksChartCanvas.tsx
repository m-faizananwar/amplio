"use client";

import { DrawnChart } from "@/components/motion/DrawnChart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesRange } from "../../constants";
import type { SeriesPoint } from "../../server/queries";

// naano draws every line chart on mount: 2.5s ease-out after a 0.5s delay.
// Split from ClicksChart so recharts (98 kB) loads with the chart, not with
// the page around it.
export function ClicksChartCanvas({ series, range }: { series: SeriesPoint[]; range: SeriesRange }) {
  return (
    <DrawnChart replayKey={range} className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)", fontSize: 12 }} />
          <Line type="monotone" dataKey="clicks" stroke="var(--color-brand)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DrawnChart>
  );
}
