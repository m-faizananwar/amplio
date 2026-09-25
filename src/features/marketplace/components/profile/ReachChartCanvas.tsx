"use client";

// naano draws every line chart on mount: 2.5s ease-out after a 0.5s delay.
const CHART_DRAW_MS = 2500;
const CHART_DRAW_DELAY_MS = 500;

import { format } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/lib/format-euro";
import type { CreatorPostDto } from "../../schemas";

const HEIGHT = 180;

// "Reach across recent posts": impressions per post, oldest to newest.
export function ReachChartCanvas({ posts }: { posts: CreatorPostDto[] }) {
  const data = posts
    .slice()
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt))
    .map((p) => ({ date: format(new Date(p.postedAt), "d MMM"), reach: p.impressions }));
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No public posts analyzed yet.</p>;
  return (
    <figure aria-label="Reach across recent posts" className="h-45 w-full">
      <ResponsiveContainer width="100%" height={HEIGHT}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis tickFormatter={(v: number) => formatCompact(v)} width={40} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
            formatter={(value) => [formatCompact(Number(value)), "Reach"]}
          />
          <Line type="monotone" dataKey="reach" stroke="var(--brand)" strokeWidth={2} dot={{ r: 4, fill: "var(--brand)", strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive animationBegin={CHART_DRAW_DELAY_MS} animationDuration={CHART_DRAW_MS} animationEasing="ease-out" />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
