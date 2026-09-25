import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { AnalyticsView } from "@/features/tracking/components/analytics/AnalyticsView";
import { RangeSelect } from "@/features/tracking/components/analytics/RangeSelect";
import { ANALYTICS_RANGES, type AnalyticsRange, getPublicPosts, getPublicSnapshot, getTrackedLinkPerformance, listCreatorClicks } from "@/features/tracking/server/creator-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Analytics · ${BRAND.wordmark}` };

export default async function CreatorAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const creatorId = viewer.creator.id;
  const [{ range: raw }, t] = await Promise.all([searchParams, getTranslations("creator.analytics")]);
  const range: AnalyticsRange = (ANALYTICS_RANGES as readonly string[]).includes(raw ?? "") ? (raw as AnalyticsRange) : "all";
  const header = <PageHeader title={t("title")} description={t("description")} actions={<RangeSelect value={range} />} />;
  let data;
  try {
    data = await Promise.all([getPublicSnapshot(creatorId, range), getPublicPosts(creatorId, range), getTrackedLinkPerformance(creatorId), listCreatorClicks(creatorId, range)]);
  } catch (error) {
    console.error("[analytics] creator analytics failed", { creatorId, range, error });
    return <>{header}<ErrorState body={t("error.body")} retryHref="/creator/analytics" /></>;
  }
  const [snapshot, posts, links, clicks] = data;
  // All time: the per-link counts are exact. A range: count the rows in it.
  const clickTotal = range === "all" ? links.reduce((sum, l) => sum + l.clicks, 0) : clicks.length;
  return (
    <>
      {header}
      <AnalyticsView snapshot={snapshot} posts={posts} links={links} clicks={clicks} clickTotal={clickTotal} />
    </>
  );
}
