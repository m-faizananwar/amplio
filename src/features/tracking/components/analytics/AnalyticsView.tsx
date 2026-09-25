"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import { StatCard } from "@/components/ui/stat-card";
import type { CreatorClickRow, PublicPostDto, PublicSnapshot, TrackedLinkPerformance } from "@/features/tracking/server/creator-queries";
import { clickRows, followerRows, postRows } from "./analytics-trails";
import { PostsTable } from "./PostsTable";
import { TrackedLinks } from "./TrackedLinks";

type Props = { snapshot: PublicSnapshot; posts: PublicPostDto[]; links: TrackedLinkPerformance[]; clicks: CreatorClickRow[]; clickTotal: number };
type Open = { title: string; total: string; rows: TrailRow[] } | null;

// Five numbers, each opening the rows it is made of, then the links and posts.
export function AnalyticsView({ snapshot: s, posts, links, clicks, clickTotal }: Props) {
  const t = useTranslations("creator.analytics");
  const tt = useTranslations("creator.trail");
  const format = useFormatter();
  const [open, setOpen] = useState<Open>(null);
  const n = (v: number) => format.number(v);
  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" });
  const tv = (k: string) => tt(`values.${k}`);
  const byPost = (pick: (p: PublicPostDto) => number) => postRows(posts, (p) => n(pick(p)));
  const metrics = [
    { key: "followers", value: s.followers, rows: followerRows(s, (k, v) => t(`trail.${k}`, v), date), title: t("trail.followers") },
    { key: "posts", value: s.posts, rows: postRows(posts, (p) => date(p.postedAt)), title: t("trail.posts") },
    { key: "reach", value: s.reach, rows: byPost((p) => p.impressions), title: t("trail.reach"), hint: t("metrics.postsWithReach", { count: s.postsWithReach }) },
    { key: "engagements", value: s.engagements, rows: byPost((p) => p.reactions + p.comments + p.reposts), title: t("trail.engagements") },
    { key: "clicks", value: clickTotal, rows: clickRows(clicks, tv), title: t("trail.clicksAll") },
  ];
  const openLink = (l: TrackedLinkPerformance) => {
    const rows = clickRows(clicks.filter((c) => c.collaborationId === l.collaborationId), tv);
    setOpen({ title: t("trail.clicksCampaign", { campaign: l.campaign }), total: n(l.clicks), rows });
  };
  return (
    <div className="grid gap-6">
      <p className="text-caption text-ink-muted">{t("stubLabel")}</p>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label={t("title")}>
        {metrics.map((m) => (
          <StatCard key={m.key} label={t(`metrics.${m.key}`)} value={m.value} hint={m.hint} format={n} tone={m.key === "clicks" ? "money" : "ink"} openLabel={t("metrics.openTrail")}
            onOpen={() => setOpen({ title: tt("title", { metric: m.title, count: m.rows.length }), total: n(m.value), rows: m.rows })} />
        ))}
      </section>
      <TrackedLinks links={links} onOpen={openLink} />
      <PostsTable posts={posts} />
      <TrailDrawer open={open !== null} onOpenChange={(v) => !v && setOpen(null)} title={open?.title ?? ""} total={open?.total ?? ""} rows={open?.rows ?? []} emptyText={tt("empty.body")}
        formatTime={(iso) => format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
    </div>
  );
}
