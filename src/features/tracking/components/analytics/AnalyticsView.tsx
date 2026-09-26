"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import type { CreatorClickRow, PublicPostDto, PublicSnapshot, TrackedLinkPerformance } from "@/features/tracking/server/creator-queries";
import { clickRows, followerRows, postRows } from "./analytics-trails";
import { AnalyticsChartCard, type Metric } from "./AnalyticsChartCard";
import { clicksByDay, postSeries } from "./analytics-series";
import { ChartEmpty } from "./ChartEmpty";
import { TrackedLinks } from "./TrackedLinks";

type Props = { snapshot: PublicSnapshot; posts: PublicPostDto[]; links: TrackedLinkPerformance[]; clicks: CreatorClickRow[]; clickTotal: number };
type Open = { title: string; total: string; rows: TrailRow[] } | null;

// Two blocks: one chart card holding every figure (pick one, its line draws,
// its rows open), and the tracked links. Posts live in the chart and its rows.
export function AnalyticsView({ snapshot: s, posts, links, clicks, clickTotal }: Props) {
  const t = useTranslations("creator.analytics");
  const tt = useTranslations("creator.trail");
  const format = useFormatter();
  const [open, setOpen] = useState<Open>(null);
  const n = (v: number) => format.number(v);
  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" });
  const tv = (k: string) => tt(`values.${k}`);
  const byPost = (pick: (p: PublicPostDto) => number) => postRows(posts, (p) => n(pick(p)));
  const trailOf = (title: string, value: number, rows: TrailRow[]) => () => setOpen({ title: tt("title", { metric: title, count: rows.length }), total: n(value), rows });
  type Spec = { key: string; value: number; rows: TrailRow[]; title: string; points: Metric["points"]; hint?: string };
  const metric = ({ key, value, rows, title, points, hint }: Spec): Metric =>
    ({ key, label: t(`metrics.${key}`), value, hint, tone: key === "clicks" ? "money" : "ink", points, onOpen: trailOf(title, value, rows) });
  const metrics = [
    metric({ key: "followers", value: s.followers, rows: followerRows(s, (k, v) => t(`trail.${k}`, v), date), title: t("trail.followers"), points: null }),
    metric({ key: "posts", value: s.posts, rows: postRows(posts, (p) => date(p.postedAt)), title: t("trail.posts"), points: postSeries(posts, "count") }),
    metric({ key: "reach", value: s.reach, rows: byPost((p) => p.impressions), title: t("trail.reach"), points: postSeries(posts, "reach"), hint: t("metrics.postsWithReach", { count: s.postsWithReach }) }),
    metric({ key: "engagements", value: s.engagements, rows: byPost((p) => p.reactions + p.comments + p.reposts), title: t("trail.engagements"), points: postSeries(posts, "engagements") }),
    metric({ key: "clicks", value: clickTotal, rows: clickRows(clicks, tv), title: t("trail.clicksAll"), points: clicksByDay(clicks) }),
  ];
  const openLink = (l: TrackedLinkPerformance) => trailOf(t("trail.clicksCampaign", { campaign: l.campaign }), l.clicks, clickRows(clicks.filter((c) => c.collaborationId === l.collaborationId), tv))();
  return (
    <div className="grid gap-6">
      <p className="text-caption text-ink-muted">{t("stubLabel")}</p>
      <AnalyticsChartCard metrics={metrics} empty={(key) => <ChartEmpty postBased={key !== "clicks"} />} />
      <TrackedLinks links={links} onOpen={openLink} />
      <TrailDrawer open={open !== null} onOpenChange={(v) => !v && setOpen(null)} title={open?.title ?? ""} total={open?.total ?? ""} rows={open?.rows ?? []} emptyText={tt("empty.body")}
        formatTime={(iso) => format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
    </div>
  );
}
