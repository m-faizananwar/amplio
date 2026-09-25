"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { DrawnChart } from "@/components/motion/DrawnChart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/lib/format-euro";
import type { CreatorPostDto } from "../../schemas";

const HEIGHT = 180;

// Estimated views per recent post, oldest to newest. Draws in like every
// other line chart (DrawnChart), so reduced motion shows the finished line.
export function ReachChartCanvas({ posts }: { posts: CreatorPostDto[] }) {
  const t = useTranslations("brand.creators.profile.posts.chart");
  const data = posts
    .slice()
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt))
    .map((p) => ({ date: format(new Date(p.postedAt), "d MMM"), reach: p.impressions }));
  if (data.length === 0) return <p className="text-small text-ink-muted">{t("empty")}</p>;
  return (
    <DrawnChart replayKey={data.length} className="h-45 w-full" role="img" aria-label={t("label")}>
      <ResponsiveContainer width="100%" height={HEIGHT}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis tickFormatter={(v: number) => formatCompact(v)} width={40} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
            formatter={(value) => [formatCompact(Number(value)), t("tooltip")]}
          />
          <Line type="monotone" dataKey="reach" stroke="var(--brand)" strokeWidth={2} dot={{ r: 4, fill: "var(--brand)", strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DrawnChart>
  );
}
