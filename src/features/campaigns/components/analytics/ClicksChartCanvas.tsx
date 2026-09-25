"use client";

// naano draws every line chart on mount: 2.5s ease-out after a 0.5s delay.

import { DrawnChart } from "@/components/motion/DrawnChart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatShortDay } from "@/lib/dates";

type Props = { data: Array<{ day: string; clicks: number }> };

// Single series, so no legend: the title names it. Brand blue, thin line,
// recessive grid, crosshair tooltip.
export function ClicksChartCanvas({ data }: Props) {
  const points = data.map((d) => ({ ...d, label: formatShortDay(d.day) }));
  return (
    <DrawnChart replayKey={points.length} className="h-64 w-full" role="img" aria-label="Daily qualified clicks over the last 12 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={40} />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
            formatter={(value) => [`${value} clicks`, "Qualified clicks"]}
          />
          <Line type="monotone" dataKey="clicks" stroke="var(--brand)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "var(--brand)", stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DrawnChart>
  );
}
