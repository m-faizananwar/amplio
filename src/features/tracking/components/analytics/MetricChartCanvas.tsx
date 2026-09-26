"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DrawnChart } from "@/components/motion/DrawnChart";
import type { SeriesPoint } from "./analytics-series";

type Props = { points: SeriesPoint[]; tone: "ink" | "money"; label: string; replayKey: string; format: (v: number) => string; day: (iso: string) => string };

// Split from MetricChart so recharts loads with the chart, not the page. The
// line draws in (DrawnChart), the tooltip is the crosshair.
export function MetricChartCanvas({ points, tone, label, replayKey, format, day }: Props) {
  const stroke = tone === "money" ? "var(--color-money)" : "var(--color-ink)";
  return (
    <DrawnChart replayKey={replayKey} className="h-56" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-rule)" />
          <XAxis dataKey="at" tickFormatter={day} tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} />
          <YAxis tickFormatter={format} allowDecimals={false} width={44} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} />
          <Tooltip cursor={{ stroke: "var(--color-rule-strong)" }} labelFormatter={(v) => day(String(v))} formatter={(v) => [format(Number(v)), label]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-rule)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={points.length <= 24 ? { r: 3, fill: stroke, strokeWidth: 0 } : false} activeDot={{ r: 5 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DrawnChart>
  );
}
